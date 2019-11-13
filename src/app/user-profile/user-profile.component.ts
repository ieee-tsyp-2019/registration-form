import {Component} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import {UserProfile} from '../user-profile';
import {AngularFireStorage} from '@angular/fire/storage';

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
  private paymentReceiptUrl;

  constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore, private storage: AngularFireStorage) {
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
          }
        });
      }
    });
  }

  update() {
    this.userProfileDoc.set(Object.assign({}, this.userProfileInput));
  }

  uploadFile(event) {
    const file = event.target.files[0];
    const filePath = 'users/' + this.userProfileInput.email + '/payment-receipt';
    const task = this.storage.upload(filePath, file);
    this.uploadProgress = task.percentageChanges();
  }

  loadPaymentReceipt(filePath) {
    const ref = this.storage.ref(filePath);
    this.paymentReceiptUrl = ref.getDownloadURL();
  }

}
