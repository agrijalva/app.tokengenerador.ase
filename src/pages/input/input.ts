import { Device } from '@ionic-native/device';
import { Network } from '@ionic-native/network';
import { Component, ViewChild } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { NavController, AlertController, ModalController, PopoverController } from 'ionic-angular';

// Imports para Http Request
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout'

// Import pages
import { TokenPage } from '../token/token';
import { LoginPage } from '../login/login';
import { Popover } from '../../components/popover/popover';
import { modalTerminosPage } from '../modal-terminos/modal-terminos';

@Component({
    selector: 'page-input',
    templateUrl: 'input.html'
})
export class InputPage {
    isenabled:boolean    = true;
    Connected:boolean    = true;
    noOrden:string       = '';
    URL:string           = '';
    ubicacion:string     = '';
    idToken              = 0;
    vigencia             = 0;
    tiempo               = '';
    IntentosGPS          = 0; // Si se requiere obtener forzosamente el GPS habilitar esta variable en mas de un intento

    calificacion:boolean = false;
    estrellas            = 0;
    comentarios:string   = "";
    kpi1:boolean         = false;
    kpi2:boolean         = false;
    kpi3:boolean         = false;
    kpi4:boolean         = false;
    kpi5:boolean         = false;
    kpi6:boolean         = false;
    kpi7:boolean         = false;
    kpi8:boolean         = false;
    kpi9:boolean         = false;
    kpi10:boolean        = false;

    kpi1_label:string    = '';
    kpi2_label:string    = '';
    kpi3_label:string    = '';
    kpi4_label:string    = '';
    kpi5_label:string    = '';
    kpi6_label:string    = '';
    kpi7_label:string    = '';
    kpi8_label:string    = '';
    kpi9_label:string    = '';
    kpi10_label:string   = '';

    // Arreglos
    valMejorar;
    valPremiar;
    DatosUsuario;

    // Variables necesarias para la inactividad
    BreakTime    = 0;
    DeadTime     = 0;
    Http_Timeout = 0;
    public Interval;

    @ViewChild('input') myInput;

    constructor( public network: Network,
                 public http: Http,
                 public device: Device,
                 public navCtrl: NavController, 
                 public alertCtrl: AlertController, 
                 public modalCtrl: ModalController, 
                 private popoverCtrl: PopoverController, 
                 private screenOrientation: ScreenOrientation ) 
    {
        // Asignación de valores a variables usadas en la Clase
        this.DeadTime     = 10 * (60 * 60 * 24); // numero de dias * ( segundos * minutos * dia)
        this.URL          = localStorage.getItem("_URL");
        this.DatosUsuario = JSON.parse( localStorage.getItem( "Datos_Usuario" ) )
        this.Http_Timeout = parseInt( localStorage.getItem("Http_Timeout") ) * 1000;
        localStorage.setItem("_LOGOUT", "0");
        localStorage.setItem( "Token", "" );

        // Acciones que se ejecutan unicamente en el dispositivo
        if( this.device.model != null ){
            this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        }

        // Se obtiene la configuración de la aplicación 
        setTimeout(() => {
            this.GetSettings();
        }, 1000);

        // Se valida la inactividad de la aplicación
        this.Inactividad();

        // Se habilita el foco automatico al Input del Numero de Orden
        setTimeout(() => {
          this.myInput.setFocus();
        },350);

        // watch network for a disconnect
        let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
            this.Connected = false;
            console.log('network was disconnected :-(');
            // this.Alert( 'Aprobaciones', 'Se ha perdido la conexión a Interner, conectate nuevamente.' );
        });

        // Watch network for a connection
        let connectSubscription = this.network.onConnect().subscribe(() => {
            console.log('network connected!');
            // this.Alert( 'Aprobaciones', 'Conexión a Internet establecida.' );
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

    presentPopover(ev) {
        let popover = this.popoverCtrl.create(Popover, {  });
        popover.present({
            ev: ev
        });
    }

    showCalificacion(){
        this.BreakTime    = 0;
        this.estrellas    = 0;
        this.calificacion = true;
    }

    hideCalificacion(){
        this.BreakTime     = 0;
        this.noOrden       = '';
        this.calificacion  = false;
        setTimeout(() => {
            this.isenabled = true;
        }, 300);
    }

    ValidaGetGeo(){
        this.BreakTime      = 0;
        this.isenabled      = false;
        let locationOptions = {timeout: 5000, enableHighAccuracy: false};

        if( this.Connected ){
            if( this.IntentosGPS <= 0 ){
                this.BuscarOrden();
            }
            else{
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.ubicacion    = position.coords.latitude + ':' + position.coords.longitude;
                        this.BuscarOrden();
                    },

                    (error) => {
                        this.Alert( 'Aprobaciones', 'Imposible obtener su ubicacion, por favor encienda su GPS.' );
                        this.isenabled = true;
                        this.IntentosGPS--;
                    }, locationOptions
                );
            }
        }
        else{
            this.Alert( 'Aprobaciones', 'Se ha perdido la conexión a Interner, conectate nuevamente.' );
            this.isenabled = true;
        }
    }

    BuscarOrden(){       
        if( this.noOrden == '' ){
            this.Alert( 'Aprobaciones', 'Propocione el Número de Orden para generar el Token.' );
            this.isenabled = true;
            this.noOrden   = '';
        }
        else{
            var _orden       = this.noOrden.split('-');
            var orden        = _orden[0] + "-" + _orden[1] + "-" +_orden[2];
            var idCotizacion = 0;

            let consecutivoCotizacion = ( _orden.length == 4 ) ? _orden[3] : 0;
            let URL_method   = this.URL + 'buscarOrden?numeroOrden='+ encodeURI( orden )
                                        +'&idUsuario=' + localStorage.getItem("Usuario_Id")
                                        +'&consecutivoCotizacion=' + consecutivoCotizacion;
            console.log( URL_method );

            this.http.get(URL_method)
            .timeout( this.Http_Timeout )
            .map(res => res.json())
            .subscribe(
                data => {
                    if( data[0].Success == 0 ){
                        this.Alert( 'Aprobaciones', data[0].Msg );
                    }
                    else{
                        // Validamos que la Orden la valide el perfil correcto
                        let SaveToken = false;
                        // Obtenemos el indice de la operacion a la que perteneceria la orden
                        let flagInd   = false;
                        let indice    = 0;

                        for( let i = 0; i < this.DatosUsuario.length; i++ ){
                            if( this.DatosUsuario[ i ].idOperacion == data[0].Operacion ){
                                flagInd = true;
                                indice  = i;
                                console.log( 'Entramos aqui' );
                            }
                        }

                        // Validamos que el usuario tenga permiso de realizar el token en la operacion
                        if( !flagInd ){
                            this.Alert( 'Aprobaciones', 'No cuenta con los privilegios necesarios para realizar el Token.' ); // (no tienes permisos en esta operación)
                        }
                        else{
                            if( data[0].tipo == 1 && data[0].idEstatusOrden != 4 ){
                                if( parseInt( localStorage.getItem( "Usuario_Tipo" ) ) == 2 ){ // Generar Token
                                    SaveToken = true;
                                }
                                else{
                                    this.Alert( 'Aprobaciones Utilidad', 'No cuenta con los privilegios necesarios para realizar el Token.' ); // (Debes ser administrador)
                                }
                            }
                            else if( data[0].idEstatusOrden == 4 || data[0].idEstatusOrden == 5 ){ // ( Administrador )}
                                if( parseInt( localStorage.getItem( "Usuario_Tipo" ) ) == 1 || parseInt( localStorage.getItem( "Usuario_Tipo" ) ) == 2 ){ // Generar Token
                                    SaveToken = true;
                                }
                                else{
                                    this.Alert( 'Aprobaciones', 'No cuenta con los privilegios necesarios para realizar el Token.' ); // (Es Aprobacion)
                                }
                            }
                            else if( data[0].idEstatusOrden == 6 ){ // ( Administrador )}
                                if( parseInt( localStorage.getItem( "Usuario_Tipo" ) ) == 2 ){ // Generar Token
                                    SaveToken = true;
                                }
                                else{
                                    this.Alert( 'Aprobaciones', 'No cuenta con los privilegios necesarios para realizar el Token.' ); // (Eres cliente)
                                }
                            }
                            else if( data[0].idEstatusOrden == 7 ){ // ( Cliente )
                                if( parseInt( localStorage.getItem( "Usuario_Tipo" ) ) == 1 ){ // Generar Token
                                    SaveToken = true;
                                }
                                else{
                                    this.Alert( 'Aprobaciones', 'No cuenta con los privilegios necesarios para realizar el Token.' ); // ( Eres administrador )
                                }
                            }
                        }

                        // Guardamos el token
                        if( SaveToken ){
                            this.GetSettings();
                            this.GuardarToken( data );
                            if( data[0].Calificacion == 1 ){ // Se calificara el servicio
                                // Mostramos la hora de la calificacion
                                this.tiempo = this.TimeNow();
                                // console.log( tiempo );
                                this.showCalificacion();
                            }
                            else{
                                this.goTokenPage();
                            }
                        }
                    }
                    this.isenabled = true;
                },
                error =>{
                    this.Alert( 'Aprobaciones', 'No hay conexión a internet. Porfavor, intentelo nuevamente.' );
                    this.isenabled = true;
                });
        }
    }

    TimeNow(){
        var d = new Date();
        var tiempo = d.getHours() + ':' + d.getMinutes();
        var hora = '00';

        switch( d.getHours() ){
            case 1: hora = "01"; break;
            case 2: hora = "02"; break;
            case 3: hora = "03"; break;
            case 4: hora = "04"; break;
            case 5: hora = "05"; break;
            case 6: hora = "06"; break;
            case 7: hora = "07"; break;
            case 8: hora = "08"; break;
            case 9: hora = "09"; break;
            case 10: hora = "10"; break;
            case 11: hora = "11"; break;
            case 12: hora = "12"; break;
            case 13: hora = "01"; break;
            case 14: hora = "02"; break;
            case 15: hora = "03"; break;
            case 16: hora = "04"; break;
            case 17: hora = "05"; break;
            case 18: hora = "06"; break;
            case 19: hora = "07"; break;
            case 20: hora = "08"; break;
            case 21: hora = "09"; break;
            case 22: hora = "10"; break;
            case 23: hora = "11"; break;
            case 24: hora = "00"; break;
        }

        return hora + ':' + ( (d.getMinutes() <= 9) ? ( '0' + d.getMinutes() ) : d.getMinutes() ) + ' ' + ( ( d.getHours() < 12 ) ? 'a.m.' : 'p.m.' );
    }

    GuardarToken( respuesta ){
        localStorage.setItem( "Token", this.RandomHash(6) );

        let deviceData = {
            modelo: this.device.model,
            UUID: this.device.uuid,
            Serial: this.device.serial,
            Version: this.device.version,
            Plataforma: this.device.platform
        };

        let URL_method = this.URL + 'insertToken'
                                  + '?token=' + localStorage.getItem( "Token" )
                                  + '&Vigencia=' + localStorage.getItem("Vigencia")
                                  + '&numeroOrden=' + this.noOrden
                                  + '&ubicacionToken=' + this.ubicacion
                                  + '&datosMovil=' + JSON.stringify( deviceData )
                                  + '&idUsuario=' + localStorage.getItem("Usuario_Id")
                                  + '&idOrdenServicio=' + respuesta[0].idOrden
                                  + '&origenToken=mobile'
                                  + '&idEstatusOrden=' + respuesta[0].idEstatusOrden
                                  + '&idCotizacion=' + respuesta[0].idCotizacion;
   
        this.http.get(URL_method)
            .map(res => res.json())
            .subscribe(
                data => {
                    console.log( data );
                    this.idToken = data[0].LastInsertId;
                },
                error =>{
                    this.Alert( 'Error de conexión', 'Se ha perdido la conexión a Interner, conectate nuevamente.' );
                    this.isenabled = true;
                });
    }

    GuardarCalificacion(){
        if( this.estrellas == 0 ){
            this.Alert( 'Ayudanos a mejorar', 'Tu opinión es importante para nosotros favor de proporcionarnos su punto de vista.' );
        }
        else{
            let URL_method = this.URL + 'insertCalificacion'
                                      + '?calificacionToken=' + this.estrellas
                                      + '&comentariosToken=' + this.comentarios
                                      + '&idToken=' + this.idToken
                                      + '&kpi1=' + ( (this.estrellas == 5) ? ( this.kpi6 ? this.valPremiar[0] : 0 ) : ( this.kpi1 ? this.valMejorar[0] : 0 ) )
                                      + '&kpi2=' + ( (this.estrellas == 5) ? ( this.kpi7 ? this.valPremiar[1] : 0 ) : ( this.kpi2 ? this.valMejorar[1] : 0 ) )
                                      + '&kpi3=' + ( (this.estrellas == 5) ? ( this.kpi8 ? this.valPremiar[2] : 0 ) : ( this.kpi3 ? this.valMejorar[2] : 0 ) )
                                      + '&kpi4=' + ( (this.estrellas == 5) ? ( this.kpi9 ? this.valPremiar[3] : 0 ) : ( this.kpi4 ? this.valMejorar[3] : 0 ) )
                                      + '&kpi5=' + ( (this.estrellas == 5) ? ( this.kpi10 ? this.valPremiar[4] : 0 ) : ( this.kpi5 ? this.valMejorar[4] : 0 ) );
            
            this.http.get(URL_method)
                .map(res => res.json())
                .subscribe(
                    data => {
                        console.log( data );
                    },
                    error =>{
                        this.Alert( 'Aprobaciones', 'No hay conexión a internet. Porfavor, intentelo nuevamente.' );
                        this.isenabled = true;
                    });
                
            this.goTokenPage();
        }
    }

    Alert( title, subTitle ){
        this.BreakTime = 0;
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: subTitle,
            buttons: ['OK']
        });
        alert.present();
    }

    goTokenPage(){
        setTimeout(() => {
            clearInterval( this.Interval );
                this.navCtrl.setRoot(TokenPage);
        }, 300);
    }

    openModal() {
        let myModal = this.modalCtrl.create(modalTerminosPage);
        myModal.present();
    }

    GetSettings(){
        let URL_method = this.URL + 'settings';
   
        this.http.get(URL_method)
            .map(res => res.json())
            .subscribe(
                data => {
                    var set = data[0];
                    this.valMejorar  = [ set.kpi1_id, set.kpi2_id, set.kpi3_id, set.kpi4_id, set.kpi5_id ];
                    this.valPremiar  = [ set.kpi6_id, set.kpi7_id, set.kpi8_id, set.kpi9_id, set.kpi10_id ];

                    this.kpi1_label  = set.kpi1_name;
                    this.kpi2_label  = set.kpi2_name;
                    this.kpi3_label  = set.kpi3_name;
                    this.kpi4_label  = set.kpi4_name;
                    this.kpi5_label  = set.kpi5_name;
                    this.kpi6_label  = set.kpi6_name;
                    this.kpi7_label  = set.kpi7_name;
                    this.kpi8_label  = set.kpi8_name;
                    this.kpi9_label  = set.kpi9_name;
                    this.kpi10_label = set.kpi10_name;

                    localStorage.setItem( "Vigencia", set.vigencia);
                },
                error =>{
                    // this.Alert( 'Aprobaciones 11', 'No hay conexion a internet. Porfavor, intentelo nuevamente.' );
                    this.isenabled = true;
                });
    }

    LogOut(){
        setTimeout(() => {
            clearInterval( this.Interval );
            this.BreakTime = 0;
            localStorage.setItem("_LOGIN", "0");
            localStorage.setItem("Usuario_Id", "");
            localStorage.setItem("Usuario_Tipo", "");
            localStorage.setItem( "Token", "" );
            this.navCtrl.setRoot(LoginPage);
        }, 300);
    }

    Inactividad(){
        this.Interval = setInterval(() => {
            if( localStorage.getItem("_LOGIN") == "1" ){
                this.BreakTime++;
                if( this.BreakTime >= this.DeadTime ){
                    clearInterval( this.Interval );
                    this.Alert( 'Aprobaciones', 'Su sesión ha expidaro' );
                    this.LogOut();
                }

                if( localStorage.getItem( "_LOGOUT" ) == "1" )
                    this.LogOut();   
            }
        }, 1000);
    }

    RandomHash(nChar) {
        var text = "";
        var possible = "0123456789ABCDEFG0123456789HIJKLMNO0123456789PQRSTUV0123456789WXYZ0123456789";

        for( var i=0; i < nChar; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
        // // convert number of characters to number of bytes
        // var nBytes = Math.ceil(nChar = (+nChar || 8) / 2);

        // // create a typed array of that many bytes
        // var u = new Uint8Array(nBytes);

        // // populate it wit crypto-random values
        // window.crypto.getRandomValues(u);

        // // convert it to an Array of Strings (e.g. "01", "AF", ..)
        // var zpad = function (str) {
        //     return '00'.slice(str.length) + str
        // };
        // var a = Array.prototype.map.call(u, function (x) {
        //     return zpad(x.toString(16))
        // });

        // // Array of String to String
        // var str = a.join('').toUpperCase();
        // // and snip off the excess digit if we want an odd number
        // if (nChar % 2) str = str.slice(1);

        // // return what we made
        // return str;
    }
}