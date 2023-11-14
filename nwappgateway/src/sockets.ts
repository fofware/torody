import { Socket } from "socket.io";
import fs from 'fs';
import config from "./config";
import jwt from "jsonwebtoken";
import { Buttons, Client, List, LocalAuth, Location, Message, RemoteAuth } from 'whatsapp-web.js';
import { v4 as uuidv4 } from 'uuid';
import phones from "./models/phones";
import { response } from "express";
import { WAG_Client, WAG_Clients } from "./wapplib";

//import { newGateway, storedGateway } from "./wappgateway";

/*
let client:Client;
const registro = async (registered:Client, socket:Socket) =>{
  console.log('registered',registered)
  if (registered){
    //console.log(registered);
    const dataPath = registered['authStrategy']?.dataPath;
    console.log('----------------------------------------');
    console.log(registered.info.wid.user);
    console.log('----------------------------------------');

    const phoneExist = await phones.findOne({phone: registered.info.wid.user});
    console.log('phoneExist',phoneExist)

    if (phoneExist){
      //socket.emit('error', `El número ${registered.info.wid.user} ya está registrado en el sistema`);
      registered.destroy();
      console.log('aca tiene que borrar',`${dataPath}/session-${socket.data.sessionId}`);
      fs.rmSync(`${dataPath}/session-${socket.data.sessionId}`, { recursive: true, force: true  });
      console.log("Borró", `${dataPath}/session-${socket.data.sessionId}`);
    } else {
      socket.data.phone = registered.info.wid.user;
      console.log('----------------------------------------');
      console.log('Registrando nuevo Nro',registered.info.wid.user);
      console.log('----------------------------------------');
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
      console.log('-------****************-------------')
      console.log('-------****************-------------')
      console.log('-------****************-------------')
      console.log('socket.data',socket.data);
      console.log('Iniciando Nuevo Cliente')
      console.log('-------****************-------------')
      console.log('-------****************-------------')
      console.log('-------****************-------------')

      WAG_Clients[data.phone] = new WAG_Client( socket, data );
      await WAG_Clients[data.phone].client.initialize();
  

      //
      //const nuevo:Client = await storedGateway(socket.data);
      //const chats = await nuevo.getChats();
      //const tosave = [];
      //const limit = 15000
      //for (let i = 0; i < chats.length; i++) {
      //  const e = chats[i];
      //  e['messages'] = await e.fetchMessages( { limit } );
      //  e['messages'].map( async (m:any) =>{
      //    tosave.push( saveMsg(m) );
      //  })
      //}
      //const results = await Promise.all(tosave);
      ////console.log(results);
      //console.log('grabó todos los messages', results.length);
      ////console.log('aca tiene que borrar',oldDir);
      ////fs.rmSync(`${dataPath}${oldDir}`, { recursive: true, force: true  });
      ////console.log('Borró',oldDir);
      //
    }
  }

}
*/
export default (io:any) => {
  const documents = {};
  const decodeToken = (token) => {
    if (!token) return {}
    return jwt.verify( token, config.jwtSecret);
    
    //return JSON.parse(decodeURIComponent(atob(token.split('.')[1]).split('').map(function(c) {
    //  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    //}).join('')));
    
  }
  const wapp = (phone:string) => {
    return WAG_Clients[phone];
  }

  const setSkt = (socket:Socket,user) => {
    socket.data.user = user._id;
    socket.data.email = user.email;
    //socket.data.nickname = user.nickname;
    //socket.data.nombre = user.nombre;
    //socket.data.apellido = user.apellido;
    //socket.data.rooms = [`${user._id}`];
    //socket.data.name = user.name;
    //socket.data.sktId = socket.id;
    //socket.join(`${user._id}`)
    //socket.data.previus = `${user._id}`;
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
        const token:any = socket.handshake.query.token;
        const payload:any = jwt.verify( token, config.jwtSecret);
        setSkt(socket,payload);
        const ownerPhoneList = await phones.find({user: payload._id});
        ownerPhoneList.map( async j => {
          console.log(`owner of ${j.phone} joined`);
          await socket.join(j.phone);
          socket.emit('joinedTo', j);
        });
      } else {
        socket.emit('no-authorized','no-authorized')
        socket.disconnect(true);
      }
    } catch (error) {
      console.log("INVALID TOCKEN")      
      socket.emit('no-authorized','no-authorized')
      socket.disconnect(true);
    }
    socket.on('pingtoall', async () => {
      const d = new Date().toISOString()
      await io.emit('pongtoall', 'wapiSrv',d)
    });
    socket.on('ping', async () => {
      console.log('onping')
      socket.emit('pong');
    });

    socket.onAny((...args)=>{
      console.warn('-------- onAny ---------');
      console.log(args);
      //socket.emit('onAny')
    });
    socket.on('wappClient', async (args) => {
      console.log('*** wappClient ***');
      console.log(args);
      try {
        const data:WAG_Client = WAG_Clients[args[0]];
        data.emitSkt(args[1],await data.client[args[1]](...args.splice(0,2)));
          
      } catch (error) {
        console.log('*** wappClient ***');
        console.log(args);
        console.log(error);
      }
    });
    socket.on('registranumero', async (token) => {
      console.log('************ Registra Celular ************')
      const nclient:any = new WAG_Client(socket,socket.data,true);
      nclient.client.initialize();
    });

    socket.on('authorizenumero', async (phone) => {
      console.log('************ Autoriza Celular ************')
      console.log(phone);
    });

    socket.on("disconnect", () => {
      console.warn('Desconecto');
    });
    socket.on('getChats', async (phone) => {
      try {
        const data:WAG_Client = WAG_Clients[phone];
        data.emitSkt('chats',await data.client.getChats());

      } catch (error) {
        console.log(error);
        console.log(phone);        
      }
    })
    socket.on('getContacts', async (phone) => {
      try {
        const data:WAG_Client = WAG_Clients[phone];
        data.emitSkt('contacts',await data.client.getContacts());
      } catch (error) {
        console.log(error);
        console.log(phone);        
      }
    })

    console.log(`Socket ${socket.id} has connected`);
      
  });
}
/**
 * Client Functions()
 ** 
 * acceptGroupV4Invite(inviteInfo)
 * acceptInvite(inviteCode)
 * addOrRemoveLabels(labelIds, chatIds)
 * approveGroupMembershipRequests(groupId, options)
 * archiveChat()
 * createGroup(title, participants, options)
 * deleteProfilePicture()
 * destroy()
 * getBlockedContacts()
 * getChatById(chatId)
 * getChatLabels(chatId)
 * getChats()
 * getChatsByLabelId(labelId)
 * getCommonGroups(contactId)
 * getContactById(contactId)
 * getContacts()
 * getCountryCode(number)
 * getFormattedNumber(number)
 * getGroupMembershipRequests(groupId)
 * getInviteInfo(inviteCode)
 * getLabelById(labelId)
 * getLabels()
 * getNumberId(number)
 * getProfilePicUrl(contactId)
 * getState()
 * getWWebVersion()
 * initialize()
 * isRegisteredUser(id)
 * logout()
 * markChatUnread(chatId)
 * muteChat(chatId, unmuteDate)
 * pinChat()
 * rejectGroupMembershipRequests(groupId, options)
 * resetState()
 * searchMessages(query[, options])
 * sendMessage(chatId, content[, options])
 * sendPresenceAvailable()
 * sendPresenceUnavailable()
 * sendSeen(chatId)
 * setDisplayName(displayName)
 * setProfilePicture(media)
 * setStatus(status)
 * unarchiveChat()
 * unmuteChat(chatId)
 * unpinChat()
 */
