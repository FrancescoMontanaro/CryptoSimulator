import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import SignUp from './SignUp';
import SignIn from './SignIn';

const Stack = createStackNavigator();

export default function AuthenticationPage(props) {

  const reloadApp = () => {
    props.reloadApp();
  };

  const colorScheme = props.colorScheme;

  return (
    <NavigationContainer>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator initialRouteName="SignUp" headerMode="none">
        <Stack.Screen name="SignUp" children={(props) => (<SignUp {...props} reloadApp={reloadApp} colorScheme={colorScheme} />)} />
        <Stack.Screen name="SignIn" children={(props) => (<SignIn {...props} reloadApp={reloadApp} colorScheme={colorScheme} />)} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
