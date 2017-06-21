
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { InputPage } from '../pages/input/input';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
    // rootPage:any = LoginPage;
    rootPage:any;

    constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
        if( localStorage.getItem("_LOGIN") == null || localStorage.getItem("_LOGIN") == "0" ){
            this.rootPage = LoginPage;
        }
        else{
            this.rootPage = InputPage;
        }
        
        platform.ready().then(() => {

            statusBar.styleDefault();
            splashScreen.hide();

            // Validamos la URL por Default de la aplicación que dara los servicios a la app
            if( localStorage.getItem("_URL") == "" ){
                localStorage.setItem("_URL", 'http://192.168.20.9:5300/api/mobile/');
            }

            // Tiempo de espera para peticion a servidores
            // localStorage.setItem("Http_Timeout", '10');

            // 0 => Modo Desarrollo deshabilitado.
            // 1 => Modo Desarrollo habilitado.
            localStorage.setItem("Desarrollo", '1');

            // Tiempo de espera para peticion a servidores
            localStorage.setItem("Http_Timeout", '10');
        });
    }
}

