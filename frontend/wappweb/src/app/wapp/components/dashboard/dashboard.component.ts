import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsappSocketService } from '../../services/whatsapp-socket.service';
import { dataSocketService } from 'src/app/services/socket.service';
import { QRCodeComponent, QRCodeModule } from 'angularx-qrcode';
import { WWhatsappSocketService } from '../../services/w_whatsapp-socket.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    QRCodeModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  skt = inject(WhatsappSocketService);
  wskt = inject(WWhatsappSocketService);
  qr = this.skt.qrstr;
  numero = this.skt.numero;
  numberList = this.skt.numberList;
  chats = this.skt.wappChats;
  contacts = this.skt.wappContacts;

  wqr = this.wskt.qrstr;
  wnumero = this.wskt.numero;
  regNumber = '';
//  apiSkt = inject(dataSocketService);

  sktConnect(){
    this.skt.connect();
  }
  sktDisConnect(){
    this.skt.disconnect();
  }
  sktSendmsg(){
    this.skt.emit('ping');
  }
  sktRegister(){
    this.skt.emit('registranumero');
  }
  sktGetChats(){
    this.skt.emit('getChats',this.skt.numberList()[this.numero()].phone);
  }
  sktGetContacts(){
    this.skt.emit('getContacts',this.skt.numberList()[this.numero()].phone);
  }
  sktSendmsgAll(){
    this.skt.emit('pingtoall');
  }

  wsktConnect(){
    this.wskt.connect();
  }
  sktWappClient(funct:string, params:any = null){
    this.skt.emit('wappClient',[this.skt.numberList()[this.numero()].phone, funct, ...params])
  }
  isRegistered(){
    // Paisa 2150
    // Pan 300
    this.sktWappClient("isRegisteredUser",this.regNumber);
  }
  wsktDisConnect(){
    this.wskt.disconnect();
  }
  wsktSendmsg(){
    this.wskt.emit('ping');
  }
  wsktRegister(){
    this.wskt.emit('registranumero');
  }

  wsktSendmsgAll(){
    this.wskt.emit('pingtoall');
  }

}
