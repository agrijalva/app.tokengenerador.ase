import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-modal-terminos',
  templateUrl: 'modal-terminos.html'
})
export class modalTerminosPage {
  constructor(public viewCtrl: ViewController) {}

  closeModal() {
    this.viewCtrl.dismiss();
  }
}