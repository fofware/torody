import { Namespace, Socket } from "socket.io";
import phones from "./models/phones";
import { Client } from 'whatsapp-web.js';
import { saveMsg } from "./wappgateway";
import fs from 'fs';
import config from "./config";
import jwt from "jsonwebtoken";

import { newGateway, storedGateway } from "./wappgateway";

export default (io:any) => {
  const documents = {};
  const decodeToken = (token) => {
    if (!token) return {}
    return jwt.verify( token, config.jwtSecret);
    /*
    return JSON.parse(decodeURIComponent(atob(token.split('.')[1]).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')));
    */
  }

  const setSkt = (socket:Socket,user) => {
    socket.data.user = user._id;
    socket.data.parent = user.parent;
    socket.data.email = user.email;
    socket.data.nickname = user.nickname;
    socket.data.nombre = user.nombre;
    socket.data.apellido = user.apellido;
    socket.data.rooms = [`${user._id}`];
    socket.data.name = user.name;
    socket.data.sktId = socket.id;
//    socket.join(`${user._id}`)
    socket.data.previus = `${user._id}`;
  }
/**
 * Tengo que aprender como usar esto
 *  
 */
//  io.use( async (socket, next) => {
//    try {
//      if (socket.handshake.query && socket.handshake.query.token){
//        const token:any = socket.handshake.query.token;
//        const payload = jwt.verify( token, config.jwtSecret);
//        socket.decode = payload;
////        setSkt(socket,payload);
//        socket.emit('enuse',`Algo ${socket.id}`)
//        console.log('--------------------------------------------------------')
//        console.log(socket.id)
//        console.log(socket.decode);
//        console.log('--------------------------------------------------------')
//  
//      }      
//
//    } catch (error) {
//      console.log('--------------------------------------------------------')
//      console.log('fallo la Athentication')
//      console.log(error)
//      console.log('--------------------------------------------------------')
//    }
//  })

  io.on('connection', async (socket:Socket) => {
    console.log("Nueva coneccion");
    console.log(socket.id);
    try {
      if(socket.handshake.query && socket.handshake.query.token){
        //const user = decodeToken(socket.handshake.query.token);
        const token:any = socket.handshake.query.token;
        const payload = jwt.verify( token, config.jwtSecret);
        socket['decode'] = payload;
        
        console.log(payload);
        setSkt(socket,payload);
        socket.join('5493624380337');
        socket.join('5493624683656');
      } else {
        socket.join('no-authorized');
        socket.emit('no-authorized','no-authorized')
        socket.disconnect(true);
        return;
      }
    } catch (error) {
      console.log("INVALID TOCKEN")      
    }

    socket.on('pingtoall', async () => {
      const d = new Date().toISOString()
      io.emit('pongtoall', 'wapiSrv',d)
    })
    socket.on('ping', () => {
      console.log('onping')
      socket.emit('pong');
    })

    socket.onAny((...args)=>{
      console.warn('-------- onAny ---------');
      console.log(args);
      //socket.emit('onAny')
    });

    socket.on('registranumero', async (token) => {
      console.log('************ Registra Celular ************')
      //console.log(socket.data);
      try {
        const registered:Client = await newGateway(socket);
        console.log(registered);
        if (registered){
          const dataPath = registered['authStrategy']?.dataPath;
          const phoneExist = await phones.findOne({phone: registered.info.wid.user});
          console.log('phoneExist',phoneExist)
          //da2e98e5-f6a7-4f47-a9d3-1584732658e8
          if (phoneExist){
            socket.emit('error', `El número ${registered.info.wid.user} ya está registrado en el sistema`);
            registered.destroy();
            console.log('aca tiene que borrar',`${dataPath}/session-${socket.data.sessionId}`);
            fs.rmSync(`${dataPath}/session-${socket.data.sessionId}`, { recursive: true, force: true  });
            console.log("Borró", `${dataPath}/session-${socket.data.sessionId}`);
          } else {
            socket.data.phone = registered.info.wid.user;
  
            await registered.destroy();
  
            //const oldDir = `/session-${socket.data.user}`;
            //const newDir = `/session-${socket.data.user}_${socket.data.phone}`;
            //console.log('old', oldDir);
            //console.log('new', newDir);
            //fs.renameSync(`${dataPath}${oldDir}`,`${dataPath}${newDir}`);
            //console.log('renombró',oldDir,' a ',newDir);
  
            socket.data.activo = true;
            const filter = {
              phone: socket.data.phone,
              user: socket.data.user
            }
            
            const data = {
              phone: socket.data.phone,
              user: socket.data.user,
              sessionId: socket.data.sessionId,
              rooms: socket.data.rooms,
              activo: true
            }
            
            let ret = await phones.findOneAndUpdate({ number: socket.data.phone, user: socket.data.user },   // Query parameter
              socket.data, 
              {
                new: true,
                upsert: true,
                //rawResult: true // Return the raw result from the MongoDB driver
              });
  
            //ret.value instanceof phones; // true
            // The below property will be `false` if MongoDB upserted a new
            // document, and `true` if MongoDB updated an existing object.
            // ret.lastErrorObject.updatedExisting; // false
            
            console.log(socket.data);
  
            const nuevo:Client = await storedGateway(socket.data);
            const chats = await nuevo.getChats();
            const tosave = [];
            const limit = 15000
            for (let i = 0; i < chats.length; i++) {
              const e = chats[i];
              e['messages'] = await e.fetchMessages( { limit } );
              e['messages'].map( async (m:any) =>{
                tosave.push( saveMsg(m) );
              })
            }
            const results = await Promise.all(tosave);
            //console.log(results);
            console.log('grabó todos los messages', results.length);
            //console.log('aca tiene que borrar',oldDir);
            //fs.rmSync(`${dataPath}${oldDir}`, { recursive: true, force: true  });
            //console.log('Borró',oldDir);
          }
        }
      } catch (error) {
        console.log(error);
      }
    });

    socket.on('authorizenumero', async (phone) => {
      console.log('************ Autoriza Celular ************')
      console.log(phone);
      const registered:any = await storedGateway(phone);
    });

    socket.on('getChats', async (phone) => {
      await socket.leave(socket.data.previus)
      await socket.join(phone)
      console.log(`joined to ${phone}`);
    });

    /**
     * esto es para un chat de demo
     */

    let previousId;
    const safeJoin = async currentId => {
      socket.leave(previousId);
      await socket.join(currentId);
      console.log(`Socket ${socket.id} joined room ${currentId}`);
      previousId = currentId;
    };
    socket.on('setData', params => {
      console.log( params );
    });
    socket.on("getDoc", docId => {
      safeJoin(docId);
      socket.emit("document", documents[docId]);
    });
    socket.on("addDoc", doc => {
      documents[doc.id] = doc;
      safeJoin(doc.id);
      io.emit("documents", Object.keys(documents));
      socket.emit("document", doc);
    });

    socket.on("editDoc", doc => {
      documents[doc.id] = doc;
      socket.to(doc.id).emit("document", doc);
    });
    console.log(Object.keys(documents))
    io.emit("documents", Object.keys(documents));

    console.log(`Socket ${socket.id} has connected`);
  
    /*
    socket.onAny((eventName:string, ...args: any) => {
      console.log(`eventName:${eventName}`,args);
    });
    */
    socket.on("disconnect", () => {
      console.warn('Desconecto');
    });
      
  });
}

