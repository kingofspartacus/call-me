import React, { useState } from 'react'
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from "@react-native-firebase/app";
import styles from '../StyleSheet/SignUpTS'
import messaging from '@react-native-firebase/messaging';
// import { auth, authCurrent } from '../components/FireConect';

export default function Register({ navigation }: { navigation: any }) {
  const [Email, useEmail] = useState('');
  const [Password, UsePassword] = useState('');
  const [Name, setName] = useState('');
  const [ImgUrl, setImgUrl] = useState('');
  
  // const auth = firebase.auth();
  const regisiter = (Email: string, Password: string) => {
    if (!Email.trim()) {
      alert('Please Enter Username');
      return;
    }
    if (!Password.trim()) {
      alert('Please Enter Password');
      return;
    }
    if (!Name.trim()) {
      alert('Please Enter Name');
      return;
    }
    auth()
      .createUserWithEmailAndPassword(Email, Password)
      .then((userCredential) => {
        const authCurrent: any = firebase.auth().currentUser;
        console.log('User account created & signed in!');
        Alert.alert(
          "Thông báo",
          "Đăng kí thành công",
          [
            { text: "OK" }
          ]
        );
        firestore()
          .collection('users').doc(authCurrent.uid).set({
            id: authCurrent.uid,
            displayName: Name,
            status: false,
            token: '',
            ImgUrl: ImgUrl
            
              ? ImgUrl
              : 'https://cdn0.iconfinder.com/data/icons/set-ui-app-android/32/8-512.png',
          });
         
        var user = userCredential.user;
        user
          .updateProfile({
            displayName: Name,
            photoURL: ImgUrl
              ? ImgUrl
              : 'https://cdn0.iconfinder.com/data/icons/set-ui-app-android/32/8-512.png',
          })
          .then(function () {
            // Update successful.
          })
          .catch(function (error) {
            // An error happened.
          });
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
          Alert.alert(
            "Email đã tồn tại",
            "Thay đổi email đăng ký",
            [
              { text: "Ok" }
            ]
          );
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
          Alert.alert(
            "Email chứa kí tự không hợp lệ",
            "Chỉnh sửa",
            [
              { text: "Ok" }
            ]
          );
        }

        console.error(error);
      });
  };
  return (
    <View style={styles.container}>
      <View style={styles.containersub}>
        <Image
          source={require('../assets/images/Logo2.png')}
          style={styles.Img}
        />
        <Text style={styles.Title}>Create Account</Text>
      </View>
      <View style={styles.containerIp}>
        <TextInput
          onChangeText={useEmail}
          value={Email}
          placeholder="Enter your email here"
          style={styles.TextIP}
        />
        <TextInput
          onChangeText={UsePassword}
          value={Password}
          placeholder="Enter your passwork here"
          style={styles.TextIP}
          secureTextEntry={true} 
        />
        <TextInput
          onChangeText={setName}
          value={Name}
          placeholder="Enter your name here"
          style={styles.TextIP}
        />
        <TextInput
          onChangeText={setImgUrl}
          value={ImgUrl}
          placeholder="Enter your url image here"
          style={styles.TextIP}
        />
      </View>
      <TouchableOpacity onPress={() => regisiter(Email, Password)} style={styles.Signup}>
        <Text style={styles.txtLogin}>Sign Up</Text>
      </TouchableOpacity>
      <Text style={styles.textOr}>or</Text>
      <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.Signup}>
        <Text style={styles.txtLogin}>Log in</Text>
      </TouchableOpacity>
    </View>
  )
}
