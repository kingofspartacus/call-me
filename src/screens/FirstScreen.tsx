import React, { useState, useEffect } from 'react'
import { View, Modal, Text, TouchableOpacity, Image, FlatList, Alert, PermissionsAndroid } from 'react-native'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from "@react-native-firebase/app";
import messaging from '@react-native-firebase/messaging';
import RNCallKeep from 'react-native-callkeep';
import { SwipeListView } from 'react-native-swipe-list-view';
// import RNVoipCall from 'react-native-voip-call';
// import uuid from 'react-native-uuid';
import createUUID from '../helpers/createUUID';
import styles from '../StyleSheet/FirstScreenTS';

export default function FirstScreen({ navigation }: { navigation: any }) {
  const [data, setData] = useState([]);
  const [authID, setAuthId] = useState();
  const [AuthImg, setAuthImg] = useState();
  const [AuthName, setAuthName] = useState();
  const [AuthMail, setAuthMail] = useState();
  const [AuthToken, setAuthToken] = useState();
  const [modalVisible, setModalVisible] = useState(false);

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
        setAuthToken(docsData._data.token)
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
        navigation.navigate('Call');
      });
      RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
        console.log("ok end call");
        console.log('Reject: ' + callUUID);
        fetch('https://ed4e-58-186-58-82.ngrok.io/send-noti', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tokens: AuthToken,
          }),
        })
        RNCallKeep.rejectCall(callUUID);
      });
      setTimeout(() => {
        RNCallKeep.rejectCall(uuid);
      }, 15000);
    } catch (error) {
      console.log('Error: ', error);
    }
  }
  useEffect(() => {
    messaging().onMessage(remoteMessage => {
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
    fetch('https://ed4e-58-186-58-82.ngrok.io/send-noti', {
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
    <View style={styles.container}>
      <Image source={require('../assets/images/background.jpg')} style={{ width: '100%', height: '100%', position: 'absolute' }} />
      <View style={styles.back}>
        <Text style={styles.logo}>CALL ME</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} >
          {/* <TouchableOpacity onPress={() => { SignOut(authID) }} > */}
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
                      {item.item.status === true
                        ?
                        <View style={styles.online} />
                        :
                        <View style={styles.offline} />
                      }
                    </View>
                    <View style={styles.TxtItem}>
                      <Text style={styles.name}>{item.item.displayName}</Text>
                      <Text style={styles.mail}>{item.item.displayMail}</Text>
                    </View>
                  </View>
                </View>
                : <View />
            )
          }}
          renderHiddenItem={(item: any) => (
            <TouchableOpacity style={styles.ItemBack} onPress={() => { sendNoti(item), navigation.navigate('Call') }}>
              <Image
                source={require('../assets/images/call.png')}
                style={styles.callBT}
              />
            </TouchableOpacity>
          )}
          rightOpenValue={-100}
        />
      </View>
    </View>
  )
}