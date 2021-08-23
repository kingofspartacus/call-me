import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from "@react-native-firebase/app";
import { Alert } from 'react-native';
// import { auth, authCurrent } from '../components/FireConect';

export default function Register() {
  const [Email, useEmail] = useState('');
  const [Password, UsePassword] = useState('');
  const [Name, setName] = useState('');
  const [ImgUrl, setImgUrl] = useState('');
  // const auth = firebase.auth();
  const regisiter = (Email: string, Password: string) => {
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
    <View>
      <TextInput
        onChangeText={setName}
        value={Name}
        placeholder="Your name here"
      />
      <TextInput
        onChangeText={useEmail}
        value={Email}
        placeholder="Your email here"
      />
      <TextInput
        onChangeText={UsePassword}
        value={Password}
        placeholder="Your passwork here"
      />
      <TextInput
        onChangeText={setImgUrl}
        value={ImgUrl}
        placeholder="Your url image here"
      />
      <TouchableOpacity onPress={() => regisiter(Email, Password)}>
        <Text>Sign Up</Text>
      </TouchableOpacity>
    </View>
  )
}
