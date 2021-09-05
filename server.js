const http = require('http');
const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const koaBody = require('koa-body');
const  Router = require('koa-router');
const json = require('koa-json');
const koaStatic = require('koa-static');
const { streamEvents } = require('http-event-stream');
const router = new Router();
const app = new Koa();

const { db } = require('./DB/db');
const faker = require('faker');

const public = path.join(__dirname, '/public');

for (let i = 0 ; i < 50 ; i++) {
  const obj = {
    type: 'text',
    data: {
        content: {
          text: faker.lorem.sentence()
        },
        date: faker.date.past(),
    }
  }
  db.addNewPosts(obj);
}

app.use( koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

app.use( koaStatic(public));

app.use(json());

app.use( async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*'};

  if (ctx.request.method !== 'OPTIONS') {
    console.log('! OPTIONS');
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
})

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());


app.use(router.routes()).use(router.allowedMethods());

// подключение к серверу

router.get('/sse', async (ctx) => {
  streamEvents(ctx.req, ctx.res, {
    async fetch(lastEventId) {
      console.log(lastEventId);
      return [];
    },
    stream(sse) {
      db.listen( item => {
        sse.sendEvent({
          data: JSON.stringify(item),
        });
      });
      return () => {};
    }
  });
  db.initSendPosts();
  ctx.respond = false;
});

// ленивая подгрузка постов

router.get('/previousposts/:id', (ctx) => {
  const indexLastDownloadedPost = ctx.params.id;
  const data =  db.getPosts(ctx.params.id);
  if (data.length === 0) {
    ctx.response.body = {status: false};
    return;
  }
  ctx.response.body = {status: 'ok', data: data};
});

// скачивание медиа файла

router.get('/download/:filename', (ctx) => {
  const filname = ctx.params.filename;
  const filepath = path.join(public, filname)
  console.log(filepath)

  const readStream = fs.readFileSync(filepath);
  console.log(readStream);
  ctx.response.body = readStream;
});

// сохранение текстовых данных

router.post('/text', (ctx) => {
    const item = JSON.parse(ctx.request.body);
    db.addNewPosts(item);
    ctx.response.body = {status: 'ok'};
});

// сохранение медиа данных

router.post('/media', async (ctx) => {
  const file = ctx.request.files.file;
  const body = JSON.parse(ctx.request.body.textData);
  const linkSourse = await downloadMedia(file);
  body.data.content.link = linkSourse;
  db.addNewPosts(body)
  ctx.response.body = {status: 'ok'};
});

// скачивание медиа 

async function downloadMedia(file) {
  const link = await new Promise((resolve, reject) => {
    const oldPath = file.path;
    const fileName = file.name;
    const newPath = path.join(public, fileName);

    const callback = (error) => reject(error);

    const readStream = fs.createReadStream(oldPath);
    const writeStream = fs.createWriteStream(newPath);

    readStream.on('error', callback);
    writeStream.on('error', callback);

    writeStream.on('close', () => {
      fs.unlink(oldPath, callback);
      console.log('close');
      resolve(fileName);
    });

    readStream.pipe(writeStream);
  });
  return link;
}

server.listen(port);