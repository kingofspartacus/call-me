
import React, { useState, useEffect } from 'react';
import {
  Text, ActivityIndicator, TextInput, Button, FlatList, View, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform
} from 'react-native';

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';

import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import Icon from 'react-native-vector-icons/FontAwesome';

import AgoraUIKit from 'agora-rn-uikit';
import RNCallKeep from 'react-native-callkeep';
import uuid from 'uuid';

interface itemProps {
  uid: string,
  email: string,
  phone: string,
  token: string,
  status: string,
}

// interface resProps {
//   uidCaller: number,
//   appId: string,
//   channel: string,
//   tokenCaller: string
// }

// interface rtcPropsReceiver {
//   uidReceiver: number,
//   appId: string,
//   channel: string,
//   tokenReceiver: string
// }

const App = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<itemProps[]>([]);

  const [receiverFCMToken, setReceiverFCMToken] = useState('');

  const [videoCall, setVideoCall] = useState(false);
  const [rtcProps, setRtcProps] = useState({
    uid: 0,
    appId: '',
    channel: '',
    token: '',
    callerFCMToken: ''
  });
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.PhoneAuthSnapshot | null>(null);

  const [code, setCode] = useState('');

  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);

    if (user) {
      const reference = database().ref(`/online/${user.uid}`);

      messaging().getToken().then(token => {
        reference.set({
          uid: user.uid,
          email: user.email,
          phone: user.phoneNumber,
          token: token,
          status: "Online"
        }).then(() => console.log('Online presence set'));
      })

      // Remove the node whenever the client disconnects
      reference
        .onDisconnect()
        .update({
          status: "Offline",
        })
        .then(() => console.log('On disconnect function configured.'));
    }
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    try {
      RNCallKeep.setup({
        ios: {
          appName: 'Call-Me',
        },
        android: {
          alertTitle: 'Permissions required',
          alertDescription: 'This application needs to access your phone accounts',
          cancelButton: 'Cancel',
          okButton: 'ok',
          additionalPermissions: [PermissionsAndroid.PERMISSIONS.example],
          // foregroundService: {
          //   channelId: 'com.company.my',
          //   channelName: 'Foreground service for my app',
          //   notificationTitle: 'My app is running on background',
          //   notificationIcon: 'Path to the resource icon of the notification',
          // },
          // selfManaged: true
        }
      });
      RNCallKeep.setAvailable(true);
    } catch (err) {
      console.error('initializeCallKeep error:', err.message);
    }

    if (Platform.OS === 'android') {
      requestCameraAndAudioPermission().then(() => {
        console.log('Requested Camera and Audio Permission!')
      })
    } else {
      requestUserPermission().then(() => {
        console.log('Requested Notification Permission!')
      })
    }
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    const onValueChange = database()
      .ref(`/online/`)
      .on('value', snapshot => {
        let listUserOnline: itemProps[] = [];
        snapshot.forEach(userOnline => {
          if (userOnline.val().status !== "Offline") {
            if (user?.email !== userOnline.val().email) {
              listUserOnline.push(userOnline.val())
            }
          }
          return undefined;
        })
        setOnlineUsers(listUserOnline)
      });

    // Stop listening for updates when no longer required
    return () => database().ref(`/online/`).off('value', onValueChange);
  }, [user]);

  useEffect(() => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      if (remoteMessage.data) {
        const rtcPropsReceiver = remoteMessage.data;
        const { uid, appId, channel, rtctoken, callerFCMToken } = JSON.parse(rtcPropsReceiver.json);
        setRtcProps({ uid: uid, appId: appId, channel: channel, token: rtctoken, callerFCMToken: callerFCMToken });
        setVideoCall(true);
      }
    });

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log("1")
      if (remoteMessage.notification) {
        if (remoteMessage.notification.title === 'A Call Incoming!') {
          if (remoteMessage.data) {
            // console.log("RTCPropsReceiver: ", remoteMessage.data)
            RNCallKeep.displayIncomingCall(uuid.v4(), "0977052703", 'Hieu Hoang', 'number', true);

            const rtcPropsReceiver = remoteMessage.data;
            const { uid, appId, channel, rtctoken, callerFCMToken } = JSON.parse(rtcPropsReceiver.json);
            setRtcProps({ uid: uid, appId: appId, channel: channel, token: rtctoken, callerFCMToken: callerFCMToken });
          }
        } else if (remoteMessage.notification.title === 'Call Rejected!') {
          if (remoteMessage.notification.title) {
            showMessage({
              message: remoteMessage.notification.title,
              description: remoteMessage.notification.body,
              type: "default",
              floating: true,
              backgroundColor: "#010101",
              color: "#ffffff"
            });
          }
        } else {
          console.log("?????")
        }
      }

    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    RNCallKeep.addEventListener('didReceiveStartCallAction', ({ handle, callUUID, name }) => {
      console.log('didReceiveStartCall')
      if (!handle) {
        // @TODO: sometime we receive `didReceiveStartCallAction` with handle` undefined`
        return;
      }
    });
    RNCallKeep.addEventListener('didDisplayIncomingCall', ({ error, callUUID, handle, localizedCallerName, hasVideo, fromPushKit, payload }) => {
      // you might want to do following things when receiving this event:
      // - Start playing ringback if it is an outgoing call
      console.log('didDisplayIncomingCall')
    });
    RNCallKeep.addEventListener('answerCall', answerCall);
    RNCallKeep.addEventListener('endCall', endCall);
    // RNCallKeep.addEventListener('showIncomingCallUi', ({ handle, callUUID, name }) => {
    //   console.log('showIncomingCallUi')
    // });
    return () => {
      RNCallKeep.removeEventListener('answerCall');
      RNCallKeep.removeEventListener('endCall');
    }
  }, []);

  const answerCall = ({ callUUID }: { callUUID: string }) => {
    console.log("User answer call");
    // RNCallKeep.startCall(callUUID, '0977052703', '0977052703');
    setVideoCall(true)
    RNCallKeep.rejectCall(callUUID);
    // RNCallKeep.backToForeground();
  };

  const endCall = ({ callUUID }: { callUUID: string }) => {
    if (videoCall) {
      console.log("End call after answerCall");
    } else {
      console.log("User reject Call");
      if (user) {
        console.log('mmmm')
        fetch('https://hieuhm-app-call-me.herokuapp.com/rejectCall', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: "User " + user.email + " rejected your call",
            token: rtcProps.callerFCMToken,
          })
        })
      }
    }
  };

  async function createAccount() {
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      console.log('User account created & signed in!');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('That email address is already in use!');
      }

      if (error.code === 'auth/invalid-email') {
        console.log('That email address is invalid!');
      }
      console.error(error);
    }
  }

  // Handle the verify phone button press
  async function verifyPhoneNumber(phoneNumber: string) {
    const confirmation = await auth().verifyPhoneNumber(phoneNumber);
    setConfirm(confirmation);
  }

  // Handle confirm code button press
  async function confirmCode() {
    if (confirm) {
      try {
        const credential = auth.PhoneAuthProvider.credential(confirm.verificationId, code);
        const { currentUser } = auth();

        if (currentUser) {
          let userData = await currentUser.linkWithCredential(credential);
          setUser(userData.user);
        }
        console.log('User account created & signed in!');
      } catch (error) {
        if (error.code == 'auth/invalid-verification-code') {
          console.log('Invalid code.');
        } else {
          console.log('Account linking error');
        }
      }
    }
  }

  const requestCameraAndAudioPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ])
      if (
        granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        && granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('You can use the cameras & mic')
      } else {
        console.log('Permission denied')
      }
    } catch (err) {
      console.warn(err)
    }
  }

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  const callbacks = {
    EndCall: () => setVideoCall(false),
  };

  async function login() {
    try {
      await auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
        // Signed in
        // setUser(userCredential.user)
        // ...
      })
    } catch (error) {
      let errorCode = error.code;
      let errorMessage = error.message;
      console.log(errorCode + ": " + errorMessage);
    };
  }

  function signOut() {
    if (user) {
      database().ref(`/online/${user.uid}`).update({
        status: "Offline",
      });
    }
    setConfirm(null)
    auth()
      .signOut()
      .then(() => console.log('User signed out!'));
  }

  function sendNotification(item: itemProps) {
    if (user) {
      if (Platform.OS === 'android') {
        RNCallKeep.startCall(uuid.v4(), "0977052703", "Hieu Hoang", "number", true);
        messaging().getToken().then(callerFCMToken => {
          fetch('https://hieuhm-app-call-me.herokuapp.com/sendNotification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: user.uid,
              isPublisher: true,
              message: "User " + user.email + " is calling you now",
              receiverFCMtToken: item.token,
              callerFCMToken: callerFCMToken
            })
          })
            .then(res => res.json())
            .then((res) => {
              setRtcProps({ uid: res.uidCaller, appId: res.appId, channel: res.channel, token: res.tokenCaller, callerFCMToken: '' });
              setVideoCall(true);
            })
        }).then(() => console.log('Calling!'));
      } else {
        messaging().getToken().then(callerFCMToken => {
          fetch('https://hieuhm-app-call-me.herokuapp.com/sendNotification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: user.uid,
              isPublisher: true,
              message: "User " + user.email + " is calling you now",
              receiverFCMToken: item.token,
              callerFCMToken: callerFCMToken
            })
          })
            .then(res => res.json())
            .then((res) => {
              setRtcProps({ uid: res.uidCaller, appId: res.appId, channel: res.channel, token: res.tokenCaller, callerFCMToken: '' });
              setVideoCall(true);
            })
        }).then(() => console.log('Calling!'));
      }

      // RNCallKeep.answerIncomingCall(uuid.v4())

      // setTimeout(() => {
      //   console.log("timeout");
      //     RNCallKeep.reportEndCallWithUUID("Hieu Hoang", 6);
      // }, 5000);
    }
  }

  if (initializing) return <ActivityIndicator size="large" />;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Email:</Text>
        <TextInput style={styles.textInput} value={email} onChangeText={text => setEmail(text)} />
        <Text>Password:</Text>
        <TextInput style={styles.textInput} value={password} onChangeText={text => setPassword(text)} />
        <Button title="Login" onPress={() => login()} />

        <Button title="Create Account" onPress={() => createAccount()} />
      </View>
    );
  } else if (!user.phoneNumber) {
    if (!confirm) {
      return (
        <>
          <Text>Current account: {user.email}</Text>
          <Text>Phone Number:</Text>
          <TextInput value={phoneNumber} onChangeText={text => setPhoneNumber(text)} />
          <Button
            title="Verify Phone Number"
            onPress={() => verifyPhoneNumber("+84" + phoneNumber)}
          />
        </>
      );
    }
    return (
      <>
        <TextInput value={code} onChangeText={text => setCode(text)} />
        <Button title="Confirm Code" onPress={() => confirmCode()} />
      </>
    );
  } else {
    if (videoCall) {
      return (
        <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
      )
    }
    return (
      <>
        {videoCall ? <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
          :
          <View style={styles.container}>
            <Text>
              Welcomeee! {user.phoneNumber} linked with {user.email}
            </Text>
            <FlatList
              data={onlineUsers}
              renderItem={
                ({ item }: { item: itemProps }) => (
                  <TouchableOpacity style={styles.item} activeOpacity={0.75} onPress={() => sendNotification(item)}>
                    <Text>{item.email}</Text>
                    <Text>{item.phone}</Text>
                    {item.status === "Online" ?
                      <View style={{ flexDirection: "row" }}>
                        <Icon name="circle" size={16} color="#00FF00" />
                        <Text> Online</Text>
                      </View>
                      :
                      <View style={{ flexDirection: "row" }}>
                        <Icon name="circle" size={16} color="#FFD500" />
                        <Text> In Call</Text>
                      </View>}
                  </TouchableOpacity>
                )
              }
              keyExtractor={(item, index) => index.toString()}
            />
            <Button title="Sign Out" onPress={() => signOut()} />
            <FlashMessage position="top" />
          </View>
        }
      </>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 16,
    paddingTop: '10%',
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#D3DDFC',
    borderRadius: 12
  },
  textInput: {
    color: '#000000',
  },
  button: {
    marginTop: '5%',
  }
});

export default App;
