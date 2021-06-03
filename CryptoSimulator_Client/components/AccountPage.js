import 'react-native-gesture-handler';
import React  from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Account from './Account';
import Settings from './Settings';
import 'firebase/firestore';

const Stack = createStackNavigator();

export default function AccountPage(props) {

    const user = props.user;
    const predictedCryptoData=props.predictedCryptoData;
    const colorScheme=props.colorScheme;
    const weightedWallet=props.weightedWallet;
    const cryptoData = props.cryptoData;
    
    const reloadApp = () =>{
      props.reloadApp();
    }

    const changeMode = (mode)=>{
      props.changeMode(mode);
    };

    const setTabBar = (value) =>{
      props.setTabBar(value);
    }

    return (
        <Stack.Navigator initialRouteName="Account" headerMode="none">
          <Stack.Screen name="Account" children={(props) => (<Account {...props} user={user} colorScheme={colorScheme} cryptoData={cryptoData} predictedCryptoData={predictedCryptoData} weightedWallet={weightedWallet}/>)}/>
          <Stack.Screen name="Settings" children={(props) => (<Settings {...props} reloadApp={reloadApp} user={user} setTabBar={setTabBar} colorScheme={colorScheme} changeMode={changeMode}/>)}/>
        </Stack.Navigator>
    );
};


