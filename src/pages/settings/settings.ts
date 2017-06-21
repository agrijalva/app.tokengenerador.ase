import { Component, ViewChild } from '@angular/core';
import { Device } from '@ionic-native/device';
import { NavController, AlertController, ModalController, PopoverController } from 'ionic-angular';

// Imports para Http Request
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

// Import pages
import { LoginPage } from '../login/login';
import { InputPage } from '../input/input';

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage {
    isenabled:boolean    = true;
    _url:string          = 'http://192.168.20.9:5300/';
    _api:string          = 'api/mobile/';
    _timeout:string      = '10';

    constructor( public http: Http,
                 public device: Device,  
                 public navCtrl: NavController, 
                 public alertCtrl: AlertController, 
                 public modalCtrl: ModalController, 
                 private popoverCtrl: PopoverController )
    {
        localStorage.setItem("_LOGOUT", "0");

        this._url     = localStorage.getItem("_url_local") == null   ? this._url     : localStorage.getItem("_url_local");
        this._api     = localStorage.getItem("_api") == null         ? this._api     : localStorage.getItem("_api");
        this._timeout = localStorage.getItem("Http_Timeout") == null ? this._timeout : localStorage.getItem("Http_Timeout");

        // localStorage.setItem("_url_local" , this._url);
        // localStorage.setItem("_api" , this._api);
        // localStorage.setItem("Http_Timeout" , this._timeout);
        // this._url     = localStorage.getItem("_URL");
        this._timeout = localStorage.getItem("Http_Timeout");
    }

    SaveSettings(){
        setTimeout(() => {
            localStorage.setItem("_url_local" , this._url);
            localStorage.setItem("_api" , this._api);
            localStorage.setItem("Http_Timeout" , this._timeout);

            localStorage.setItem("_URL" , this._url + this._api);
            this.backPage();
            this.Alert( "Settings", "Se ha guardado la configuración correctamente." );
        }, 300);
    }

    backPage(){
        setTimeout(() => {
            if( localStorage.getItem("_LOGOUT") == '0'){
                this.navCtrl.setRoot(LoginPage);
            }
            else{
                 this.navCtrl.setRoot(InputPage);   
            }
        }, 300);
    }

    Alert( title, subTitle ){
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: subTitle,
            buttons: ['OK']
        });
        alert.present();
    }
}