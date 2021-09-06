import express from "express";
import admin from 'firebase-admin';
import Agora from "agora-access-token";

const app = express();
app.use(express.json());

const appId = "68371bfc640d47a091b607b32dd6599f";
const appCertificate = "f354e072508440c2bf731b600e7f62ea";
const expirationTimeInSeconds = 3600;

const serviceAccount = require("../appcall-95336-firebase-adminsdk-gldkk-2bdb0b1707.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://appcall-95336-default-rtdb.firebaseio.com"
});

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Working!");
});

app.post("/sendNotification", (req, res) => {
  console.log(req.body)

  const uidCaller = Math.floor(Math.random() * 100000);
  const uidReceiver = Math.floor(Math.random() * 100000);
  const role = req.body.isPublisher ? Agora.RtcRole.PUBLISHER : Agora.RtcRole.SUBSCRIBER;
  const channel = Math.floor(Math.random() * 100000).toString();
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;
  const tokenCaller = Agora.RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channel, uidCaller, role, expirationTimestamp);
  const tokenReceiver = Agora.RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channel, uidReceiver, role, expirationTimestamp);

  const data = {
    channel: channel,
    rtctoken: tokenReceiver,
    uid: uidReceiver,
    appId: appId,
    callerFCMToken: req.body.callerFCMToken
  }

  const message = {
    notification: {
      title: 'A Call Incoming!',
      body: req.body.message
    },
    token: req.body.receiverFCMToken,
    data: {
      json: JSON.stringify(data)
    }
  }

  admin.messaging().send(message).then(() => {
    console.log('Sent Call Notification')
    res.send({ uidCaller, appId, channel, tokenCaller });
  }).catch(err => {
    console.log(err)
  })
})



app.post("/rejectCall", (req, res) => {
  const message = {
    notification: {
      title: 'Call Rejected!',
      body: req.body.message
    },
    token: req.body.token,
  }
  admin.messaging().send(message).then(() => {
    console.log('Sent Reject Notification')
    res.send('Done')
  }).catch(err => {
    console.log(err)
  })
  // res.send({ uid, appId, channel, token });
});

app.listen(port, () => {
  return console.log(`Server is listening on http://localhost:${port}`);
});