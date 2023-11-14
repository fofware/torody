import { Injectable, signal } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'any'
})

export class WWhatsappSocketService extends Socket {
  qrstr = signal('');
  numero = signal('');
  constructor() {
    super( {
      url: environment.WSKT.URL,
      options: {
        query: {
          token: localStorage.getItem('token'),
        },
        autoConnect: false,
      }
    });
    super.onAny(async (eventName:string, ...args:any) => {
      const d = new Date().getTime()/1000;
      console.warn('Debug,evento',eventName, args);
      if (eventName === 'qr'){
        args[0].qrSend < args[0].qrMaxRetries ? this.qrstr.set(args[0].qr) : this.qrstr.set('');
      }
      for (let i = 0; i < args.length; i++) {
        const e = args[i];
        if(e?.phone && e?.msg){
          console.log(i,e.phone,e.msg?.from,e.msg?.author);
          console.log(i,e.msg.body,e.msg._data.notifyName)
        }
      }
    });
    super.on('qr',async (args:any) => {
      console.log(args);

      this.numero.set( args.numero.length ? args.numero : '');
      this.qrstr.set(args.qr);
    })
    super.on('disconnected',async (args:any) => {
      console.log(args);
      this.qrstr.set('');
    })

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

}
