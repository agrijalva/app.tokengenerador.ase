import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Device } from '@ionic-native/device';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, device: Device) {
  	setTimeout(() => {
  		alert( "Modelo: " + device.model );
     	alert( "UUID: " + device.uuid );
      	alert( "Serial: " + device.serial );
      	alert( "Versión: " + device.version );
      	alert( "Plataforma: " + device.platform );     
    }, 1000);
  }
}
