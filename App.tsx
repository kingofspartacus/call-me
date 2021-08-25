import React from 'react'
import { View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './src/navigation/AuthStack'
export default function App() {
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  )
}
