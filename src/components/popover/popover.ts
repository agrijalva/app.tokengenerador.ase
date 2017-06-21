import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { NavController, App } from 'ionic-angular';

import { SettingsPage } from '../../pages/settings/settings';
  		
@Component({
  selector: 'popover',
  templateUrl: 'popover.html'
})
export class Popover {
	Desarrollo:boolean = false;

  	constructor( public navCtrl: NavController, public app: App, private viewCtrl: ViewController ) {
  		this.Desarrollo = ( localStorage.getItem("Desarrollo") == "0" ) ? false : true;
  	}

	LogOut(){
		localStorage.setItem("_LOGOUT", "1");
        this.viewCtrl.dismiss();
	}

	Settings(){
		this.viewCtrl.dismiss();
		this.app.getRootNav().setRoot( SettingsPage );
	}
}
