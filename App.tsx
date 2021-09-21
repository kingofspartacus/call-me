import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import AuthStack from './src/navigation/AuthStack'
import messaging from '@react-native-firebase/messaging';

export default function App() {
  return (
    <AuthStack />
  )
}
