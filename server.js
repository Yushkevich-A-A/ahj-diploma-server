const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const  Router = require('koa-router');
const json = require('koa-json');
const WS = require('ws');
const router = new Router();
const app = new Koa();
const uuid = require('uuid');
const { db } = require('./DB/db');

app.use( koaBody({
  urlencoded: true,
  multipart: true,
}));

app.use(json());

app.use( async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*' };

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
const wsServer = new WS.Server({
  server
});

// router.post('/', async (ctx) => {
//   const { nickname } = ctx.request.body;
//   if(db.existUser(nickname)) {
//     ctx.response.body = { status: false };
//     return;
//   }
//   // db.add(nickname);
//   // chat.length = 0;
//   console.log(chat)
//   // console.log(nickname)
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

app.use(router.routes()).use(router.allowedMethods());

wsServer.on('connection', (ws) => {
  ws.on('message', (e) => {
    const data = JSON.parse(e)
    console.log(data);

    data.data.id = uuid.v4();
    db.addNewPosts(data);

    Array.from(wsServer.clients)
    .filter(client => client.readyState === WS.OPEN)
    .forEach(client => client.send(JSON.stringify({
      status: 'message',
       data: data,
     })));
  });

  ws.send(JSON.stringify({
    status: 'init',
     data: db.postsList,
   }));
});

server.listen(port);
