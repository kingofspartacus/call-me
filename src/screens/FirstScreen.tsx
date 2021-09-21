import React, { useState, useEffect } from 'react'
import { View, Modal, Text, TouchableOpacity, Image, Alert, PermissionsAndroid } from 'react-native'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from "@react-native-firebase/app";
import messaging from '@react-native-firebase/messaging';
import RNCallKeep from 'react-native-callkeep';
import AgoraUIKit from 'agora-rn-uikit';
import { SwipeListView } from 'react-native-swipe-list-view';
import uuid from 'react-native-uuid';
import createUUID from '../helpers/createUUID';
import styles from '../StyleSheet/FirstScreenTS';

export default function FirstScreen({ navigation }: { navigation: any }) {
  const [data, setData] = useState([]);
  const [authID, setAuthId] = useState();
  const [IDsender, setIDsender] = useState();
  const [videoCall, setVideoCall] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [messageReceiver, setMessageReceiver] = useState({
    appId: '',
    channel: '',
  });
  const [userAuth, setUserAuth] = useState({
    ImgUrl: '',
    displayMail: '',
    displayName: '',
    acceptCall: true
  });
  const rtcProps = {
    appId: 'bd082fe6626440a6b16e6256814524f8',
    channel: uuid.v4().toString(),
    UidSender: authID,
  };
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
    firestore().collection('users').doc(authCurrent).onSnapshot(authUser => {
      const docsData: any = authUser
      setUserAuth(docsData._data)
    })

  }, []);
  useEffect(() => {
    messaging().getToken().then((token: string) => {
      firestore().collection('users').doc(authID).update({
        status: true,
        token: token
      });
    })
      .catch(token => {
        console.log('Error getting documents: ', token);
      });

  }, [authID]);

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
  useEffect(() => {
    RNCallKeep.setup(options).then((accepted) => {
      RNCallKeep.setAvailable(true);
    });
  }, []);
  const answerCall = ({ callUUID }: { callUUID: string }) => {
    setVideoCall(true)
    RNCallKeep.rejectCall(callUUID)
    firestore().collection('users').doc(authID).update({ calling: true })
  };
  const endCall = ({ callUUID }: { callUUID: string }) => {
    if (videoCall === false) {
      firestore().collection('users').doc(IDsender).update({ acceptCall: false })
    } else {
      firestore().collection('users').doc(IDsender).update({ acceptCall: true })
    }
  };
  useEffect(() => {
    RNCallKeep.addEventListener('answerCall', answerCall);
    RNCallKeep.addEventListener('endCall', endCall);
    return () => {
      RNCallKeep.removeEventListener('answerCall');
      RNCallKeep.removeEventListener('endCall');
    }
  });
  async function PermissionCall() {
    const status = await RNCallKeep.hasPhoneAccount();
    if (status == false) {
      RNCallKeep.hasDefaultPhoneAccount();
    }
  }
  async function display() {
    await PermissionCall();
    const UUID = createUUID();
    RNCallKeep.displayIncomingCall(
      UUID,
      'Your call is comming',
      'Galic4',
    )
    setTimeout(() => {
      firestore().collection('users').doc(IDsender).update({ acceptCall: false })
      RNCallKeep.rejectCall(UUID);
    }, 15000);
  }
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      const msDataReceiver: any = remoteMessage.data;
      const { dataChannel } = JSON.parse(msDataReceiver.json);
      setIDsender(dataChannel.UidSender)
      setMessageReceiver({ appId: dataChannel.appId, channel: dataChannel.channel, });
      PermissionCall()
      display()
    })
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage((remoteMessage: any) => {
      const msDataReceiver = remoteMessage.data;
      const { dataChannel } = JSON.parse(msDataReceiver.json);
      setIDsender(dataChannel.UidSender)
      setMessageReceiver({ appId: dataChannel.appId, channel: dataChannel.channel, });
      PermissionCall()
      display()
    })
    return unsubscribe;
  }, []);
  useEffect(() => {
    if (userAuth?.acceptCall === false) {
      setVideoCall(false),
        firestore().collection('users').doc(authID).update({ calling: false })
    }
  }, [userAuth?.acceptCall])
  async function SignOut(authID: any) {
    await firestore().collection('users').doc(authID).update({
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
    fetch('https://call-me1.herokuapp.com/send-noti', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tokens: item.token,
        dataChannel: rtcProps,
        message: 'You have a call with ' + userAuth?.displayName,
      }),
    })
    setMessageReceiver({ appId: rtcProps.appId, channel: rtcProps.channel });
    setVideoCall(true);
    firestore().collection('users').doc(authID).update({ calling: true })
  }
  const callbacks = {
    EndCall: () => {
      setVideoCall(false),
        firestore().collection('users').doc(authID).update({ calling: false })
    }
  };
  const AcceptUserBusy = () => {
    firestore().collection('users').doc(authID).update({ acceptCall: true })
  }
  return (
    videoCall === false ?
      <View style={styles.container}>
        <Image source={require('../assets/images/background.jpg')} style={{ width: '100%', height: '100%', position: 'absolute' }} />
        <View style={styles.back}>
          <Text style={styles.logo}>CALL ME</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} >
            <Image source={{ uri: userAuth?.ImgUrl }} style={styles.Profile} />
          </TouchableOpacity>
        </View>
        {userAuth?.acceptCall === false ?
          Alert.alert(
            "Notification",
            "User is busy or doesn't pick up the phone",
            [
              { text: "OK", onPress: () => { AcceptUserBusy() } }
            ]) :
          <View />
        }
        <View style={styles.ListContainer}>
          {/* Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.modalcontainer}>
              <View style={styles.InfMDCon} >
                <Image source={{ uri: userAuth?.ImgUrl }} style={styles.ProfileMD} />
                <Text style={styles.Mdtxt}>Name: {userAuth?.displayName}</Text>
                <Text style={styles.Mdtxt}>Email: {userAuth?.displayMail}</Text>
              </View>
              <View style={styles.BtMdCon}>
                <TouchableOpacity style={styles.btgb} onPress={() => setModalVisible(!modalVisible)}>
                  <Text>Go back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btlo} onPress={() => { SignOut(authID) }} >
                  <Text>Log out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* Modal */}
          <SwipeListView
            data={data}
            style={styles.list}
            renderItem={(item: any) => {
              return (
                authID !== item.item.id ?
                  <View >
                    <View style={styles.Item}>
                      <View style={styles.containerAva}>
                        <Image source={{ uri: item.item.ImgUrl }} style={styles.Avatar} />
                        {item.item.status === true ?
                          <View style={styles.online} />
                          :
                          <View style={styles.offline} />
                        }
                      </View>
                      <View style={styles.TxtItem}>
                        <Text style={styles.name}>{item.item.displayName}</Text>
                        <Text style={styles.mail}>{item.item.displayMail}</Text>
                        {item.item.calling === true ?
                          <View style={styles.callstatus}>
                            <Text style={styles.statusCallText}>Has other call</Text>
                          </View> :
                          <View />
                        }
                      </View>
                    </View>
                  </View>
                  : <View />
              )
            }}
            renderHiddenItem={(item: any) => {
              return (
                item.item.calling === false && item.item.status === true ?
                  <TouchableOpacity style={styles.ItemBack} onPress={() => { sendNoti(item) }}>
                    <Image
                      source={require('../assets/images/call.png')}
                      style={styles.callBT}
                    />
                  </TouchableOpacity>
                  :
                  <View style={styles.ItemBackRJ}>
                    <Image
                      source={require('../assets/images/rejected-call.png')}
                      style={styles.callBT}
                    />
                  </View>
              )
            }}
            rightOpenValue={-110}
          />
        </View>
      </View> :
      <AgoraUIKit rtcProps={messageReceiver} callbacks={callbacks} />
  )
}