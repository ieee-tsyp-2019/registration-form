import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(public afAuth: AngularFireAuth) {
  }

  ngOnInit() {
  }

  login() {
    const provider = new auth.GoogleAuthProvider();
    provider.setCustomParameters({
      hd: 'ieee.org'
    });
    this.afAuth.auth.signInWithPopup(provider);
  }

  logout() {
    // TODO: Unsubscribe from all subscriptions
    this.afAuth.auth.signOut();
  }

}
