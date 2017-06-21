import { HttpModule } from '@angular/http';
import { Device } from '@ionic-native/device';
import { Network } from '@ionic-native/network';
import { StatusBar } from '@ionic-native/status-bar';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SocialSharing } from '@ionic-native/social-sharing';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';

// Imports Pages
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { InputPage } from '../pages/input/input';
import { TokenPage } from '../pages/token/token';
import { Popover} from '../components/popover/popover';
import { SettingsPage } from '../pages/settings/settings';
import { modalTerminosPage } from '../pages/modal-terminos/modal-terminos';

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        LoginPage,
        InputPage,
        TokenPage,
        SettingsPage,
        modalTerminosPage,
        Popover
    ],
    imports: [
        BrowserModule,
        HttpModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        LoginPage,
        InputPage,
        TokenPage,
        SettingsPage,
        modalTerminosPage,
        Popover
    ],
    providers: [
        StatusBar,
        SplashScreen,
        ScreenOrientation,
        Device,
        Network,
        SocialSharing,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {}
