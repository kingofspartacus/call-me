import React, { useState } from 'react'
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from "@react-native-firebase/app";
import styles from '../StyleSheet/SignUpTS'

export default function Register({ navigation }: { navigation: any }) {
  const [Email, useEmail] = useState('');
  const [Password, UsePassword] = useState('');
  const [Name, setName] = useState('');
  const [ImgUrl, setImgUrl] = useState('');

  // const auth = firebase.auth();
  const regisiter = (Email: string, Password: string) => {
    if (!Email.trim()) {
      Alert.alert(
        "Thông báo",
        "Điền cái Email đi! Làm ơn",
      );
      return;
    }
    if (!Password.trim()) {
      Alert.alert(
        "Thông báo",
        "Điền nốt cái mật khẩu đi! Làm ơn",
      );
      return;
    }
    if (!Name.trim()) {
      Alert.alert(
        "Thông báo",
        "Xin đấy sao ko điền nốt cái tên vào rồi hãy sign in",
      );
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
            displayMail: Email,
            status: false,
            calling: false,
            token: '',
            ImgUrl: ImgUrl

              ? ImgUrl
              : 'https://cdn0.iconfinder.com/data/icons/set-ui-app-android/32/8-512.png',
          });
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
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
          placeholderTextColor="grey"
          placeholder="Enter your email here"
          style={styles.TextIP}
        />
        <TextInput
          onChangeText={UsePassword}
          value={Password}
          placeholderTextColor="grey"
          placeholder="Enter your passwork here"
          style={styles.TextIP}
          secureTextEntry={true}
        />
        <TextInput
          onChangeText={setName}
          value={Name}
          placeholderTextColor="grey"
          placeholder="Enter your name here"
          style={styles.TextIP}
        />
        <TextInput
          onChangeText={setImgUrl}
          value={ImgUrl}
          placeholderTextColor="grey"
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
