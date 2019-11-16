import {Component, ElementRef, ViewChild} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import {UserProfile} from '../user-profile';
import {AngularFireStorage} from '@angular/fire/storage';
import {AngularFireFunctions} from '@angular/fire/functions';
import {FormControl, NgModel} from '@angular/forms';

export interface Accommodation {
  count: number;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  public userProfileInput: UserProfile;
  private userProfileDoc: AngularFirestoreDocument<UserProfile>;
  private userProfile: Observable<UserProfile | undefined>;
  private userProfileSubscription;
  private diarLemdinaDoc;
  private diarLemdina;
  private edenDoc;
  private eden;
  private isAlreadyRegistred = false;
  private isSuccess = false;
  private paymentReceiptFile = undefined;
  private diarLemdinaLimit = 1;
  private edenLimit = 1;
  @ViewChild('registrationForm', {static: false}) registrationForm;

  constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore, private storage: AngularFireStorage,
              private fns: AngularFireFunctions, private el: ElementRef) {
    this.userProfileInput = new UserProfile(
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '');
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.userProfileDoc = afs.doc<UserProfile>('users/' + user.uid);
        this.userProfile = this.userProfileDoc.valueChanges();
        this.userProfileSubscription = this.userProfile.subscribe(userProfile => {
          this.userProfileInput = userProfile;
          if (!this.userProfileInput) {
            this.userProfileInput = new UserProfile(
              '',
              user.email ? user.email : '',
              '',
              user.displayName ? user.displayName : '',
              '',
              '',
              user.phoneNumber ? user.phoneNumber : '',
              '',
              '',
              '');
          } else {
            this.isAlreadyRegistred = true;
          }

          if (this.userProfileInput.email) {
            // TODO: Make filePath a class attribute
            const filePath = 'users/' + this.userProfileInput.email + '/payment-receipt';
          }
        });

        this.diarLemdinaDoc = afs.doc<Accommodation>('accommodations/Diar Lemdina');
        this.diarLemdina = this.diarLemdinaDoc.valueChanges();

        this.edenDoc = afs.doc<Accommodation>('accommodations/Eden');
        this.eden = this.edenDoc.valueChanges();
      }
    });
  }

  update() {
    if (!this.registrationForm.valid) {
      let firstInvalidControl: FormControl;
      Object.keys(this.registrationForm.form.controls).forEach(field => {
        const control = this.registrationForm.form.get(field);
        control.markAsTouched({onlySelf: true});

        if (!firstInvalidControl && control.invalid) {
          firstInvalidControl = control;
        }
      });

      this.registrationForm._directives.some((field: NgModel) => {
        if (field.control === firstInvalidControl) {
          const nativeElement = this.el.nativeElement
            .querySelector('#' + field.name);

          if (nativeElement) {
            setTimeout(() => nativeElement.focus());
          }

          return true;
        }
      });

      return;
    }

    const callable = this.fns.httpsCallable('setAccommodation');
    callable({accommodation: this.userProfileInput.accommodation}).toPromise().then((result: any) => {
      console.log(result);
    }).catch((error: any) => {
      console.log(error);
    });

    this.userProfileDoc.set(Object.assign({}, this.userProfileInput));

    this.isSuccess = true;
  }

  uploadFile(event) {
    this.paymentReceiptFile = event.target.files[0];
  }

}
