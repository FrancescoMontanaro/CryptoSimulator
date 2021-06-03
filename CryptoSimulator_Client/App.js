import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import {
  useFonts, Poppins_300Light, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold
} from '@expo-google-fonts/poppins';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as firebase from 'firebase';
import * as SecureStore from 'expo-secure-store';
import { Appearance } from 'react-native-appearance';
import { StatusBar } from 'expo-status-bar';
import Predictions from './components/Predictions';
import Charts from './components/Charts';
import MyTabBar from './components/MyTabBar';
import Loader from './components/Loader';
import apiKeys from './APIs/config';
import AccountPage from './components/AccountPage';
import AuthenticationPage from './components/AuthenticationPage';
import 'firebase/functions';

const Tab = createBottomTabNavigator();
console.disableYellowBox = true;

export default function Home() {

  let endDate = new Date();
  endDate = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;

  let startDate = new Date((new Date()).getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
  startDate = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;

  const [colorScheme, setColorScheme] = useState(null);
  const [cryptoData, setCryptoData] = useState([]);
  const [user, setUser] = useState();
  const [weightedWallet, setWeightedWallet] = useState({});
  const [predictedCryptoData, setPredictedCryptoData] = useState([]);
  const [tabBarStatus, setTabBarDisplay] = useState(true);
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold
  });
  const [loaded, setLoaded] = useState(false);
  const [reload, setReload] = useState(0);

  const [loggedIn, setLoggedIn] = useState(null);

  const setTabBar = (value) => {
    setTabBarDisplay(value);
  };

  Appearance.addChangeListener(({ color }) => {
    SecureStore.getItemAsync('colorScheme').then((cs) => {
      if (cs === '') {
        setColorScheme(color);
      }
    });
  });

  useEffect(() => {
    setLoaded(false);
    SecureStore.getItemAsync('colorScheme').then((cs) => {
      if (cs !== null && cs !== '') {
        setColorScheme(cs);
      } else {
        const currentCs = Appearance.getColorScheme();
        cs = currentCs;
        setColorScheme(cs);
      }
    });

    SecureStore.getItemAsync('user').then((user) => {
      if (user !== null && user !== '') {
        firebase.firestore().collection('users').doc(user).get()
          .then((doc) => {
            if (doc.exists) {

              if (doc.data().wallet !== null && doc.data().wallet !== '') {

                const wallet = JSON.parse(doc.data().wallet);
                setWeightedWallet(wallet);
                const promises = [];

                promises.push(
                  new Promise((resolve, reject) => {
                    firebase.functions().httpsCallable('getCryptoData')({
                      assets: Object.keys(wallet), start: startDate, end: endDate, interval: '1d'
                    }).then((response) => {
                      if (response.data.statusCode === 200) {
                        resolve(response.data.body);
                      } else {
                        reject(response.data.body);
                      }
                    }).catch((error) => {
                      reject(error);
                    });
                  })
                );

                promises.push(
                  new Promise((resolve, reject) => {

                    const data = {
                      method: 'POST',
                      body: JSON.stringify({
                        cryptos: Object.keys(wallet)
                      })
                    };

                    fetch('https://us-central1-cryptosimulator-2020.cloudfunctions.net/getPredictions', data).then((response) => {
                      response.json().then((json) => {
                        resolve(json);
                      });
                    }).catch((error) => {
                      reject(error);
                    });

                  })
                );

                Promise.all(promises).then((responses) => {
                  setPredictedCryptoData(responses[1].results);
                  setCryptoData(responses[0]);
                  responses[0].forEach((x) => {
                    wallet[x.symbol] = (x.values[x.values.length - 1])[4] * wallet[x.symbol];
                  });

                  setUser({
                    uid: doc.id, username: doc.data().username, wallet, storedWallet: JSON.parse(doc.data().wallet)
                  });
                  setLoaded(true);
                  setLoggedIn(true);

                }).catch((error) => {
                  console.error(error);
                });
              } else {
                setPredictedCryptoData([]);
                setCryptoData([]);
                setUser({
                  uid: doc.id, username: doc.data().username, wallet: [], storedWallet: []
                });
                setLoaded(true);
                setLoggedIn(true);
              }
            } else {
              setLoaded(true);
              setLoggedIn(false);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        setLoaded(true);
        setLoggedIn(false);
      }
    });
  }, [reload]);

  const reloadApp = () => {
    setReload(reload + 1);
  };

  const colorSchemeChange = (mode) => {
    SecureStore.setItemAsync('colorScheme', mode).then(() => {
      if (mode === '') {
        setColorScheme(Appearance.getColorScheme());
      } else {
        setColorScheme(mode);
      }
    });
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(apiKeys.firebaseConfig);
  }

  if (!fontsLoaded || !loaded) {
    return <Loader colorScheme={colorScheme} />;
  }

  if (!loggedIn) {
    return <AuthenticationPage colorScheme={colorScheme} reloadApp={reloadApp} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator initialRouteName={Object.keys(user.wallet).length > 0 ? 'Charts' : 'Account'} tabBar={(props) => <MyTabBar {...props} display={tabBarStatus} colorScheme={colorScheme} />}>
        <Tab.Screen name="Charts" children={() => (<Charts colorScheme={colorScheme} cryptoData={cryptoData} />)} />
        <Tab.Screen name="Predictions" children={() => (<Predictions colorScheme={colorScheme} cryptoData={cryptoData} predictedCryptoData={predictedCryptoData} />)} />
        <Tab.Screen name="Account" children={() => (<AccountPage user={user} reloadApp={reloadApp} setTabBar={setTabBar} weightedWallet={weightedWallet} colorScheme={colorScheme} changeMode={colorSchemeChange} predictedCryptoData={predictedCryptoData} />)} />
      </Tab.Navigator>
    </NavigationContainer>
  );

}
