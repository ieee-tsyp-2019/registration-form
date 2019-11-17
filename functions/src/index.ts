// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

export const setAccommodation = functions.https.onCall(async (data: any, context: any) => {
  const userId = context.auth.uid;
  if (!userId) {
    throw new Error('Missing Authentication');
  }

  await db.collection('accommodations').doc('Diar Lemdina').set({}, {merge: true});
  await db.collection('accommodations').doc('Eden').set({}, {merge: true});

  const diarLemdinaRef = await db.collection('accommodations').doc('Diar Lemdina');
  await db.runTransaction((transaction: any) => {
    return transaction.get(diarLemdinaRef).then((diarLemdinaDocument: any) => {
      if (diarLemdinaDocument.exists) {
        if (diarLemdinaDocument.data()[userId]) {
          throw new Error('Already in registred in Diar Lemdina');
        }

        if (!diarLemdinaDocument.data()['count']) {
          transaction.set(diarLemdinaRef, {
            count: 0
          });
        }
      } else {
        transaction.set(diarLemdinaRef, {
          count: 0
        });
      }

      transaction.set(diarLemdinaRef, {}, {merge: true});
    }).catch((error: any) => {
      throw new Error(error);
    });
  }).catch((error: any) => {
    throw new Error(error);
  });

  const edenRef = await db.collection('accommodations').doc('Eden');
  await db.runTransaction((transaction: any) => {
    return transaction.get(edenRef).then((edenDocument: any) => {
      if (edenDocument.exists) {
        if (edenDocument.data()[userId]) {
          throw new Error('Already in registred in Eden');
        }

        if (!edenDocument.data()['count']) {
          transaction.set(edenRef, {
            count: 0
          });
        }
      } else {
        transaction.set(edenRef, {
          count: 0
        });
      }

      transaction.set(edenRef, {}, {merge: true});
    }).catch((error: any) => {
      throw new Error(error);
    });
  }).catch((error: any) => {
    throw new Error(error);
  });

  const email = context.auth.token.email;
  if (!email) {
    throw new Error('Missing email address');
  }

  const {accommodation} = data;
  if (accommodation !== 'Diar Lemdina' && accommodation !== 'Eden') {
    throw new Error('Wrong accommodation name: ' + accommodation);
  }

  const accommodationRef = await db.collection('accommodations').doc(accommodation);
  return db.runTransaction((transaction: any) => {
    return transaction.get(accommodationRef).then((accommodationDocument: any) => {
      if (!accommodationDocument.exists) {
        throw new Error('Document does not exist');
      }

      const {count: count} = accommodationDocument.data();
      if (!count) {
        transaction.update(accommodationRef, {
          count: 0
        });
      }

      let countMaximum: number;
      if (accommodation === 'Diar Lemdina') {
        countMaximum = 1;
      } else {
        countMaximum = 1;
      }

      if (count >= countMaximum) {
        throw new Error('No more places in ' + accommodation);
      }

      transaction.update(accommodationRef, {
        count: count + 1
      });

      transaction.update(accommodationRef, {
        [userId]: email
      });
    });
  }).then(() => {
    return 'Successfully added to ' + accommodation;
  }).catch((error: any) => {
    return error;
  });
});
