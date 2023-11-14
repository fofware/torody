
import { Buttons, Client, List, LocalAuth, Location, Message, RemoteAuth } from 'whatsapp-web.js';
import { Router } from 'express';
import app from './app';
import { Socket } from 'socket.io';
import fs from 'fs';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { WAG_Client, WAG_Clients } from './wapplib';
import whatsapp from './models/whatsapp';
import wappphone from './models/phones';
import wapproutes  from './models/routes';

//export const gateways = {}


//let io;

/*
import { MongoStore } from 'wwebjs-mongo';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI!);
const store = new MongoStore({ mongoose });
const client = new Client({
    authStrategy: new RemoteAuth({
        store,
        backupSyncIntervalMs: 300000, // in ms, minimum interval starts at 60000
        clientId: `your-client-id`, // I would say it's required
        dataPath: './your_sessions_path/', // optional
    }),
    restartOnAuthFail: true, // optional
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            // other node args
        ],
    },
});
client.initialize();
*/
export const initAllWapp = async (app) =>{
  await wapproutes.deleteMany({});
  const array = await wappphone.find({activo: true});
  const io = app.get('io');
  const router: Router = Router();
  const totalini = new Date();
  for (let index = 0; index < array.length; index++) {
    const p:any = array[index];
    const nclient:any = new WAG_Client(io,p);
    nclient.client.initialize();
  }

  const totalend = new Date();
  const totaldif = totalend.getTime()-totalini.getTime();
  console.log('termino con todos');
  console.log(totaldif);
  console.log('------------------------------');
  console.log(WAG_Clients)
  app.use(router);
}


/*
export const newGateway = async ( skt:Socket ): Promise< Client | null > => {
  return new Promise(async (resolve, reject) => {
    //console.log('newGateway')
    skt.emit('menssage', 'newGateWay')
    skt.data.sessionId = uuidv4();
    const retries = 5;
    let qrSend = 0

    const client:Client = new Client({
      authStrategy: new LocalAuth(

        {
          //dataPath: './sessions/',
          clientId: skt.data.sessionId,
        },
      ),
      qrMaxRetries: retries,
      puppeteer: {
        args: ['--no-sandbox'],
      }
    });

    client.on('auth_failure', err =>  {
      skt.emit('auth_failure', err)
      console.log('register auth_failure', err);
      resolve(null);
    });

    client.on('authenticated', async (session) => {
      skt.emit('authenticated','New Number authenticated')
      console.log(`New Number authenticated`);
      console.log('ssssssssssssssssssssssssssssssssssssssssss')
      console.log('ssssssssssssssssssssssssssssssssssssssssss')
      console.log('ssssssssssssssssssssssssssssssssssssssssss')
      console.log('session',session);
      console.log('ssssssssssssssssssssssssssssssssssssssssss')
      console.log('ssssssssssssssssssssssssssssssssssssssssss')
      console.log('ssssssssssssssssssssssssssssssssssssssssss')

    });
    client.on('qr', async qr => {
      const qrMaxRetries = client['options']?.qrMaxRetries
      qrSend++;
      console.log(qr, qrSend, qrMaxRetries)
      skt.emit('qr',{qr, qrSend, qrMaxRetries})
      if (qrSend > qrMaxRetries){
        skt.emit('error', "QR no escaneado")
        client.destroy();
        resolve (null)
      } 
    })

    client.on('ready', async (ready) => {
      console.log('register ready',ready)
      console.log(client);
      resolve(client)
      //skt.to(skt.data.rooms).emit('ready',`${client.info.pushname} ${client.info.wid.user} conected & ready`)
    })
    skt.emit('menssage', 'newGateWay initialize')
    try {
      client.initialize();
      //console.log(client)
    } catch (error) {
      console.log(error);
      resolve(null);
    }
  })
}

export const newGateway1 = async ( skt:Socket ): Promise< Client | null > => {
  return new Promise(async (resolve, reject) => {
    //console.log('newGateway')
    skt.emit('menssage', 'newGateWay')
    skt.data.sessionId = uuidv4();
    const retries = 5;
    let qrSend = 0
    console.log(skt.data.sessionId);
    const client:Client = new Client({
      authStrategy: new LocalAuth(
        {
          //dataPath: './sessions/',
          clientId: skt.data.sessionId,
        },
      ),
      qrMaxRetries: retries,
      puppeteer: {
        args: ['--no-sandbox','--disable-setuid-sandbox'],
      }
    });

    client.on('auth_failure', err =>  {
      console.log('client auth_failure')
      skt.emit('auth_failure',err)
      //console.error(err);
      //reject(err)
    });

    client.on('authenticated', async (session) => {
      skt.emit('authenticated','Authenticated');
      console.log('client Authenticated', session);
    });

    client.on('qr', async qr => {
      const qrMaxRetries = client['options']?.qrMaxRetries
      qrSend++;
      console.log(qr, qrSend, qrMaxRetries)
      skt.emit('qr',{qr, qrSend, qrMaxRetries})
      if (qrSend > qrMaxRetries){
        skt.emit('error', "QR no escaneado")
        await client.destroy();
        resolve (null)
      } 
    })

    client.on('ready', async () => {
      console.log('client READY')
      skt.to(skt.data.rooms).emit('ready',`${client.info.pushname} ${client.info.wid.user} conected & ready`)
    })

    client.on('loading_screen', async (percent, message) => {
      console.log('LOADING SCREEN', percent, message);
      //console.log("Client.Info", client );
      //skt.emit('clientInfo',client);
      skt.emit('LOADING SCREEN', percent, message);
    });

    try {
      await client.initialize();
      console.log(client)
      resolve(client)
    } catch (error) {
      console.log(error);
      resolve(null)
      //reject(error);
    }
  })
}

const saveMedia = (client:Client, msg:Message) => {
  return new Promise( async (resolve, reject) => {
    let mediadata:any;
    const d = new Date;
    const timestamp = d.getTime()/1000;

//    //console.log( (d.getTime()/1000), msg.timestamp, timestamp - msg.timestamp );
//    //console.log(msg);
    const fn = `${__dirname}/../mediaReceive/${msg.id._serialized}.json`;

    let existe = fs.existsSync(fn)
    //console.warn('saveMedia', msg.id._serialized, 'hasMedia', msg.hasMedia, 'existe', existe);
    if (!msg.hasMedia){
//      //console.log('Vuelve no medida data')
      existe = false;
    }
    if(msg.hasMedia && !existe){
      let veces = 0;
//      //console.log(msg);
      do {
        mediadata = {};
        try {
          veces++;
          mediadata = await msg.downloadMedia();
        } catch (error) {
          //console.log('msg.downloadMedia(): Error');
          //console.log(error);
        }
//        //console.log('veces', veces, msg.id._serialized, mediadata?.data?.length);
      } while (veces < 4 && !mediadata?.data?.length );
    
//      //console.log('veces', veces, msg.id._serialized, mediadata?.data.length);
////console.warn('length', mediadata?.data?.length)
////console.warn('data', mediadata?.data)
////console.warn('mediadata', mediadata)

      if (mediadata?.data?.length > 0){
          //console.log('graba media data');
          try {
//            //console.log(typeof(mediadata));
//            //console.log(mediadata);
            fs.writeFileSync(fn,JSON.stringify(mediadata),{encoding:"utf8"});
          } catch (error) {
            //console.log('sale por catch error');
            //console.log('mediadata', mediadata);
            //console.log(error);
            existe = false;            
            resolve({existe})
          }
          existe = true;
          resolve({existe})
        } else {
        existe = false;
//        //console.log('no leyó media', `${msg.id._serialized}`)
        resolve({existe})
      }
    } else {
      ////console.log('hasMedia', msg.hasMedia, 'existe', existe, 'no graba');
      resolve({existe})
    }
  })
} 

export const saveMsg = async (m,desde?) => {
  //m['myid'] = m.id.id;
  //m['fromMe'] = m.id.fromMe;
  //const filter = m.id

  try {
    m.serialized = m.id._serialized
    let ret = await whatsapp.findOneAndUpdate(
//      { myid: m.myid, fromMe: m.fromMe, timestamp: m.timestamp, from: m.from, to: m.to},
      { from: m.from, to: m.to, serialized: m.serialized},
      m,
      {
        new: true,
        upsert: true,
        rawResult: true // Return the raw result from the MongoDB driver
      }
    );
    ret.value instanceof whatsapp; // true
    // The below property will be `false` if MongoDB upserted a new
    // document, and `true` if MongoDB updated an existing object.
    ret.lastErrorObject.updatedExisting; // false
    //console.log(ret.lastErrorObject);
    //console.log(m.id,desde);
    ////console.log(ret.value.id, ret.value._id);
    return ret;
  } catch (error) {
    //console.log(m,desde);
    //console.log(error)
  }

}


const showTime = (msg) => {
  if (msg.hasMedia){
    //console.log(`(${msg.id._serialized})`)
    //console.log(`${msg.id.id} (${msg.ack}) - ${msg.orderId}`);
    const tn = new Date();
    const at = tn.toISOString()
    const am = tn.getTime();
    const t = new Date();
    t.setTime(msg.timestamp*1000);
    const ts = t.toISOString();
    //console.log(msg.timestamp, am, ts, at);
  
  }
}
*/
export const setRoutes = async (client:Client) => {
  const router: Router = Router();
  const num  = client.info.wid.user || client.info.me.user;

  router.get(`/${num}/blockedcontactos`, async (req, res) =>{
    const contacts = await client.getBlockedContacts();
    res.status(200).json(contacts);
  })

  router.get(`/${num}/blockedcontactos`, async (req, res) =>{
    const contacts = await client.getBlockedContacts();
    res.status(200).json(contacts);
  })

  router.get(`/${num}/chats`, async (req, res) =>{
    let limit = 100;
    const chats = await client.getChats();
    const contactsToRead = [];
    const picturesToRead = [];
    const msgToRead = [];
    for (let i = 0; i < chats.length; i++) {
      const e = chats[i];
      const limit = e.unreadCount + 20;
      //console.log(limit);
    //  e['messages'] = await e.fetchMessages( {limit} );
    //  //console.log(e['messages']);
      msgToRead.push( e.fetchMessages( {limit} ) );
    //    contactsToRead.push(e.getContact());
    //  //e['contacto'] = await e.getContact();
    //  //e['picUrl'] = await e['contacto'].getProfilePicUrl();
    }
    const msgs = await Promise.all(msgToRead);
    //////console.log(msgs);

//    const contacts = await Promise.all(contactsToRead);

    //const med = [];
    chats.map( async (c,i) => {
    //  msgs[i].map( async (m:Message) => {
    //    if(m.hasMedia) med.push(saveMedia(client,m));
    ////    if(m.hasMedia) await saveMedia(client,m)  
    //  });
      c['messages'] = msgs[i];
    });
    //const mediaData = await Promise.all(med);

    //const mediarslt = await Promise.all(mediaData);

    
    //chats.map( async (c,i) => {
    //  await c['messages'].map( async (m:any,j) => {
    //    let cnt = 0;
    //
    //    let loop = true;
    //    const r = 40;
    //    if( m['hasMedia'] === true ){
    //      //if (m['type'] === 'video'){
    //        do {
    //          ////console.log( '1',!mediarslt[m['mediaIdx']]?.data && cnt < r )
    //          if( !mediarslt[m['mediaIdx']]?.data && cnt < r )
    //          {
    //            mediarslt[m['mediaIdx']] = mediaData[m['mediaIdx']]
    //            cnt++;
    //            ////console.log(cnt);
    //            ////console.log('2',mediarslt[m['mediaIdx']]?.data || cnt >= r);
    //            if( mediarslt[m['mediaIdx']]?.data || cnt >= r ) loop = false;
    //          } else {
    //            loop = false;
    //          }
    //        } while ( loop );
    //
    //        //console.log(i,j,m['mediaIdx'], cnt, loop, mediarslt[m['mediaIdx']]?.data?.length);
    //        cnt = 0;
    //        ////console.log( mediarslt[m['mediaIdx']]);
    //      //}
    //    }
    //  })
    //});
        
    //console.log("envia Chats")
    //res.status(200).json({ chats, mediarslt });
    res.status(200).json({ chats });
  });

  router.get(`/${num}/chats/:limit`, async (req, res) =>{
    const {limit} = req.params
    const myLimit = parseInt(limit)
    const ini = new Date().getTime()
    const chats = await client.getChats();

    const tosave = [];
    const leermsgs = [];
    for (let i = 0; i < chats.length; i++) {
      const e = chats[i];
      leermsgs.push(e.fetchMessages( {'limit': myLimit} ))
      //e['messages'] = await e.fetchMessages( {'limit': myLimit} );
      //e['messages'].map( async (m:any) =>{
      //  tosave.push( WAG_saveMsg(m) );
      //})
      //e['contacto'] = await e.getContact();
      //e['picUrl'] = await e['contacto'].getProfilePicUrl();
    }

    const rsleer = await Promise.all(leermsgs);
    const tmsgs = new Date().getTime() - ini;
    //console.log("leyo los msg", tmsgs)
    let cuenta = 0;
    rsleer.map(msgs => {
      msgs.map( msg  => {
//        tosave.push(WAG_saveMsg(msg));
      });
    });
    
    const results = await Promise.all(tosave)
    const stime = new Date().getTime() - ini
    const ret = {
      modifiedCount: 0,
      upsertedCount: 0,
      total: results.length,
      chats: chats.length,
      msgs: tosave.length,
      tmsgs,
      stime
    }
    
    results.map(r => {
      if(r.lastErrorObject.updatedExisting) ret.modifiedCount++;
      else ret.upsertedCount++
    } )
    
    ////console.log(results);
    res.status(200).json(ret);
  })

  router.get(`/${num}/chat/:serialized`, async (req, res) =>{
    const {serialized} = req.params
    const chat = await client.getChatById(serialized);
    const limit = chat.unreadCount + 10;
    chat['messages'] = await chat.fetchMessages({limit })
    res.status(200).json(chat);
  })

  router.get(`/${num}/mediadata`, async (req, res) => {
    const {message, remote } = req.query;
    const chatId:any = remote ? remote : null;
    const fexist = fs.existsSync(`${__dirname}/../mediaReceive/${message}.json`);
    let fr:any;
    if(fexist){
      fr = JSON.parse(fs.readFileSync(`${__dirname}/../mediaReceive/${message}.json`,{encoding: 'utf8', flag: 'r'}));
      if(!fr?.data){
        const msgs = await client.searchMessages('',{ chatId, limit:15200});
      } 
    }
    //res.set('Content-Type', fr.mimetype);
    //res.set('Content-Length', fr.data.length);
    //const buffer = Buffer.from(fr.data, 'base64');
    res.send(fr);
  });

  //router.get(`/${num}/schat/:serialized`, async ( req, res ) => {
  //  const { serialized } = req.params;
  //  let ret = await whatsapp.find(
  //      { $or: [ { from: serialized, to: `${num}@c.us` }, { from: `${num}@c.us`, to: serialized } ] }
  //  ).sort({timestamp: 1});
  //  res.status(200).json(ret);
  //});

  router.get(`/${num}/chat/:serialized/labels`, async (req, res) =>{
    const {serialized} = req.params
    const value = await client.getChatLabels(serialized);
    res.status(200).json(value);
  })

  router.get(`/${num}/chatsbylabel/:id`, async (req, res) =>{
    const {id} = req.params
    const value = await client.getChatLabels(id);
    res.status(200).json(value);
  })

  router.get(`/${num}/commongroups/:serialized`, async (req, res) =>{
    const {serialized} = req.params
    const value = await client.getCommonGroups(serialized);
    res.status(200).json(value);
  })
  
  //router.post(`/${num}/contacts`, async (req, res) =>{
  //  const filter = {
  //    from: num,
  //    phone: req.body.phone
  //  }
  //  const ret = await wappcontacts.findOneAndUpdate(filter,req.body,{
  //    new: true,
  //    upsert: true
  //  })
  //  res.status(200).json(ret);
  //});

  //router.get(`/${num}/contacts`, async (req, res) =>{
  //  const value = await client.getState();
  //  if( `${value}` !== 'NAVIGATION' ){
  //    const contacts = await client.getContacts()
  //    const datArray = []
  //    contacts.map( async c => {
  //      datArray.push(c.getAbout())
  //      datArray.push(c.getChat())
  //      datArray.push(c.getProfilePicUrl())
  //      datArray.push(c.getFormattedNumber())
  //      datArray.push(c.getCommonGroups())
  //    })
  //    const results = await Promise.all(datArray)
  //    let i = 0;
  //    contacts.map(c => {
  //      c['about'] = results[0+i];
  //      c['chat'] = results[1+i];
  //      c['picUrl'] = results[2+i];
  //      c['fNumber'] = results[3+i];
  //      c['cGroups'] = results[4+i];
  //      i+=5;
  //    })
  //    const tosave = []
  //    contacts.map( c => {
  //      const filter = {
  //        from: client.info.wid.user,
  //        phone: c.id.user
  //      }
  //      const reg = Object.assign({}, filter, c);
  //      tosave.push(wappcontacts.findOneAndUpdate(filter,reg,{
  //        new: true,
  //        upsert: true
  //      }))
  //    })
  //    const ret = await Promise.all(tosave);
  //    res.status(200).json(ret);
  //  } else {
  //    res.status(401).json("WhatsApp no conectado")
  //  }
  //});

  router.get(`/${num}/contact/:serialized`, async (req, res) =>{
    const {serialized} = req.params
    const contact = await client.getContactById(serialized);
    const picUrl = await contact.getProfilePicUrl() 
    res.status(200).json({ contact, picUrl });
  })

  router.get(`/${num}/countrycode/:number`, async (req, res) =>{
    const {number} = req.params
    const value = await client.getCountryCode(number);
    res.status(200).json(value);
  })

  router.get(`/${num}/formattednumber/:number`, async (req, res) =>{
    const {number} = req.params
    const value = await client.getFormattedNumber(number);
    res.status(200).json(value);
  })

  router.get(`/${num}/invitedinfo/:code`, async (req, res) =>{
    const {code} = req.params
    const value = await client.getInviteInfo(code);
    res.status(200).json(value);
  })

  router.get(`/${num}/labels`, async (req, res) =>{
    const value = await client.getLabels();
    res.status(200).json(value);
  })

  router.get(`/${num}/numberid/:number`, async (req, res) =>{
    const {number} = req.params
    const value = await client.getNumberId(number);
    res.status(200).json(value);
  })

  router.get(`/${num}/profilepicurl/:serialized`, async (req, res) =>{
    const {serialized} = req.params
    const value = await client.getProfilePicUrl(serialized);
    res.status(200).json(value);
  })

  router.get(`/${num}/state`, async (req, res) =>{
    const value = await client.getState();
    res.status(200).json(value);
  })

  router.get(`/${num}/wwebversion`, async (req, res) =>{
    const value = await client.getWWebVersion();
    res.status(200).json(value);
  })
  
  // No usar esto no entiendo que hace pero debo rearrancar el programa para que vuelva a funcionar
  //router.get(`/${p.number}/initialize`, async (req, res) =>{
  //  const value = await p.client.initialize();
  //  res.status(200).json(`${p.number} fue inicializado`);
  //})

  router.get(`/${num}/isregistereduser/:id`, async (req, res) =>{
    const { id } = req.params;
    const value = await client.isRegisteredUser(`${id}@c.us`);
    res.status(200).json(value);
  })
  
  router.get(`/${num}/logout`, async (req, res) =>{
    const value = await client.logout();
    res.status(200).json(`${num} fue deslogueado`);
  })
  // No está probada
  router.get(`/${num}/markchatunread/:id`, async (req, res) =>{
    const { id } = req.params;
    const value = await client.markChatUnread(id);
    res.status(200).json(value);
  })

  // No está probada
  /*
  router.get(`/${num}/mutechat/:chatid/:unmutedate`, async (req, res) =>{
    const { chatid, unmutedate } = req.params;
    const value = await client.muteChat(chatid,unmutedate);
    res.status(200).json(value);
  })
  */
  // No está probada
  //router.get(`/${num}/pinchat`, async (req, res) =>{
  //  const value = await client.pinChat();
  //  res.status(200).json(value);
  //})
  // No usar esto no entiendo que hace pero debo rearrancar el programa para que vuelva a funcionar
  //router.get(`/${p.number}/resetstate`, async (req, res) =>{
  //  const value = await p.client.resetState();
  //  res.status(200).json(value);
  //})
  
  // No está probada
  router.get(`/${num}/searchmessages`, async (req, res) =>{
    const query:any = req.query.query;
    const options = {}

    if (req.query?.limit) options['limit'] = parseInt(req.query.limit.toString());
    if (req.query?.page) options['page'] = parseInt(req.query.page.toString());
    if (req.query?.chatid) options['chatId'] = req.query.chatid;

    const value = await client.searchMessages(query,options);
    res.status(200).json(value);
  });

  //router.get(`/${num}/messages`, async (req, res) =>{
  //  const messages = await whatsapp.find({$or:[{from: `${num}@c.us`},{to: `${num}@c.us`}]}).sort({ timestamp: -1}).limit(200)
  //  res.status(200).json(messages);
  //});

  // No está probada
  /*
  router.get(`/${num}/sendmessage`, async (req, res) =>{
    const { chatId, content, options } = req.query;
    const value = await client.sendMessage(chatId, content, options);
    res.status(200).json(value);
  })
  */
  router.get(`/${num}/available`, async (req, res) =>{
    const value = await client.sendPresenceAvailable();
    res.status(200).json('sendPresenceAvailable');
  })

  router.get(`/${num}/unavailable`, async (req, res) =>{
    const value = await client.sendPresenceUnavailable();
    res.status(200).json('sendPresenceUnavailable');
  });

  //await wapproutes.findOneAndUpdate(
  //  {phone: num},
  //  {phone: num}, 
  //  {
  //    new: true,
  //    upsert: true,
  //    rawResult: true // Return the raw result from the MongoDB driver
  //  }
  //);
  //app.use(router);
}

const procesaMsg = async (client:Client, msg:Message) => {
  //console.log(`procesaMsg mensaje desde ${msg.from} para ${client.info.wid.user}`)
  if (msg.body === '!ping reply') {
      // Send a new message as a reply to the current one
      msg.reply('pong');

  } else if (msg.body === '!ping') {
      // Send a new message to the same chat
      client.sendMessage(msg.from, 'pong');

  } else if (msg.body.startsWith('!sendto ')) {
      // Direct send a new message to specific id
      let number = msg.body.split(' ')[1];
      let messageIndex = msg.body.indexOf(number) + number.length;
      let message = msg.body.slice(messageIndex, msg.body.length);
      number = number.includes('@c.us') ? number : `${number}@c.us`;
      let chat = await msg.getChat();
      chat.sendSeen();
      client.sendMessage(number, message);

//  } else if (msg.body.startsWith('!subject ')) {
//      // Change the group subject
//      let chat = await msg.getChat();
//      if (chat.isGroup) {
//          let newSubject = msg.body.slice(9);
//          chat.setSubject(newSubject);
//      } else {
//          msg.reply('This command can only be used in a group!');
//      }
  } else if (msg.body.startsWith('!echo ')) {
      // Replies with the same message
      msg.reply(msg.body.slice(6));
//  } else if (msg.body.startsWith('!desc ')) {
//      // Change the group description
//      let chat = await msg.getChat();
//      if (chat.isGroup) {
//          let newDescription = msg.body.slice(6);
//          chat.setDescription(newDescription);
//      } else {
//          msg.reply('This command can only be used in a group!');
//      }
//  } else if (msg.body === '!leave') {
//      // Leave the group
//      let chat = await msg.getChat();
//      if (chat.isGroup) {
//          chat.leave();
//      } else {
//          msg.reply('This command can only be used in a group!');
//      }
  } else if (msg.body.startsWith('!join ')) {
      const inviteCode = msg.body.split(' ')[1];
      try {
          await client.acceptInvite(inviteCode);
          msg.reply('Joined the group!');
      } catch (e) {
          msg.reply('That invite code seems to be invalid.');
      }
  //} else if (msg.body === '!groupinfo') {
  //    let chat = await msg.getChat();
  //    if (chat.isGroup) {
  //        msg.reply(`
  //            *Group Details*
  //            Name: ${chat.name}
  //            Description: ${chat.description}
  //            Created At: ${chat.createdAt.toString()}
  //            Created By: ${chat.owner.user}
  //            Participant count: ${chat.participants.length}
  //        `);
  //    } else {
  //        msg.reply('This command can only be used in a group!');
  //    }
  } else if (msg.body === '!chats') {
      const chats = await client.getChats();
      client.sendMessage(msg.from, `The bot has ${chats.length} chats open.`);
      for (let i = 0; i < chats.length; i++) {
        const element = chats[i];
        //console.log(chats);
        client.sendMessage(msg.from, element.name);
      }
  } else if (msg.body === '!info') {
      let info = client.info;
      client.sendMessage(msg.from, `
          *Connection info*
          User name: ${info.pushname}
          My number: ${info.wid.user}
          Platform: ${info.platform}
      `);
  } else if (msg.body === '!mediainfo' && msg.hasMedia) {
      const attachmentData = await msg.downloadMedia();
      msg.reply(`
          *Media info*
          MimeType: ${attachmentData.mimetype}
          Filename: ${attachmentData.filename}
          Data (length): ${attachmentData.data.length}
      `);
  } else if (msg.body === '!quoteinfo' && msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage();
      quotedMsg.reply(`
          ID: ${quotedMsg.id._serialized}
          Type: ${quotedMsg.type}
          Author: ${quotedMsg.author || quotedMsg.from}
          Timestamp: ${quotedMsg.timestamp}
          Has Media? ${quotedMsg.hasMedia}
      `);
  } else if (msg.body === '!resendmedia' && msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage();
      if (quotedMsg.hasMedia) {
          const attachmentData = await quotedMsg.downloadMedia();
          client.sendMessage(msg.from, attachmentData, { caption: 'Here\'s your requested media.' });
      }
  //} else if (msg.body === '!location') {
  //    msg.reply(new Location(37.422, -122.084, 'Googleplex\nGoogle Headquarters'));
  } else if (msg.location) {
      msg.reply(msg.location);
  } else if (msg.body.startsWith('!status ')) {
      const newStatus = msg.body.split(' ')[1];
      await client.setStatus(newStatus);
      msg.reply(`Status was updated to *${newStatus}*`);
  } else if (msg.body === '!mention') {
      const contact = await msg.getContact();
      const chat = await msg.getChat();
      chat.sendMessage(`Hi @${contact.number}!`, {
          mentions: [contact]
      });
  } else if (msg.body === '!delete') {
      if (msg.hasQuotedMsg) {
          const quotedMsg = await msg.getQuotedMessage();
          if (quotedMsg.fromMe) {
              quotedMsg.delete(true);
          } else {
              msg.reply('I can only delete my own messages');
          }
      }
  } else if (msg.body === '!pin') {
      const chat = await msg.getChat();
      await chat.pin();
  } else if (msg.body === '!archive') {
      const chat = await msg.getChat();
      await chat.archive();
  } else if (msg.body === '!mute') {
      const chat = await msg.getChat();
      // mute the chat for 20 seconds
      const unmuteDate = new Date();
      unmuteDate.setSeconds(unmuteDate.getSeconds() + 20);
      await chat.mute(unmuteDate);
  } else if (msg.body === '!typing') {
      const chat = await msg.getChat();
      // simulates typing in the chat
      chat.sendStateTyping();
  } else if (msg.body === '!recording') {
      const chat = await msg.getChat();
      // simulates recording audio in the chat
      chat.sendStateRecording();
  } else if (msg.body === '!clearstate') {
      const chat = await msg.getChat();
      // stops typing or recording in the chat
      chat.clearState();
  } else if (msg.body === '!jumpto') {
      if (msg.hasQuotedMsg) {
          const quotedMsg = await msg.getQuotedMessage();
          //console.log(`!Jumpto: ${quotedMsg} not implemented yet`);
          //client. openChatWindowAt(quotedMsg.id._serialized);
      }
  } else if (msg.body === '!buttons') {
      const botones =  [{id:'customId',body:'button1'},{body:'button2'},{body:'button3'},{body:'button4'}] 
//      let button = new Buttons('Button body',[{id: '1', body:'bt1'},{id: '2', body:'bt2'},{id: '3', body:'bt3'}],'title','footer');
      let button = new Buttons('Button body',botones,'title','footer');
      //console.log(button)
      client.sendMessage(msg.from, button);
  } else if (msg.body === '!list') {
      let sections = [{title:'sectionTitle',rows:[{title:'ListItem1', description: 'desc'},{title:'ListItem2'}]}];
      let list = new List('List body','btnText',sections,'Title','footer');
      client.sendMessage(msg.from, list);
  } else if (msg.body === '!reaction') {
      msg.react('👍');
  }
}
