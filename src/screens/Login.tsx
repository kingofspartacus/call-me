import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import auth from '@react-native-firebase/auth';
export default function Login({ navigation }: { navigation: any }) {
  // const navigation = useNavigation()
  const [Email, useEmail] = useState('');
  const [Password, UsePassword] = useState('');
  const [user, setUser] = useState();
  const SignIn = (Email: string, Password: string) => {
    auth()
      .signInWithEmailAndPassword(Email, Password)
      .catch(error => {
        var errorMessage = error.message;
        alert(errorMessage);
      });
  };
  function onAuthStateChanged(user: any) {
    if (user) {
      navigation.replace('FirstScreen');
    }
  }
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);
  return (
    <View>
      <TextInput
        onChangeText={useEmail}
        value={Email}
        placeholder="User name"
      />
      <Text>Password</Text>
      <TextInput
        onChangeText={UsePassword}
        value={Password}
        placeholder="Password"
      />
      <TouchableOpacity onPress={() => SignIn(Email, Password)}>
        <Text>Đăng nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text>Sign Up</Text>
      </TouchableOpacity>
    </View>
  )
}