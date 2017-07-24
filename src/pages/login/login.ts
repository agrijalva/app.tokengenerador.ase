import { Component } from '@angular/core';
import { Device } from '@ionic-native/device';
import { Network } from '@ionic-native/network';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { NavController, AlertController, ModalController } from 'ionic-angular';

// Imports para Http Request
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout'

import { InputPage } from '../input/input';
import { SettingsPage } from '../settings/settings';
import { modalTerminosPage } from '../modal-terminos/modal-terminos';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
    usuario:string     = '';
    password:string    = '';
    URL:string         = '';
    isenabled:boolean  = true;
    Desarrollo:boolean = false;
    Connected:boolean  = true;
    Http_Timeout       = 0;
    IntentosGPS        = 2;

  	constructor( public http: Http,
                 public device: Device,
                 public network: Network,
                 public navCtrl: NavController, 
                 public alertCtrl: AlertController, 
                 public modalCtrl: ModalController, 
                 private screenOrientation: ScreenOrientation )
    {
        if( localStorage.getItem("_URL") == "" || localStorage.getItem("_URL") === null ){
            // localStorage.setItem("_URL", 'http://192.168.20.9:5300/api/mobile/'); // Desarrollo
            localStorage.setItem("_URL", 'http://189.204.141.193:5100/api/mobile/'); // Produccion
        }

        this.usuario      = localStorage.getItem("Usuario_Name");
        this.URL          = localStorage.getItem("_URL");
        this.Desarrollo   = ( localStorage.getItem("Desarrollo") == "0" ) ? false : true;
        this.Http_Timeout = parseInt( localStorage.getItem("Http_Timeout") ) * 1000;

        // Acciones que se ejecutan unicamente en el dispositivo
        if( this.device.model != null ){
            this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        }

        // Validacion de Login para mostrar la pagina de Input si la sesion esta creada
        if( localStorage.getItem("_LOGIN") != "0" && localStorage.getItem("_LOGIN") != "1"){
            localStorage.setItem("_LOGIN", "0");
        }
        else if( localStorage.getItem("_LOGIN") == "1" ){
            this.navCtrl.setRoot(InputPage);
        }

        // watch network for a disconnect
        let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
            this.Connected = false;
            console.log('network was disconnected :-(');
            // this.Alert( 'ASE Token', 'Se ha perdido la conexión a Interner, conectate nuevamente.' );
        });

        // Watch network for a connection
        let connectSubscription = this.network.onConnect().subscribe(() => {
            console.log('network connected!');
            // this.Alert( 'ASE Token', 'Conexión a Internet establecida.' );
            this.Connected = true;
            // We just got a connection but we need to wait briefly
            // Before we determine the connection type.  Might need to wait 
            // Prior to doing any api requests as well.
            setTimeout(() => {
                if (this.network.type === 'wifi') {
                    console.log('we got a wifi connection, woohoo!');
                }
            }, 3000);
        });
    }

    openModal() {
        let myModal = this.modalCtrl.create(modalTerminosPage);
        myModal.present();
    }

    Login(){
        if( this.Connected ){
            if( this.usuario == '' && this.password == '' ){
                this.Alert( 'Introducir credenciales', 'Favor de ingresar su Usuario y Contraseña.' );
            }
            else if( this.usuario == '' ){
                this.Alert( 'Falta Usuario', 'Favor de ingresar su Usuario.' );            
            }
            else if( this.password == '' ){
                this.Alert( 'Falta Contraseña', 'Favor de ingresar su Contraseña' );
            }
            else{
                this.ValidaGetGeo();
            }
        }
        else{
            this.Alert( 'ASE Token', 'Se ha perdido la conexión a Interner, conectate nuevamente.' );
        }
    }

    ValidaGetGeo(){
        this.isenabled = false;
        let locationOptions = {timeout: 5000, enableHighAccuracy: false};

        if( this.IntentosGPS <= 0 ){
            this.HttpRequester();
        }
        else{
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.HttpRequester();
                },

                (error) => {
                    this.Alert( 'ASE Token', 'Imposible obtener su ubicación, por favor encienda su GPS.' );
                    this.isenabled = true;
                    this.IntentosGPS--;
                }, locationOptions
            );
        }
    }

    HttpRequester(){
        let URL_method = this.URL + 'login?usuario='+ encodeURI( this.usuario ) +'&password=' + encodeURI( this.password );
        
        this.http.get(URL_method)
        .timeout( this.Http_Timeout )
        .map( res => res.json() )
        .subscribe(
            data => {
                if( data.length != 0 ){
                    localStorage.setItem( "_LOGIN", "1" );
                    localStorage.setItem( "Usuario_Id", data[0].idUsuario );
                    localStorage.setItem( "Usuario_Name", data[0].nombreUsuario );
                    localStorage.setItem( "Usuario_Tipo", data[0].idCatalogoRol );
                    localStorage.setItem( "Datos_Usuario", JSON.stringify(data) );
        	        this.navCtrl.setRoot( InputPage );
                }
                else{
                    this.Alert( 'Usuario no encontrado', 'No se ha encontrado su usuario, verifique sus credenciales.' );
                    this.isenabled = true;
                    this.password = '';
                }
            },
            error =>{
                this.Alert( 'Error de conexión', 'Se ha perdido la conexión a Interner, conectate nuevamente.' );
                this.isenabled = true;
            });
    }

    Settings(){
        this.navCtrl.setRoot( SettingsPage );
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