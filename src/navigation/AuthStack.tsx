import React from 'react'
import { View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Login'
import Register from '../screens/Register';
import FirstScreen from '../screens/FirstScreen';
import nam from '../screens/Haha';
import { Header } from 'react-native/Libraries/NewAppScreen';
import inCall from '../screens/InCall';
const Stack = createStackNavigator();
const Authent = () => {
  return (
    //   <Stack.Navigator >
    //     <Stack.Screen options={{ header: () => null }} name="logIn" component={logIn} />
    //     <Stack.Screen options={{ header: () => null }} name="signIn" component={signIn} />
    //     <Stack.Screen options={{ header: () => null }} name="signUp" component={signUp} />
    //   </Stack.Navigator>
    <Stack.Navigator initialRouteName="Login" screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="FirstScreen" component={FirstScreen} />
      <Stack.Screen name="nam" component={nam} />
      <Stack.Screen name='Call' component={inCall} />
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
