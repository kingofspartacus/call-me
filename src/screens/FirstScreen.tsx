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
  const [AuthImg, setAuthImg] = useState();
  const [AuthName, setAuthName] = useState();
  const [AuthMail, setAuthMail] = useState();
  const [videoCall, setVideoCall] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const rtcProps = {
    appId: 'bd082fe6626440a6b16e6256814524f8',
    channel: uuid.v4().toString(),
  };
  const [messageReceiver, setMessageReceiver] = useState({
    appId: '',
    channel: '',
  });
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
    firestore().collection('users').doc(authID).get()
      .then(authUser => {
        const docsData: any = authUser
        setAuthImg(docsData._data.ImgUrl)
        setAuthName(docsData._data.displayName)
        setAuthMail(docsData._data.displayMail)
      })
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
      RNCallKeep.hasDefaultPhoneAccount();
    }
  }
  async function display() {
    await definirContaTelefonePadrao();
    const UUID = createUUID();
    try {
      RNCallKeep.displayIncomingCall(
        UUID,
        'Your call is comming',
        'Galic4',
      );
      RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
        RNCallKeep.rejectCall(callUUID);
        RNCallKeep.backToForeground();
        setVideoCall(true);
        firestore().collection('users').doc(authID).update({ calling: true })
      });
      RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
        RNCallKeep.rejectCall(callUUID);
      });
      setTimeout(() => {
        RNCallKeep.rejectCall(UUID);
      }, 15000);
    } catch (error) {
      console.log('Error: ', error);
    }
  }
  useEffect(() => {
    messaging().onMessage((remoteMessage: any) => {
      const msDataReceiver = remoteMessage.data;
      const { dataChannel } = JSON.parse(msDataReceiver.json);
      setMessageReceiver({ appId: dataChannel.appId, channel: dataChannel.channel, });
      definirContaTelefonePadrao(),
        display()
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
    fetch('https://c6f5-42-113-119-178.ngrok.io/send-noti', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tokens: item.token,
        dataChannel: rtcProps,
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
  return (
    videoCall === false ?
      <View style={styles.container}>
        <Image source={require('../assets/images/background.jpg')} style={{ width: '100%', height: '100%', position: 'absolute' }} />
        <View style={styles.back}>
          <Text style={styles.logo}>CALL ME</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} >
            <Image source={{ uri: AuthImg }} style={styles.Profile} />
          </TouchableOpacity>
        </View>
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
                <Image source={{ uri: AuthImg }} style={styles.ProfileMD} />
                <Text style={styles.Mdtxt}>Name: {AuthName}</Text>
                <Text style={styles.Mdtxt}>Email: {AuthMail}</Text>
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
                        {item.item.calling === false ?
                          <View />
                          :
                          <View style={styles.callstatus}>
                            <Text style={styles.statusCallText}>Has other call</Text>
                          </View>
                        }
                      </View>
                    </View>
                  </View>
                  : <View />
              )
            }}
            renderHiddenItem={(item: any) => {
              return (
                item.item.calling === false ?
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
            rightOpenValue={-100}
          />
        </View>
      </View> :
      <AgoraUIKit rtcProps={messageReceiver} callbacks={callbacks} />
  )
}