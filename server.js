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

for (let i = 0 ; i < 15 ; i++) {
  const obj = {
    type: 'text',
    data: {
        content: faker.lorem.sentence(),
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

  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method !== 'OPTIONS') {
    // console.log('! OPTIONS');
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

// router.get('/public/:name', (ctx) => {
//   const file = ctx.request.files.file;
//   const body = JSON.parse(ctx.request.body.textData);
//   const linkSourse = await downloadMedia(file);
//   body.data.content.link = linkSourse

//   db.addNewPosts(body)
//   ctx.response.body = {status: 'ok'};
// });

router.post('/text', (ctx) => {
    const item = JSON.parse(ctx.request.body);
    console.log(item)
    db.addNewPosts(item);
    ctx.response.body = {status: 'ok'};
});

router.post('/media', async (ctx) => {
  const file = ctx.request.files.file;
  const body = JSON.parse(ctx.request.body.textData);
  const linkSourse = await downloadMedia(file);
  body.data.content.link = linkSourse

  db.addNewPosts(body)
  ctx.response.body = {status: 'ok'};
});

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
















// const wsServer = new WS.Server({
//   server
// });

// wsServer.binaryType = 'arraybuffer';


// router.post('/', async (ctx) => {
//   const { nickname } = ctx.request.body;
//   if(db.existUser(nickname)) {
//     ctx.response.body = { status: false };
//     return;
//   }
//   // db.add(nickname);
//   // chat.length = 0;
  // console.log(chat)
  // console.log(nickname)
//   ctx.response.body = {
//      status: true,
//      users: db.data,
//      chat: chat,
//     };

// })

// router.get('/', (ctx) => {
//     ctx.response.body = {
//      status: true,
//       data: db.postsList,
//     };

// })

// wsServer.on('connection', (ws) => {
//   ws.on('message', (e) => {
//     // const data = JSON.parse(e)
//     console.log('данные пришли')
//     downloadFile(e);
//     // if (data.type === 'image' || data.type === 'video' || data.type === 'audio') {
//     //   downloadFile(data.data.content.sourse);
//     // }
//     // const sendData = db.addNewPosts(data);

//     // Array.from(wsServer.clients)
//     // .filter(client => client.readyState === WS.OPEN)
//     // .forEach(client => client.send(JSON.stringify({
//     //   status: 'message',
//     //    data: sendData,
//     //  })));
//   });

//   ws.send(JSON.stringify({
//     status: 'init',
//      data: db.getPosts(),
//    }));
// });



// async function downloadFile(data) {
//   console.log(data);
//   // const byteArray = new Buffer(data.sourse.replace(/^[\w\d;:\/]+base64\,/g, ''), 'base64');
//   // const sendFile = new File([byteArray], data.fileName, {type: data.filetype});
  
//   // async () => {
//   //   const getResponse = await fetch(data.sourse);
//   //   const blob = await getResponse.blob();
//   //   const file = new File([blob], data.fileName, {type: data.filetype});
//   //   return file;
//   // }

//   // const sendFile = Buffer.from(data.sourse)
//   // console.log(sendFile);
//   let i = new Uint8Array(data);

//   i = data;

//   const link = await new Promise((resolve, reject) => {
//     const oldPath =  i;
//     const fileName = "newf.jpg";
//     const newPath = path.join(public, fileName);

//     const callback = (error) => reject(error);

//     const readStream = fs.createReadStream(oldPath);
//     const writeStream = fs.createWriteStream(newPath);

//     readStream.on('error', callback);
//     writeStream.on('error', callback);

//     writeStream.on('close', () => {
//       fs.unlink(oldPath, callback);
//       // console.log('close');
//       resolve(fileName);
//     });

//     readStream.pipe(writeStream);
//   });
// }
