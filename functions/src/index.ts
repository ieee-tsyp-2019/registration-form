// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

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
        countMaximum = 680;
      } else {
        countMaximum = 200;
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

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

exports.sendMail = functions.https.onCall(async (data: any, context: any) => {
  const mailOptions = {
    to: context.auth.token.email,
    subject: 'TSYP registration confirmation',
    html: `<html>
<head>
\t<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
\t<title>TSYP registration confirmation</title>
\t<link id="avast_os_ext_custom_font" href="chrome-extension://mbckjcfnjmoiinpgddefodcighgikkgn/common/ui/fonts/fonts.css" rel="stylesheet" type="text/css">
</head>
<body>
\t<p>Dear ${context.auth.token.name},</p>
\t<p>&nbsp;</p>
\t<p>CONGRATULATIONS!</p>
\t<p>You have been successfully registered for the IEEE TSYP 2019 CONGRESS! 
\t</p>
\t<p>&nbsp;</p>
\t<p>With love,</p>
\t<p>TSYP Organizing Committee.</p>
\t<p>&nbsp;</p>
\t</div>


\t<table width="388" cellspacing="0" cellpadding="0" border="0"> 
\t\t<tr> 
\t\t\t<td width="200" style="vertical-align:top;padding-right:20px"><a style="display:inline-block" href="https://tsyp.ieee.tn"><img style="border:none" width="200" src="https://s1g.s3.amazonaws.com/f462efbf99e2463eeb2701facd472c2f.png"></a></td>
\t\t\t<td style="border-left:solid #61605b 2px" width="22"></td> 
\t\t\t<td style="vertical-align: top; text-align:center;color:#000000;font-size:12px;font-family:'trebuchet ms';; text-align:center"> <span><b><span style="color:#997d18;font-size:15px;font-family:'trebuchet ms'">IEEE TUNISIAN STUDENTS AND YOUNG PROFESSIONALS CONGRESS</span></b><br> </span> <br> <table cellspacing="0" cellpadding="0" border="0" style="margin:0 10px 10px 0"><tr>
\t\t\t<td style="padding-right:10px;padding-left:30px;"><img width="40" height="40" src="https://s1g.s3.amazonaws.com/554c257930b241300f69b8999809b796.png" alt="email" style="border:none"></td>
\t\t\t<td><span style="font:12px 'trebuchet ms'"><a href="mailto:tsyp@ieee.org" style="color:#000000;text-decoration:none">tsyp@ieee.org</a></span></td>
\t\t</tr>
\t\t<tr>
\t\t\t<td style="padding-right:5px; padding-left:10px;"><a href="https://facebook.com/ieee.tsyp/" style="display: inline-block"><img width="40" height="40" src="https://s1g.s3.amazonaws.com/aa07c6113198c90008b3d1ecc7b95317.png" alt="Facebook" style="border:none"></a></td>
\t\t\t<td style="padding-right:5px"><a href="https://instagram.com/ieee_tsyp2k19/" style="display: inline-block"><img width="40" height="40" src="https://s1g.s3.amazonaws.com/67da714565d9f77774d241b2b51bf1ca.png" alt="Instagram" style="border:none"></a></td>
\t\t\t<td style="padding-right:5px"><a href="https://tsyp.ieee.tn" style="display: inline-block"><img width="40" height="23" src="https://i.ibb.co/Yf4dNMb/web-icon.png" alt="web" style="border:none"></a></td>
\t\t</tr>
\t</table> Medina Convention Center<br>Yasmine Hammamet<br>Tunisia<br><br> <table cellpadding="0" cellpadding="0" border="0">


 </body>
 </html>`
  };

  return mailTransport.sendMail(mailOptions, (error: any) => {
    if (error) {
      console.error(error.toString());
      return error.toString();
    }

    console.log('Success');
    return 200;
  });
});
