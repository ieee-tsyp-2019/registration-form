import {Component, ElementRef, ViewChild} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import {UserProfile} from '../user-profile';
import {AngularFireStorage} from '@angular/fire/storage';
import {AngularFireFunctions} from '@angular/fire/functions';
import {FormControl, NgModel} from '@angular/forms';
import {CountryISO} from 'ngx-intl-tel-input';

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
  private isLoading = false;
  private isError = false;
  private paymentReceiptFile = undefined;
  private diarLemdinaLimit = 680;
  private edenLimit = 200;
  @ViewChild('registrationForm', {static: false}) registrationForm;
  private preferredCountries: CountryISO[] = [CountryISO.Tunisia];
  private accommodations: string[] = [];

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
      '',
      '',
      '',
      '',
      ''
  );
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
              user.phoneNumber ? user.phoneNumber : '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              ''
          );
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
        this.diarLemdina.subscribe(value => {
          if (value.count < this.diarLemdinaLimit) {
            if (!this.accommodations.find(x => x === 'Diar Lemdina')) {
              this.accommodations.push('Diar Lemdina');
            }
          } else {
            if (this.accommodations.find(x => x === 'Diar Lemdina')) {
              this.accommodations = this.accommodations.filter(item => item !== 'Diar Lemdina');
            }
          }
        });

        this.edenDoc = afs.doc<Accommodation>('accommodations/Eden');
        this.eden = this.edenDoc.valueChanges();
        this.eden.subscribe(value => {
          if (value.count < this.edenLimit) {
            if (!this.accommodations.find(x => x === 'Eden')) {
              this.accommodations.push('Eden');
            }
          } else {
            if (this.accommodations.find(x => x === 'Eden')) {
              this.accommodations = this.accommodations.filter(item => item !== 'Eden');
            }
          }
        });
      }
    });
  }

  update() {
    this.isError = false;

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
    } else {
      this.isLoading = true;

      const callable = this.fns.httpsCallable('setAccommodation');
      callable({accommodation: this.userProfileInput.accommodation}).toPromise().then(() => {
        const callableMail = this.fns.httpsCallable('sendMail');
        callableMail({}).toPromise().then(() => {
          this.userProfileDoc.set(Object.assign({}, this.userProfileInput)).then(() => {
            this.isLoading = false;
            this.isSuccess = true;
            setTimeout(() => {
              window.location.href = 'https://www.facebook.com/ieee.tsyp';
            }, 5000);
          });
        }).catch(() => {
          this.isLoading = false;
          this.isError = true;
        });
      }).catch(() => {
        this.isLoading = false;
        this.isError = true;
      });
    }
  }

  uploadFile(event) {
    this.paymentReceiptFile = event.target.files[0];
  }

}
