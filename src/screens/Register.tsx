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
  const regisiter = (Email: string, Password: string) => {
    if (!Email.trim()) {
      Alert.alert(
        "Alert",
        "Please enter your Email",
      );
      return;
    }
    if (!Password.trim()) {
      Alert.alert(
        "Alert",
        "Please enter your Password",
      );
      return;
    }
    if (!Name.trim()) {
      Alert.alert(
        "Alert",
        "Please enter your Name",
      );
      return;
    }
    auth()
      .createUserWithEmailAndPassword(Email, Password)
      .then(() => {
        const authCurrent: any = firebase.auth().currentUser;
        Alert.alert(
          "Alert",
          "Registed success",
        );
        firestore()
          .collection('users').doc(authCurrent.uid).set({
            id: authCurrent.uid,
            displayName: Name,
            displayMail: Email,
            status: false,
            calling: false,
            acceptCall: true,
            token: '',
            ImgUrl: ImgUrl
              ? ImgUrl
              : 'https://cdn0.iconfinder.com/data/icons/set-ui-app-android/32/8-512.png',
          });
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert(
            "Alert",
            "Email existed! Change your Email",
          );
        }
        if (error.code === 'auth/invalid-email') {
          Alert.alert(
            "Alert",
            "Invalid Email! Change your Email",
          );
        }
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
          placeholder="Enter your password here"
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