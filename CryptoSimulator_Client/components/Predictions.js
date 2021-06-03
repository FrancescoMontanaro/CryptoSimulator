import {StyleSheet, Text, View, Dimensions, Image, PanResponder, SafeAreaView} from 'react-native';
import { Defs, LinearGradient, Stop, Path} from 'react-native-svg';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Feather';
import { AreaChart} from 'react-native-svg-charts';
import React, {useState} from 'react';
import Dash from 'react-native-dash';
import * as shape from 'd3-shape';
import Tooltip from './Tooltip';
import Price from './Price';

const dimensions = Dimensions.get('window');

function parsePrice(price){
  if(price == null || typeof(price) != "number"){
      return "";
  }
  price = price.toFixed(2);
  var integer = String(Math.trunc(price));
  var decimal = price.split(".")[1];
  if(integer.length > 3){
      integer = [integer.slice(0, (integer.length - 3)), ".", integer.slice((integer.length - 3))].join('');
  }
  return integer + "," + decimal + "$";
}

export default function Predictions(props) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [period, setPeriod] = useState(new Array(props.cryptoData.length).fill(1));
  const [predictionPeriod, setPredictionPeriod] = useState(new Array(props.cryptoData.length).fill(1));
  const [scrollable, setScrollable] = useState(true);
  const [iconsUrls, setIconsUrls] = useState([]);
  let iconColor = props.colorScheme === "dark" ? "white":"black";

  const changePeriod = (index, value) => {
    let newPeriod = period.slice();
    newPeriod[index] = value;
    setPeriod(newPeriod);
  };

  const changePredictionPeriod = (index, value) => {
    let newPeriod = predictionPeriod.slice();
    newPeriod[index] = value;
    setPredictionPeriod(newPeriod);
  };

  const setScroll = (scroll) => {
    setScrollable(scroll);
  }

  const renderItem = ({item, index}) => {
    let data;
    let currentDate = (new Date()).getTime();
    if(period[index] == 0){
      var end = (currentDate - 7*24*60*60*1000);
      data = item.values.filter(sample => sample[0] >= end);
    }
    else if(period[index] == 1){
      var end = (currentDate - 30*24*60*60*1000);
      data = item.values.filter(sample => sample[0] >= end);
    }
    else if(period[index] == 2){
      var end = (currentDate - 90*24*60*60*1000);
      data = item.values.filter(sample => sample[0] >= end);
    }
    else if(period[index] == 3){
      var end = (currentDate - 365*24*60*60*1000);
      data = item.values.filter(sample => sample[0] >= end);
    }
    else if(period[index] == 4){
      data = item.values;
    }

    let currentTimestamp = (new Date()).getTime();
    let estimatedData = [];

    if(predictionPeriod[index] == 0){
      let rawPredictedData = props.predictedCryptoData[item.symbol].slice(0,7);
      for (let i=0; i<rawPredictedData.length; i++){
        estimatedData.push([currentTimestamp + (i + 1)*24*60*60*1000, rawPredictedData[i]])
      }
    }
    else if(predictionPeriod[index] == 1){
      let rawPredictedData = props.predictedCryptoData[item.symbol].slice(0,14);
      for (let i=0; i<rawPredictedData.length; i++){
        estimatedData.push([currentTimestamp + (i + 1)*24*60*60*1000, rawPredictedData[i]])
      }
    }
    else if(predictionPeriod[index] == 2){
      let rawPredictedData = props.predictedCryptoData[item.symbol].slice(0,30);
      for (let i=0; i<rawPredictedData.length; i++){
        estimatedData.push([currentTimestamp + (i + 1)*24*60*60*1000, rawPredictedData[i]])
      }
    }
    else if(predictionPeriod[index] == 3){
      let rawPredictedData = props.predictedCryptoData[item.symbol].slice(0,60);
      for (let i=0; i<rawPredictedData.length; i++){
        estimatedData.push([currentTimestamp + (i + 1)*24*60*60*1000, rawPredictedData[i]])
      }
    }
    else if(predictionPeriod[index] == 4){
      let rawPredictedData = props.predictedCryptoData[item.symbol];
      for (let i=0; i<rawPredictedData.length; i++){
        estimatedData.push([currentTimestamp + (i + 1)*24*60*60*1000, rawPredictedData[i]])
      }
    }

    var total = 0;
    estimatedData.map(x => x[1]).forEach(price =>{
      total += price;
    })
    var meanValue = total / estimatedData.length;

    let willGrow = meanValue >= data.map(x => x[4])[data.map(x => x[4]).length - 1] ? true:false;

    let highestPrice = parsePrice(Math.max(...data.map(x => x[4])));
    let lowestPrice = parsePrice(Math.min(...data.map(x => x[4])));
    let symbol = item.symbol;
    let name = item.name;
    let icon = 'https://firebasestorage.googleapis.com/v0/b/cryptosimulator-2020.appspot.com/o/Icons%2F' + iconColor + '%2F' + (item.symbol).toLowerCase() + '.png?alt=media';

    return (
      <View style={[styles.predictionCard, {backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff'}]}>
        <View style={styles.additionalInfosContainer}>
          <Animatable.View style={[styles.additionalInfo, {backgroundColor: props.colorScheme === 'dark' ? '#212244' : '#fff'}]} animation="fadeInLeft">
            <Icon name={willGrow == true ? 'arrow-up-right':'arrow-down-left'} size={20} color={willGrow == true ? 'green':'tomato'} style={{position: 'absolute', top: 10, right: 10}}/>
            <Image style={styles.tinyLogo} source={{uri: icon}}/>
            <View>
              <Text style={[styles.cryptoSymbol, {color: props.colorScheme === "dark" ? '#fff':'#000'}]}>{symbol}</Text>
              <Text adjustsFontSizeToFit={true} style={[styles.cryptoName, {fontSize: name.length < 9 ? 20:16, color: props.colorScheme === "dark" ? '#fff':'#000'}]}>{name}</Text>
            </View>
          </Animatable.View>
          <View style={{width: '6%'}}/>
          <Animatable.View style={[styles.additionalInfo, {flexDirection: 'column', justifyContent:'space-between', backgroundColor: props.colorScheme === 'dark' ? '#212244' : '#fff'}]} animation="fadeInRight">
              <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
                <Icon name="arrow-up-circle" size={30} color='green'/>
                <View style={{marginLeft: 8}}>
                  <Text style={{color: props.colorScheme === 'dark' ? '#fff' : '#000', fontSize: 10, fontFamily: 'Poppins_500Medium'}}>Highest Price</Text>
                  <Text style={{color: props.colorScheme === 'dark' ? '#fff' : '#000', fontFamily: 'Poppins_500Medium'}}>{highestPrice}</Text>
                </View>
              </View>
              <Dash dashThickness={1} dashColor={props.colorScheme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'} style={{width:'100%', height:0.5}}/>
              <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
                <Icon name="arrow-down-circle" size={30} color='tomato'/>
                <View style={{marginLeft: 8}}>
                  <Text style={{color: props.colorScheme === 'dark' ? '#fff' : '#000', fontSize: 10, fontFamily: 'Poppins_500Medium'}}>Lowest Price</Text>
                  <Text style={{color: props.colorScheme === 'dark' ? '#fff' : '#000', fontFamily: 'Poppins_500Medium'}}>{lowestPrice}</Text>
                </View>
              </View>
          </Animatable.View>
        </View>
        <Animatable.View style={[styles.predictionChartContainer, {backgroundColor: props.colorScheme === 'dark' ? '#212244' : '#fff'}]} animation="fadeInLeft">
          <Chart data={data.map(x => [x[0], x[4]])} color={'#2970ff'} periodLabels={["1W","1M","3M","1Y","3Y"]} period={period[index]} index={index} colorScheme={props.colorScheme} scroll={setScroll} tooltipColor={'rgb(41, 114, 255)'} type={"current"} changePeriod={changePeriod}/>
        </Animatable.View>
        <Animatable.View style={[styles.predictionChartContainer, {backgroundColor: props.colorScheme === 'dark' ? '#212244' : '#fff'}]} animation="fadeInRight">
          <Chart data={estimatedData} color={willGrow == true ? 'green':'tomato'} periodLabels={["1W","2W","1M","2M","3M"]} period={predictionPeriod[index]} tooltipColor={willGrow == true ? 'green':'tomato'} type={"prediction"} index={index} colorScheme={props.colorScheme} scroll={setScroll} changePeriod={changePredictionPeriod}/>
        </Animatable.View>
      </View>
    );
  };


  const Pages = () =>{
    return(
    <View style={{position: 'absolute', bottom: dimensions.height > 800 ? 80:60, width: '100%', alignItems: 'center'}}>
      <Pagination
        dotsLength={props.cryptoData.length}
        activeDotIndex={activeSlide}
        containerStyle={{ paddingTop: 5, paddingBottom: 5}}
        dotStyle={{
            width: 5,
            height: 5,
            borderRadius: 5,
            marginHorizontal: -5,
            backgroundColor: 'rgba(41, 114, 255, 0.92)'
        }}
        inactiveDotStyle={{
            backgroundColor: props.colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(0, 0, 0, 0.92)'
        }}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    </View>
    );
  }

  if(props.cryptoData.length == 0){
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff'}}>
      <View style={[styles.topBar, {backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff'}]}>
        <Text style={[styles.text, {fontSize: 18, color: props.colorScheme === 'dark' ? '#fff' : '#000', fontFamily: 'Poppins_600SemiBold'}]}>CryptoSimulator</Text>
      </View>
      <View style={{flex: 1, padding: 20, backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff', alignItems: 'center', flexDirection: 'column', justifyContent: 'center'}}>
        <View style={{borderRadius: 20, width: '100%', padding: 20, backgroundColor: props.colorScheme == "dark" ? '#212244' : '#fff', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
           <Icon name="info" size={50} color={props.colorScheme == "dark" ? '#fff':'#000'} />
          <Text style={{ marginTop: 20, fontSize: 18, textAlign:'center', fontFamily: 'Poppins_600SemiBold', color: props.colorScheme == "dark" ? "#fff":'#000'}}>
          It seems you do not have any asset in your wallet. {"\n"} Visit the Account Page to add new Cryptocurrencies.
          </Text>
        </View>
      </View>
     </SafeAreaView>
    );
  }
  else{
    return (
      <View style={{flex: 1, backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff'}}>
        <View style={[styles.topBar, {backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff'}]}>
            <Text style={[styles.text, {fontSize: 18, fontFamily: 'Poppins_600SemiBold',  color: props.colorScheme === 'dark' ? '#fff' : '#000'}]}>CryptoSimulator</Text>
        </View>
        <View style={styles.container}>
          <Carousel
            data={props.cryptoData}
            renderItem={renderItem}
            sliderWidth={dimensions.width}
            itemWidth={dimensions.width}
            onSnapToItem={(index) => setActiveSlide(index)}
            scrollEnabled={scrollable}
            />
          <Pages/>
        </View>
      </View>
    );
  }
}


const Chart = (props) =>{
  const [touchX, setTouchX] = useState(-1);
  const width = Math.ceil(0.92 * Dimensions.get('window').width - 40);

  const ChartLine = ({ line }) => (
    <Path
        key={'line'}
        d={line}
        stroke={props.color}
        fill={'none'}
        strokeWidth={2}
    />
  );

  const Gradient = ({ index }) => (
    <Defs key={index}>
        <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
            <Stop offset={'0%'} stopColor={props.color} stopOpacity={0.2}/>
            <Stop offset={'50%'} stopColor={props.color} stopOpacity={0}/>
        </LinearGradient>
    </Defs>
  );

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if(evt.nativeEvent.locationX >= 0 && evt.nativeEvent.locationX <= width){
          props.scroll(false);
          setTouchX(evt.nativeEvent.locationX);
        }
      },
      onPanResponderMove: (evt) => {
        if(evt.nativeEvent.locationX >= 0 && evt.nativeEvent.locationX <= width){
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

  function changePeriod(newPeriod){
    props.changePeriod(props.index, newPeriod);
  }

  return(
    <View style={{flex: 1}}>
      <View style={{height: '20%'}}>
        <Price touchX={touchX} colorScheme={props.colorScheme} deviceWidth={width} data={props.data} defaultValue={props.type == "prediction" ? "AI Prediction":"Last Prices"}></Price>
      </View>
      <View style={{ height: '60%', paddingBottom: 10, marginTop: 8, overflow: 'hidden' }} {...panResponder.panHandlers}>
          <AreaChart
            style={{height: '100%'}}
            data={props.data.map(x => x[1])}
            contentInset={{ top: 10, bottom: 10 }}
            curve={shape.curveNatural}
            svg={{ fill: 'url(#gradient)' }}
            >
            <Tooltip touchX={touchX} deviceWidth={width} data={props.data} color={props.tooltipColor}/>
            <ChartLine/>
            <Gradient/>
          </AreaChart>
      </View>

      <View style={{width: '100%', alignItems: 'center'}}>
        <View style={styles.buttonsContainer}>
          <View style={props.period == 0 ? [styles.button, {backgroundColor: 'rgb(41, 114, 255)'}]:styles.button} onStartShouldSetResponder={() => changePeriod(0)}>
            <Text style={props.period == 0 ? [styles.buttonText, {color: '#ffffff'}]:[styles.buttonText, {color: props.colorScheme === "dark" ? '#fff':'#000'}]}>
            {props.periodLabels[0]}
            </Text>
          </View>
          <View style={props.period == 1 ? [styles.button, {backgroundColor: 'rgb(41, 114, 255)'}]:styles.button} onStartShouldSetResponder={() => changePeriod(1)}>
            <Text style={props.period == 1 ? [styles.buttonText, {color: '#ffffff'}]:[styles.buttonText, {color: props.colorScheme === "dark" ? '#fff':'#000'}]}>
            {props.periodLabels[1]}
            </Text>
          </View>
          <View style={props.period == 2 ? [styles.button, {backgroundColor: 'rgb(41, 114, 255)'}]:styles.button} onStartShouldSetResponder={() => changePeriod(2)}>
            <Text style={props.period == 2 ? [styles.buttonText, {color: '#ffffff'}]:[styles.buttonText, {color: props.colorScheme === "dark" ? '#fff':'#000'}]}>
            {props.periodLabels[2]}
            </Text>
          </View>
          <View style={props.period == 3 ? [styles.button, {backgroundColor: 'rgb(41, 114, 255)'}]:styles.button} onStartShouldSetResponder={() => changePeriod(3)}>
            <Text style={props.period == 3 ? [styles.buttonText, {color: '#ffffff'}]:[styles.buttonText, {color: props.colorScheme === "dark" ? '#fff':'#000'}]}>
            {props.periodLabels[3]}
            </Text>
          </View>
          <View style={props.period == 4 ? [styles.button, {backgroundColor: 'rgb(41, 114, 255)'}]:styles.button} onStartShouldSetResponder={() => changePeriod(4)}>
            <Text style={props.period == 4 ? [styles.buttonText, {color: '#ffffff'}]:[styles.buttonText, {color: props.colorScheme === "dark" ? '#fff':'#000'}]}>
              {props.periodLabels[4]}
            </Text>
          </View>
        </View>
      </View> 
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: {
    flex: 1,
    marginTop: dimensions.height > 800 ? 60:40,
    paddingBottom: dimensions.height > 800 ? 40:75
  },
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
    marginTop: dimensions.height > 800 ? 10:0
  },
  cryptoSymbol: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 25,
    marginTop: 5
  },
  cryptoName: {
    fontFamily: 'Poppins_500Medium',
  },
  titleContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  tinyLogo: {
    width: 30,
    height: 30,
  },
  predictionCard:{
    flex:1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 0
  },
  predictionChartContainer: {
    height: '31.5%',
    width: '100%',
    marginTop: 20,
    borderRadius: 20,
    padding: 20
  },
  additionalInfosContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'space-between',
    marginTop: 30,
    textAlign: 'left'
  },
  additionalInfo: {
    width: '47%',
    height: 140,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'flex-end'
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
})