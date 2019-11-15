import {Component} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import {UserProfile} from '../user-profile';
import {AngularFireStorage} from '@angular/fire/storage';
import {AngularFireFunctions} from '@angular/fire/functions';
import {DatePipe} from '@angular/common';

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
  private uploadProgress;
  private diarLemdinaDoc;
  private diarLemdina;
  private edenDoc;
  private eden;
  private isAlreadyRegistred = false;
  private isSuccess = false;

  constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore, private storage: AngularFireStorage,
              private fns: AngularFireFunctions, public datepipe: DatePipe) {
    const todayDateString: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
    this.userProfileInput = new UserProfile(
      '',
      '',
      '',
      '',
      '',
      todayDateString,
      '',
      todayDateString,
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
              todayDateString,
              user.phoneNumber ? user.phoneNumber : '',
              todayDateString,
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
    this.userProfileDoc.set(Object.assign({}, this.userProfileInput));

    const callable = this.fns.httpsCallable('setAccommodation');
    callable({accommodation: this.userProfileInput.accommodation}).toPromise().then((result: any) => {
      console.log(result);
    }).catch((error: any) => {
      console.log(error);
    });

    this.isSuccess = true;
  }

  uploadFile(event) {
    const file = event.target.files[0];
    const filePath = 'users/' + this.userProfileInput.email + '/payment-receipt';
    const task = this.storage.upload(filePath, file);
    this.uploadProgress = task.percentageChanges();
  }

}
