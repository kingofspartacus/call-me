import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, FlatList, Alert, PermissionsAndroid } from 'react-native'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from "@react-native-firebase/app";
import messaging from '@react-native-firebase/messaging';
import RNCallKeep from 'react-native-callkeep';
// import RNVoipCall from 'react-native-voip-call';
// import uuid from 'react-native-uuid';
import createUUID from '../helpers/createUUID';
interface optionsDefaultNumber {
  alertTitle: string,
  alertDescription: string,
}
export default function FirstScreen({ navigation }: { navigation: any }) {
  const [data, setData] = useState([]);
  const [authID, setAuthId] = useState();
  useEffect(() => {
    auth()
    const authCurrent: any = firebase.auth().currentUser?.uid;
    setAuthId(authCurrent);
    firestore().collection('users').onSnapshot(querySnapshot => {
      const docsData: any = querySnapshot.docs.map(doc => ({
        ...doc.data()
      }));
      setData(docsData);
    })
  }, []);
  useEffect(() => {
    messaging().getToken().then((token: any) => {
      firestore().collection('users').doc(authID).update({
        status: true,
        token: token
      });
    })
      .catch(token => {
        console.log('Error getting documents: ', token);
      });
  }, [authID])
  const options = {
    ios: {
      appName: 'Nome do meu app',
    },
    android: {
      alertTitle: 'Permissions required',
      alertDescription: 'This application needs to access your phone accounts',
      cancelButton: 'Cancel',
      okButton: 'ok',
      imageName: 'phone_account_icon',
      additionalPermissions: [PermissionsAndroid.PERMISSIONS.CALL_PHONE],
      foregroundService: {
        channelId: 'com.subridhhiapp',
        channelName: 'Foreground service for my app',
        notificationTitle: 'My app is running on background',
        notificationIcon: 'Path to the resource icon of the notification',
      },
    },
  };
  RNCallKeep.setup(options).then((accepted) => {
    RNCallKeep.setAvailable(true);
  });
  async function definirContaTelefonePadrao() {
    const status = await RNCallKeep.hasPhoneAccount();
    if (status == false) {
      const optionsDefaultNumber = {
        alertTitle: 'Default not set',
        alertDescription: 'Please set the default phone account'
      };
      RNCallKeep.hasDefaultPhoneAccount(optionsDefaultNumber);
    }
  }
  async function display() {
    await definirContaTelefonePadrao();
    const uuid = createUUID();
    try {
      RNCallKeep.displayIncomingCall(
        uuid,
        'Your call is comming',
        'Galic4',
      );
      RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
        console.log("ok connecting..");
        console.log('Answer: ' + callUUID);
        RNCallKeep.rejectCall(callUUID);
        RNCallKeep.backToForeground();
        navigation.navigate('nam');
      });
      RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
        console.log("ok end call");
        console.log('Reject: ' + callUUID);
        RNCallKeep.rejectCall(callUUID);
      });
    } catch (error) {
      console.log('Error: ', error);
    }
  }
  useEffect(() => {
    messaging().onMessage(remoteMessage => {
      definirContaTelefonePadrao(),
        display()
      // Alert.alert('a new notification', JSON.stringify(remoteMessage))
      // let callOptions = {
      //   callerId: '3boVthK6UqQYwI1lWBDoqhYjWhK2', // Important uuid must in this format
      //   ios: {
      //     phoneNumber: '0999999999', // Caller Mobile Number
      //     name: 'Test', // caller Name
      //     hasVideo: true,
      //   },
      //   android: {
      //     ringtuneSound: true, // default true
      //     ringtune: '', // add file inside Project_folder/android/app/res/raw
      //     duration: 30000, // default 30000
      //     vibration: true, // default is true
      //     channel_name: 'Calling', //
      //     notificationId: 123,
      //     notificationTitle: 'Incoming Call',
      //     notificationBody: 'Calling from Agora',
      //     answerActionTitle: 'Answer',
      //     declineActionTitle: 'Decline',
      //     missedCallTitle: 'Call Missed',
      //     missedCallBody: 'You missed a call',
      //   },
      // };
      // RNVoipCall.displayIncomingCall(callOptions);
      // RNVoipCall.onCallAnswer(() => {
      //   navigation.navigate('nam');
      //   RNVoipCall.endAllCalls();
      // });

    })
  })
  const SignOut = (authID: any) => {
    firestore().collection('users').doc(authID).update({
      status: false,
      token: null
    });
    auth().signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch(error => {
        console.log('Error getting documents: ', error);
      });
  };
  const sendNoti = ({ item }: { item: any }) => {
    fetch('https://8077-123-24-188-243.ngrok.io/send-noti', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tokens: item.token,
      }),
    })
  }
  return (
    <View>
      <TouchableOpacity onPress={() => { SignOut(authID) }}>
        <Text>Log out</Text>
      </TouchableOpacity>
      <FlatList
        data={data}
        renderItem={(item: any) => {
          return (
            authID !== item.item.id ?
              <TouchableOpacity onPress={() => { sendNoti(item) }}>
                <View>
                  <Text>{item.item.displayName}</Text>
                  <Image source={{ uri: item.item.ImgUrl }} style={{ height: 100, width: 100 }} />
                  {item.item.status === true ?
                    <Image source={require('../assets/images/online.png')} style={{ height: 20, width: 20 }} /> :
                    <Image source={require('../assets/images/offline.png')} style={{ height: 20, width: 20 }} />
                  }
                </View>
              </TouchableOpacity> : <View />
          )
        }}
      />
    </View>
  )
}