import { Injectable, inject, signal } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { iToast } from 'src/app/services/api.service';
import { ToastService } from 'src/app/services/toast.service';
import { token$S } from 'src/app/users/services/users.service';
import { environment } from 'src/environments/environment';

const options:iToast = {
  animation: true,
  autohide: true,
  delay: 5000,
}

@Injectable({
  providedIn: 'any'
})


export class WhatsappSocketService extends Socket {
  toastr = inject(ToastService);
  notifyMessage = signal(true);
  wappContacts = signal<any>({});
  wappChats = signal<any>({});
  bots = signal<any>({});

  qrstr = signal('');
  numero = signal(0);
  numberList = signal<any[]>([]);
  constructor() {
    super( {
      url: environment.SKT2.URL,
      options: {
        query: {
          token: token$S()
        },
        autoConnect: false,
      }
    });

    super.onAny(async (eventName:string, ...args:any) => {
      const d = new Date().getTime()/1000;
      console.warn('Debug,evento',eventName, args);

      for (let i = 0; i < args.length; i++) {
        this.processEvents(eventName,args[i])
      }
    });

    super.on('wapp:qr',async (args:any) => {
      console.log(args);
      this.numero.set( args?.phone?.length ? args.phone : '');
      this.qrstr.set(args.qr);
    });

    super.on('wapp:ready',async (args:any) => {
      console.log(args);
      this.qrstr.set('');
      this.toastr.info(`${args.connected}`, options);

    });

    super.on('joinedTo',async (args:any) => {
      this.bots.update(bot => bot[args]={});
      this.numberList.mutate(list => list.push(args));
      this.emit('getContacts',args.phone);
      this.emit('getChats',args.phone);
    });

    super.on('wapp:disconnected',async (args:any) => {
      console.log(args);
      this.qrstr.set('');
    });
  }

  override async connect() {
    const conn = await super.connect();
    console.log('override connect', conn);
  }

  override disconnect(_close?: any) {
    const disc = super.disconnect({logout: 'pepe'});
    console.log('override discconet', disc);
  }

  get(eventName:string, callback:Function ){
    super.on(eventName, callback);
  }

  async send(eventName:string, data:any){
    //console.log(eventName,'emit',data);
    const queviene = await super.emit(eventName,data);
    console.log('send-rpta',queviene);
  }


  processEvents(event:string,msg:any) {
    console.log('processEvents',event);
    console.log('msg', msg);
    switch (event) {
      case 'wapp:message':
      case 'wapp:message_reaction':
        this.toastMessage(event,msg)
      break;
      case 'wapp:message_ack':
      break;
      case 'wapp:chats':
        //this.bots.update(bot => bot[msg.phone]={msg.)
        const chats = this.wappChats();
        chats[msg.phone] = msg.data;
        this.wappChats.set(chats);
        console.log('S.Chats',this.wappChats())
      break;
      case 'wapp:contacts':
        console.log('Set Contacts');
        console.log('Phone',msg.phone);
        console.log('Contactos',msg.data);
        const contacts = this.wappContacts();
        contacts[msg.phone] = msg.data;
        this.wappContacts.set(contacts);
        console.log(this.wappContacts())
      break;
      default:
        const msgoptions = { ...options, header: event, delay: 6500 }
        this.toastr.info(msg.phone, msgoptions);
      break;
    }

  }

  toastMessage (eventName:string,msg:any) {
    console.log(msg);
    const header = msg?.data?._data?.notifyName.length ? msg?.data?._data?.notifyName : msg?.data?.from;
    const msgoptions = { ...options, header, delay: 5500 }
    if(msg?.data?.type){
      switch (msg.data.type) {
        case 'chat':
          this.toastr.info(msg.data?.body, msgoptions);
          break;
        case 'image':
          this.toastr.info(`<img
            [src]="msg._data.body | base64: msg._data.body"
            />`)
          break;
        default:
          this.toastr.info(JSON.stringify(msg), msgoptions);
          break;
      }
    } else {
      const msgoptions = { ...options, header: eventName, delay: 6500 }

      this.toastr.info(JSON.stringify(msg), msgoptions);
    }
  }

}
