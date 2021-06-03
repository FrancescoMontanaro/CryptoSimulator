import {
  StyleSheet, Text, FlatList, View, PanResponder, Dimensions, SafeAreaView
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {
  Defs, LinearGradient, Stop, Path
} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Feather';
import { AreaChart } from 'react-native-svg-charts';
import React, { useState } from 'react';
import PriceViewer from './PriceViewer';
import 'react-native-gesture-handler';
import * as shape from 'd3-shape';
import Tooltip from './Tooltip';
import 'firebase/functions';

const dimensions = Dimensions.get('window');

export default function Charts(props) {
  const [scrollable, setScrollable] = useState(true);

  const setScroll = (scroll) => {
    setScrollable(scroll);
  };

  const renderItem = ({ item }) => {
    return (
      <Chart name={item.name} symbol={item.symbol} dataLength={props.cryptoData.length} scroll={setScroll} data={(item.values).map((x) => [x[0], x[4]])} colorScheme={props.colorScheme} />
    );
  };

  if (props.cryptoData.length == 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff' }}>
        <View style={[styles.topBar, { backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff' }]}>
          <Text style={[styles.text, { fontSize: 18, color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>CryptoSimulator</Text>
        </View>
        <View style={{
          flex: 1, padding: 20, backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff', alignItems: 'center', flexDirection: 'column', justifyContent: 'center'
        }}
        >
          <View style={{
            borderRadius: 20, width: '100%', padding: 20, backgroundColor: props.colorScheme == 'dark' ? '#212244' : '#fff', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}
          >
            <Icon name="info" size={50} color={props.colorScheme == 'dark' ? '#fff' : '#000'} />
            <Text style={{
              marginTop: 20, fontSize: 18, textAlign: 'center', fontFamily: 'Poppins_600SemiBold', color: props.colorScheme == 'dark' ? '#fff' : '#000'
            }}
            >
              It seems you do not have any asset in your wallet.
              {' '}
              {'\n'}
              {' '}
              Visit the Account Page to add new Cryptocurrencies.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff' }}>
      <View style={[styles.topBar, { backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff' }]}>
        <Text style={[styles.text, { fontSize: 18, color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>CryptoSimulator</Text>
      </View>
      <FlatList data={props.cryptoData} renderItem={renderItem} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} scrollEnabled={scrollable} />
    </SafeAreaView>
  );

}

const Chart = (props) => {
  const allData = props.data;
  const [data, setData] = useState(allData.filter((sample) => sample[0] >= ((new Date()).getTime() - 30 * 24 * 60 * 60 * 1000)));
  const [period, setPeriod] = useState([0, 1, 0, 0, 0]);
  const [touchX, setTouchX] = useState(-1);
  const width = Math.ceil(0.92 * Dimensions.get('window').width - 40);

  const ChartLine = ({ line }) => (
    <Path
      key="line"
      d={line}
      stroke="rgb(41, 114, 255)"
      fill="none"
      strokeWidth={2}
    />
  );

  const Gradient = ({ index }) => (
    <Defs key={index}>
      <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="rgb(41, 114, 255)" stopOpacity={0.2} />
        <Stop offset="50%" stopColor="rgb(41, 114, 255)" stopOpacity={0} />
      </LinearGradient>
    </Defs>
  );

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        props.scroll(false);
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
        props.scroll(true);
        setTouchX(-1);
      },
      onPanResponderTerminate: () => {
        props.scroll(true);
        setTouchX(-1);
      }
    })
  ).current;

  function buttonCLicked(index) {
    const newPeriod = [0, 0, 0, 0, 0];
    newPeriod[index] = 1;
    setPeriod(newPeriod);
    const currentDate = (new Date()).getTime();
    let newData;

    if (index == 0) {
      let end = (currentDate - 7 * 24 * 60 * 60 * 1000);
      newData = allData.filter((sample) => sample[0] >= end);
    } else if (index == 1) {
      let end = (currentDate - 30 * 24 * 60 * 60 * 1000);
      newData = allData.filter((sample) => sample[0] >= end);
    } else if (index == 2) {
      let end = (currentDate - 90 * 24 * 60 * 60 * 1000);
      newData = allData.filter((sample) => sample[0] >= end);
    } else if (index == 3) {
      let end = (currentDate - 365 * 24 * 60 * 60 * 1000);
      newData = allData.filter((sample) => sample[0] >= end);
    } else if (index == 4) {
      newData = allData;
    }
    setData(newData);
  }

  return (
    <Animatable.View style={[styles.chartContainer, { backgroundColor: props.colorScheme === 'dark' ? '#212244' : '#fff' }]} animation="fadeInUp">
      <View style={{ flex: 1, textAlign: 'left' }}>
        <Text style={[styles.cryptoSymbol, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>{props.symbol}</Text>
        <Text style={[styles.cryptoName, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>{props.name}</Text>
      </View>

      <View style={{
        flex: 1, height: 20, textAlign: 'center', marginBottom: 20
      }}
      >
        <PriceViewer touchX={touchX} colorScheme={props.colorScheme} deviceWidth={width} data={data} />
      </View>

      <View style={{
        height: 80, flexDirection: 'row', marginBottom: 15, marginTop: 15
      }}
      >
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
          <AreaChart
            style={{ flex: 1, height: 80 }}
            data={data.map((x) => x[1])}
            contentInset={{ top: 10, bottom: 10 }}
            curve={shape.curveNatural}
            svg={{ fill: 'url(#gradient)' }}
          >
            <Tooltip touchX={touchX} deviceWidth={width} data={data} color="rgb(41, 114, 255)" />
            <ChartLine />
            <Gradient />
          </AreaChart>
        </View>
      </View>

      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={styles.buttonsContainer}>
          <View style={period[0] == 1 ? [styles.button, { backgroundColor: 'rgb(41, 114, 255)' }] : styles.button} onStartShouldSetResponder={() => buttonCLicked(0)}>
            <Text style={period[0] == 1 ? [styles.buttonText, { color: '#ffffff' }] : [styles.buttonText, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>
              1W
            </Text>
          </View>
          <View style={period[1] == 1 ? [styles.button, { backgroundColor: 'rgb(41, 114, 255)' }] : styles.button} onStartShouldSetResponder={() => buttonCLicked(1)}>
            <Text style={period[1] == 1 ? [styles.buttonText, { color: '#ffffff' }] : [styles.buttonText, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>
              1M
            </Text>
          </View>
          <View style={period[2] == 1 ? [styles.button, { backgroundColor: 'rgb(41, 114, 255)' }] : styles.button} onStartShouldSetResponder={() => buttonCLicked(2)}>
            <Text style={period[2] == 1 ? [styles.buttonText, { color: '#ffffff' }] : [styles.buttonText, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>
              3M
            </Text>
          </View>
          <View style={period[3] == 1 ? [styles.button, { backgroundColor: 'rgb(41, 114, 255)' }] : styles.button} onStartShouldSetResponder={() => buttonCLicked(3)}>
            <Text style={period[3] == 1 ? [styles.buttonText, { color: '#ffffff' }] : [styles.buttonText, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>
              1Y
            </Text>
          </View>
          <View style={period[4] == 1 ? [styles.button, { backgroundColor: 'rgb(41, 114, 255)' }] : styles.button} onStartShouldSetResponder={() => buttonCLicked(4)}>
            <Text style={period[4] == 1 ? [styles.buttonText, { color: '#ffffff' }] : [styles.buttonText, { color: props.colorScheme === 'dark' ? '#fff' : '#000' }]}>
              3Y
            </Text>
          </View>
        </View>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: dimensions.height > 800 ? 40 : 50,
    paddingBottom: 110,
  },
  topBar: {
    position: 'absolute',
    zIndex: 200,
    top: 0,
    height: 64,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 12,
    marginTop: dimensions.height > 800 ? 10 : 0
  },
  chartContainer: {
    width: '103%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cryptoSymbol: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 25
  },
  cryptoName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 20,
  },
  text: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 30
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
});
