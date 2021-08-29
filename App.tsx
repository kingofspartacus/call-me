import React ,{useEffect} from 'react'
import { View, Text } from 'react-native'
import AuthStack from './src/navigation/AuthStack'
import messaging from '@react-native-firebase/messaging';

export default function App() {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);
  return (
    <AuthStack />
  )
}
