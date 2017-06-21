import { Component } from '@angular/core';
import { Device } from '@ionic-native/device';
import { SocialSharing } from '@ionic-native/social-sharing';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { NavController, ModalController, PopoverController } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { InputPage } from '../input/input';
import { Popover } from '../../components/popover/popover';
import { modalTerminosPage } from '../modal-terminos/modal-terminos';

@Component({
    selector: 'page-token',
    templateUrl: 'token.html'
})
export class TokenPage {
    // Variables necesarias para la inactividad
    BreakTime = 0;
    DeadTime = 600;
    VidaToken = 0;
    labelVidaToken:string = '';
    Token:string = '';
    public Interval;

    constructor( public device: Device,
                 public navCtrl: NavController, 
                 public modalCtrl: ModalController, 
                 private sharingVar: SocialSharing, 
                 private popoverCtrl: PopoverController,
                 private screenOrientation: ScreenOrientation) 
    {
        // Asignaciones de valores a variables
        localStorage.setItem("_LOGOUT", "0");
        this.VidaToken = parseInt(localStorage.getItem( "Vigencia" ) );
        this.Token     = localStorage.getItem( "Token" );
        
        // Acciones que se ejecutan unicamente en el dispositivo
        if( this.device.model != null ){
            this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        }

        // Cuando se termina el tiempo de vigencia del token se regresa a la pantalla de input
        this.Interval = setInterval(() => {
            if( localStorage.getItem("_LOGIN") == "1" ){
                var queda = this.VidaToken--;
                if( queda <= 0 ){
                    this.goInputPage();
                }
                else
                    this.formatTime( queda );

                if( localStorage.getItem( "_LOGOUT" ) == "1" )
                    this.LogOut();
            }
        }, 1000);

        // Se crea el formato de tiempo de la vigencia del token
        this.formatTime( this.VidaToken );

        // Se habilita la opción de compartir de manera automatica
        setTimeout(() => {
            this.otherShare();
        }, 500);
    }

    presentPopover(ev) {
        let popover = this.popoverCtrl.create(Popover, {  });
        popover.present({
            ev: ev
        });
    }
    
    formatTime( segundos ){
        var minutos = (( Math.floor( segundos / 60 ) ) <= 9) ? '0' +  Math.floor( segundos / 60 ) :  Math.floor( segundos / 60 );
        var resto = ((segundos % 60) <= 9) ? '0' + segundos % 60 : segundos % 60;
        this.labelVidaToken = minutos + ":" + resto;
    }

    openModal() {
        let myModal = this.modalCtrl.create(modalTerminosPage);
        myModal.present();
    }

    goInputPage(){
        setTimeout(() => {
            clearInterval( this.Interval );
            this.BreakTime = 0;
            localStorage.setItem( "Token", "" );
  	        this.navCtrl.setRoot(InputPage);
        }, 300);
    }

    LogOut(){
  	    setTimeout(() => {
            clearInterval( this.Interval );
            localStorage.setItem("_LOGIN", "0");
            localStorage.setItem( "Token", "" );
            this.BreakTime = 0;
              this.navCtrl.setRoot(LoginPage);
        }, 300);
    }

    emailShare(){
        this.sharingVar.shareViaEmail(this.Token,null,null,null,null,null)
        .then(()=>{
            // alert("Success");
        }, ()=>{
            // alert("failed")
        })
    }

    smsShare(){
        this.sharingVar.shareViaSMS(this.Token, null)
        .then(()=>{
            // alert("Success");
        }, ()=>{
            // alert("failed")
        })
    }

    whatsappShare(){
        this.sharingVar.shareViaWhatsApp(this.Token, null /*Image*/,  null /* url */)
        .then(()=>{
            // alert("Success");
        }, ()=>{
            // alert("failed")
        })
    }
 
    twitterShare(){
        this.sharingVar.shareViaTwitter(this.Token, null /*Image*/,null)
        .then(()=>{
            // alert("Success");
        }, ()=>{
           // alert("failed")
        })
    }
 
    facebookShare(){
        this.sharingVar.shareViaFacebook(this.Token, null /*Image*/, null)
        .then(()=>{
            // alert("Success");
        }, ()=>{
            // alert("failed")
        })
    }
 
    otherShare(){
        this.sharingVar.share(this.Token, null/*Subject*/, null/*File*/,null)
        .then(()=>{
            // alert("Success");
        }, ()=>{
           // alert("failed")
        })
    }
}
