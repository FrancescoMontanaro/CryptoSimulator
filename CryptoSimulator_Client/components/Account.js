import { TouchableOpacity } from 'react-native-gesture-handler';
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, Dimensions, PanResponder
} from 'react-native';
import { AreaChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import {
  Defs, LinearGradient, Stop, Path
} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Feather';

import * as Animatable from 'react-native-animatable';
import Tooltip from './Tooltip';
import WalletChart from './WalletChart';

const dimensions = Dimensions.get('window');
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Gen', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getDate(timestamp){
  const date = new Date(timestamp);
  const textDate = `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  return textDate;
}

function parsePrice(price) {
  price = price.toFixed(2);
  let integer = String(Math.trunc(price));
  const decimal = price.split('.')[1];
  if (integer.length > 3) {
    integer = [integer.slice(0, (integer.length - 3)), '.', integer.slice((integer.length - 3))].join('');
  }
  return `${integer},${decimal}$`;
}

export default function Account(props) {
  const [period, setPeriod] = useState(2);

  const settings = () => {
    props.navigation.navigate('Settings');
  };

  const changePeriod = (value) => {
    setPeriod(value);
  };

  if (props.user.wallet == '' || Object.keys(props.user.wallet).length == 0) {
    return (
      <View style={{ flex: 1, backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff' }}>
        <View style={[styles.topBar, { backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff' }]}>
          <Text style={[styles.text, { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>CryptoSimulator</Text>
        </View>
        <View style={styles.container}>
          <View style={[styles.header, { backgroundColor: props.colorScheme == 'dark' ? '#212244' : '#fff' }]}>
            <View>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: props.user.username.length > 8 ? 18 : 22, color: props.colorScheme == 'dark' ? '#fff' : '#000' }}>
                Welcome, {props.user.username}
              </Text>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: props.colorScheme == 'dark' ? '#fff' : '#000' }}>Your smart wallet</Text>
            </View>
            <TouchableOpacity onPress={() => settings()}>
              <Icon name="settings" size={20} color="rgb(41,111,255)" />
            </TouchableOpacity>
          </View>
          <View style={{
            marginTop: 20, borderRadius: 20, width: '100%', padding: 20, backgroundColor: props.colorScheme == 'dark' ? '#212244' : '#fff', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}
          >
            <TouchableOpacity onPress={() => settings()}>
              <Icon name="info" size={50} color={props.colorScheme == 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={{
              marginTop: 20, fontSize: 18, textAlign: 'center', fontFamily: 'Poppins_600SemiBold', color: props.colorScheme == 'dark' ? '#fff' : '#000'
            }}
            >
              Click on the settings button to add new assets to your wallet.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  let currentWalletValue = 0;
  Object.keys(props.user.wallet).forEach((key) => {
    currentWalletValue += props.user.wallet[key];
  });
  currentWalletValue = currentWalletValue.toFixed(2);

  const estimatedData = [];
  Object.keys(props.user.wallet).forEach((key) => {
    if (period == 0) {
      const rawPredictedData = props.predictedCryptoData[key].slice(0, 7);
      estimatedData.push(rawPredictedData.map((prediction) => prediction * props.user.storedWallet[key]));
    } else if (period == 1) {
      const rawPredictedData = props.predictedCryptoData[key].slice(0, 14);
      estimatedData.push(rawPredictedData.map((prediction) => prediction * props.user.storedWallet[key]));
    } else if (period == 2) {
      const rawPredictedData = props.predictedCryptoData[key].slice(0, 30);
      estimatedData.push(rawPredictedData.map((prediction) => prediction * props.user.storedWallet[key]));
    } else if (period == 3) {
      const rawPredictedData = props.predictedCryptoData[key].slice(0, 60);
      estimatedData.push(rawPredictedData.map((prediction) => prediction * props.user.storedWallet[key]));
    } else {
      const rawPredictedData = props.predictedCryptoData[key];
      estimatedData.push(rawPredictedData.map((prediction) => prediction * props.user.storedWallet[key]));
    }
  });

  const sumData = estimatedData[0].map(
    (x, idx) => estimatedData.reduce((sum, curr) => sum + curr[idx], 0)
  );

  const currentTimestamp = (new Date()).getTime();
  const estimatedWallet = sumData.map((x, i) => [currentTimestamp + (i + 1) * 24 * 60 * 60 * 1000, x]);

  let total = 0;
  estimatedWallet.map((x) => x[1]).forEach((price) => {
    total += price;
  });
  const meanValue = total / estimatedWallet.length;

  const willgrow = meanValue >= currentWalletValue;

  return (
    <View style={{ flex: 1, backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff' }}>
      <View style={[styles.topBar, { backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff' }]}>
        <Text style={[styles.text, { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>CryptoSimulator</Text>
      </View>
      <View style={styles.container}>
        <Animatable.View style={[styles.header, { backgroundColor: props.colorScheme == 'dark' ? '#212244' : '#fff' }]} animation="fadeInDown">
          <View>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: props.user.username.length > 8 ? 18 : 22, color: props.colorScheme == 'dark' ? '#fff' : '#000' }}>
              Welcome, {props.user.username}
            </Text>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: props.colorScheme == 'dark' ? '#fff' : '#000' }}>Your smart wallet</Text>
          </View>
          <TouchableOpacity onPress={() => settings()}>
            <Icon name="settings" size={20} color="rgb(41,111,255)" />
          </TouchableOpacity>
        </Animatable.View>
        <Animatable.View style={[styles.ChartContainer, { backgroundColor: props.colorScheme == 'dark' ? '#212244' : '#fff' }]} animation="fadeInRight">
          <Icon name={willgrow == true ? 'arrow-up-right' : 'arrow-down-left'} size={20} color={willgrow == true ? 'green' : 'tomato'} style={{ position: 'absolute', top: 20, right: 20 }} />
          <WalletChart wallet={props.user.wallet} colorScheme={props.colorScheme} />
        </Animatable.View>
        <Animatable.View style={[styles.ChartContainer, { backgroundColor: props.colorScheme == 'dark' ? '#212244' : '#fff' }]} animation="fadeInLeft">
          <Chart data={estimatedWallet} color={willgrow == true ? 'green' : 'tomato'} period={period} changePeriod={changePeriod} colorScheme={props.colorScheme} />
        </Animatable.View>
      </View>
    </View>
  );

}

const Chart = (props) => {
  const [touchX, setTouchX] = useState(-1);
  const width = Math.ceil(0.92 * Dimensions.get('window').width - 40);

  const ChartLine = ({ line }) => (
    <Path
      key="line"
      d={line}
      stroke={props.color}
      fill="none"
      strokeWidth={2}
    />
  );

  const Gradient = ({ index }) => (
    <Defs key={index}>
      <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={props.color} stopOpacity={0.2} />
        <Stop offset="50%" stopColor={props.color} stopOpacity={0} />
      </LinearGradient>
    </Defs>
  );

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (evt.nativeEvent.locationX >= 0 && evt.nativeEvent.locationX <= width) {
          setTouchX(evt.nativeEvent.locationX);
        }
      },
      onPanResponderMove: (evt) => {
        if (evt.nativeEvent.locationX >= 0 && evt.nativeEvent.locationX <= width) {
          setTouchX(evt.nativeEvent.locationX);
        }
      },
      onPanResponderRelease: () => {
        setTouchX(-1);
      },
      onPanResponderTerminate: () => {
        setTouchX(-1);
      }
    })
  ).current;

  function changePeriod(newPeriod) {
    props.changePeriod(newPeriod);
  }

  return (
    <View style={{ flex: 1 }}>
      <Price touchX={touchX} colorScheme={props.colorScheme} deviceWidth={width} data={props.data} defaultValue="Wallet prediction" />
      <View
        style={{
          height: '70%', paddingBottom: 10, marginTop: 8, overflow: 'hidden'
        }}
        {...panResponder.panHandlers}
      >
        <AreaChart
          style={{ height: '100%' }}
          data={props.data.map((x) => x[1])}
          contentInset={{ top: 10, bottom: 10 }}
          curve={shape.curveNatural}
          svg={{ fill: 'url(#gradient)' }}
        >
          <Tooltip touchX={touchX} deviceWidth={width} data={props.data} color={props.color} />
          <ChartLine />
          <Gradient />
        </AreaChart>
      </View>

      <View style={{ width: '100%', alignItems: 'center' }}>
        <View style={styles.buttonsContainer}>
          <View style={props.period == 0 ? [styles.button, { backgroundColor: 'rgb(41, 114, 255)' }] : styles.button} onStartShouldSetResponder={() => changePeriod(0)}>
            <Text style={props.period == 0 ? [styles.buttonText, { color: '#ffffff' }] : [styles.buttonText, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>
              1W
            </Text>
          </View>
          <View style={props.period == 1 ? [styles.button, { backgroundColor: 'rgb(41, 114, 255)' }] : styles.button} onStartShouldSetResponder={() => changePeriod(1)}>
            <Text style={props.period == 1 ? [styles.buttonText, { color: '#ffffff' }] : [styles.buttonText, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>
              2W
            </Text>
          </View>
          <View style={props.period == 2 ? [styles.button, { backgroundColor: 'rgb(41, 114, 255)' }] : styles.button} onStartShouldSetResponder={() => changePeriod(2)}>
            <Text style={props.period == 2 ? [styles.buttonText, { color: '#ffffff' }] : [styles.buttonText, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>
              1M
            </Text>
          </View>
          <View style={props.period == 3 ? [styles.button, { backgroundColor: 'rgb(41, 114, 255)' }] : styles.button} onStartShouldSetResponder={() => changePeriod(3)}>
            <Text style={props.period == 3 ? [styles.buttonText, { color: '#ffffff' }] : [styles.buttonText, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>
              2M
            </Text>
          </View>
          <View style={props.period == 4 ? [styles.button, { backgroundColor: 'rgb(41, 114, 255)' }] : styles.button} onStartShouldSetResponder={() => changePeriod(4)}>
            <Text style={props.period == 4 ? [styles.buttonText, { color: '#ffffff' }] : [styles.buttonText, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>
              3M
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const Price = (props) => {
  const { touchX } = props;
  const { deviceWidth } = props;
  const { data } = props;
  const { defaultValue } = props;

  if (touchX >= 0 && deviceWidth != null && data.length > 0) {
    const swipeIndex = Math.floor((touchX / deviceWidth) * data.length);
    if (swipeIndex < data.length) {
      return (
        <View>
          <Text style={[styles.currentPrice, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>{`${parsePrice(data[swipeIndex][1])} - ${getDate(data[swipeIndex][0])}`}</Text>
        </View>
      );
    }

    return (
      <View>
        <Text style={[styles.currentPrice, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>{defaultValue}</Text>
      </View>
    );

  }

  return (
    <View>
      <Text style={[styles.currentPrice, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>{defaultValue}</Text>
    </View>
  );

};

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    zIndex: 200,
    top: 0,
    height: 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    flex: 1,
    paddingBottom: 8,
    marginTop: dimensions.height > 800 ? 10 : 0
  },
  container: {
    flex: 1,
    marginTop: dimensions.height > 800 ? 90 : 70,
    paddingBottom: dimensions.height > 800 ? 70 : 60,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  ChartContainer: {
    height: '38%',
    width: '100%',
    borderRadius: 20,
    marginTop: 15,
    marginBottom: 5,
    padding: 20
  },
  header: {
    height: '15%',
    width: '100%',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  buttonsContainer: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 30
  },
  buttonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12
  },
  currentPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    margin: 0
  }
});
