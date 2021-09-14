import React from 'react'
import { View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Login'
import Register from '../screens/Register';
import FirstScreen from '../screens/FirstScreen';
const Stack = createStackNavigator();
const Authent = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="FirstScreen" component={FirstScreen} />
    </Stack.Navigator>
  );
};
export default function AuthStack() {
  return (
    <NavigationContainer>
      <Authent />
    </NavigationContainer>
  )
}
