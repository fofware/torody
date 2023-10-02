import app from './app';
import {Server as WebSocketServer} from 'socket.io'
import http from 'http';
import { connectMongodb, store } from './dbConnect';
import sockets from './sockets';
import config  from './config';
//import * as qrcode from 'qrcode-terminal';
//import * as fs from 'fs';

const database = async () => {
  const store = await connectMongodb();
  return store;
}

const main = async () => {
  const port = config.app_port || 3000;
  const server = http.createServer(app);
  const httpServer = server.listen(port, () => console.log('server listening on port ' + port));
  const io = new WebSocketServer( httpServer, {
    cors: {
      origin: '*',
      methods:['GET','POST','PUT','DELETE'],
    }
  });
  app.set('io',io)
  sockets(io);
}

database().then( async (store) => {
  if (store){
    console.log('MongoStore Ok!!!')
    app.set('store',store);
    console.log("Setting Up Server")
    await main();
  } else {
    console.log("Error")
  }
})
