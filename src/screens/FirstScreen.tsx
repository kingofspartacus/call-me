import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from "@react-native-firebase/app";
import styles from '../StyleSheet/FirstScreenTS'


export default function FirstScreen({ navigation }: { navigation: any }) {
  const [data, setData] = useState([]);
  const [authID, setAuthId] = useState();
  // const [authenUser, setAuthenUser] = useState([])
  useEffect(() => {
    auth()
    const authCurrent: any = firebase.auth().currentUser?.uid;
    // const authUser:any = firebase.auth().currentUser
    // setAuthenUser(authUser)
    // console.log('auth', authUser)
    setAuthId(authCurrent);
    firestore().collection('users').onSnapshot(querySnapshot => {
      const docsData: any = querySnapshot.docs.map(doc => ({
        ...doc.data()
      }));
      setData(docsData);
    })
  }, []);
  useEffect(() => {
    firestore().collection('users').doc(authID).update({
      status: true,
    });
  }, [authID])
  const SignOut = (authID: any) => {
    firestore().collection('users').doc(authID).update({ status: false, });
    auth().signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch(error => {
        console.log('Error getting documents: ', error);
      });
  };
  return (
    <View>
      <View style={styles.header}>
        <View style={styles.containerLeft}>
          {/* <Image source={{ uri: authenUser.photoURL }} style={styles.ImgT} /> */}
          <Text style={styles.title}>Call Me</Text>
        </View>
        <TouchableOpacity onPress={() => { SignOut(authID) }} style={styles.btout}>
          <Text style={styles.outtxt}>Log out</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        renderItem={(item: any) => {
          return (
            authID !== item.item.id ?
              <View style={styles.containerL}>
                <View style={styles.containerLeft}>
                  <View style={styles.ContainerImg}>
                    <Image source={{ uri: item.item.ImgUrl }} style={styles.Img} />
                    {item.item.status === true ?
                      <View style={styles.onlineSt} />
                      :
                      <View style={styles.offlineSt} />
                    }
                  </View>
                  <View style={styles.center}>
                    <Text style={styles.nameTS}>{item.item.displayName}</Text>
                    <Text style={styles.mailTS}>{item.item.emailUser}</Text>
                  </View>
                </View>
                {item.item.status === true 
                ?
                  <TouchableOpacity>
                    <Image source={require('../assets/images/CallIcon.png')} style={styles.IconCall} />
                  </TouchableOpacity>
                :
                  <View/>
                }

              </View>
              : <View />
          )
        }}
      />
    </View>
  )
}