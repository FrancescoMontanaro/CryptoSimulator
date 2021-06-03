import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text,View, SafeAreaView, TouchableOpacity, Keyboard} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Feather';
import { TextInput } from 'react-native-gesture-handler';
import availableCryptoList from '../assets/availableCryptoList';
import * as SecureStore from 'expo-secure-store';
import RNPickerSelect from 'react-native-picker-select';
import Loader from './Loader';
import * as firebase from 'firebase';
import { Appearance } from 'react-native-appearance';

function isEquivalent(a, b) {
  if(a == null || b == null){
    return false;
  }
  
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);

  if (aProps.length != bProps.length) {
      return false;
  }

  for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];
      if (a[propName] !== b[propName]) {
          return false;
      }
  }
  return true;
}


export default function Settings(props) {
  const [userCryptoList,setUserCryptoList]=useState([]);
  const [userCryptoNum,setUserCryptoNum]=useState();
  const [input,setInput]=useState("");
  const [dialog,setDialog] = useState({});
  const [loaded,setLoaded]=useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [arrowRotation, setArrowRotation] = useState("down");
  const filteredCryptos = availableCryptoList.sort();
  const [loading, setLoading] = useState(false);
  const [colorScheme, setColorScheme] = useState(null);

  const userCryptos = [];
  Object.keys(props.user.wallet).forEach(function(key) {
    userCryptos.push({name:key, quantity: props.user.storedWallet[key]});
  });


  useEffect(()=>{
    props.setTabBar(false);
    SecureStore.getItemAsync("colorScheme").then(cs =>{
      setColorScheme(cs);
    })
    setUserCryptoNum(userCryptos.length);
    if(userCryptos.length!=6){
      while(userCryptos.length<6){
        userCryptos.push({})
      }
    }
    setUserCryptoList(userCryptos);
    setLoaded(true);
  },[]);

  const goBack=()=>{
    let equivalent = true;
    let newCryptoList = userCryptoList.filter(x => Object.keys(x).length > 0);

    if(newCryptoList.length != userCryptos.length){
      equivalent = false;
    }
    else{
      for(let i=0;i<newCryptoList.length;i++){
        if(!isEquivalent(newCryptoList[i], userCryptos[i])){
          equivalent = false;
        }
      }
    }

    if(!equivalent){
      setLoading(true);
      let newWallet = {};
      newCryptoList.forEach(crypto =>{
        if(crypto.name != null && crypto.name != "" && crypto.quantity != null){
          newWallet[crypto.name] = crypto.quantity;
        }
      })
      firebase.firestore().collection("users").doc(props.user.uid).update({
        wallet: JSON.stringify(newWallet)
      }).then(function(){
        props.setTabBar(true);
        props.reloadApp();
        props.navigation.navigate('Account');
      }).catch(error =>{
        console.error(error);
      })
    }
    else{
      props.setTabBar(true);
      props.navigation.navigate('Account');
    }
  };

  const changeMode = (value) =>{
    setColorScheme(value);
    props.changeMode(value);
  }

  const logout = ()=>{
    setLoading(true);
    firebase.auth().signOut().then(function(){
      SecureStore.setItemAsync("user","").then(function(){
        props.setTabBar(true);
        props.reloadApp();
      });
    }).catch(error =>{
      console.error(error);
    })
  }

  const inputChange=(val)=>{
    setInput((val.replace(",", ".")));
  }


  const chooseNewCrypto=()=>{
    setDialog({visible: true, add: true, name: null, quantity: null});
  }

  const cancel = ()=>{
    setDialog({visible: false, add: null, name: null, quantity: null});
    setInput("");
  }

  const remove=(index)=>{
    var oldUserCryptos=userCryptoList;
    oldUserCryptos.splice(index,1);
    oldUserCryptos.push({});
    setUserCryptoNum(userCryptoNum-1);
    setUserCryptoList(oldUserCryptos);
  }

  const modifyCripto = (crypto) => {
    setDialog({visible: true,  add: false, name: crypto.name, quantity: crypto.quantity});
  }

  const modify = () => {
    if(input == ""){
      return;
    }

    var inputAmount=parseFloat(input);

    var cryptoToModify={
      name: dialog.name,
      quantity: inputAmount
    }

    let newCryptoList = userCryptoList;
    let index = userCryptoList.findIndex(x => x.name == dialog.name);

    newCryptoList[index] = cryptoToModify;
    setUserCryptoList(newCryptoList);

    setInput("");
    setDialog({visible: false, value: '', add: null, quantity: null});
  }


  const add = ()=>{
    if(input == "" || selectedCrypto == null){
      return;
    }

    setDialog({visible: false, value: '', add: null, quantity: null});
    var inputAmount=parseFloat(input);

    var cryptoToAdd={
      name: selectedCrypto,
      quantity: inputAmount
    }
    var newUserCryptos=userCryptoList;
    newUserCryptos[userCryptoNum]=cryptoToAdd;

    setUserCryptoList(newUserCryptos);
    setUserCryptoNum(userCryptoNum+1);
    setInput("");
  }

  if(!loading){
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: props.colorScheme == "dark" ? '#161730' : '#e9f0ff'}}>
        <Animatable.View style={styles.container} animation="fadeInUpBig">
        <Icon name={"x"} size={30} style={styles.closeIcon} onPress={()=>goBack()} />
        <View style={styles.titleWrapper}>
            <Text style={[styles.title, {color: props.colorScheme == "dark" ? "#fff":"#000"}]}>Settings</Text>
        </View>
        <View style={styles.cryptoContainer}>
          {loaded?<View style={styles.scrollView}>
              {userCryptoList.map((crypto,index)=>(!(Object.keys(crypto).length === 0 && crypto.constructor === Object))?<TouchableOpacity style={[styles.crypto, {backgroundColor: props.colorScheme == "dark" ? '#212244' : '#fff'}]} onPress={() => modifyCripto(crypto)}>
                <Text style={{fontFamily: 'Poppins_500Medium', color: props.colorScheme == "dark" ? '#fff':'#000', fontSize: 18}}>{crypto.name + "  - "} </Text>
                <Text style={{fontFamily: 'Poppins_500Medium', color: props.colorScheme == "dark" ? '#fff':'#000', fontSize: 18}}> 
                {crypto.quantity}
              </Text>
              <Icon name={"trash-2"} size={20} style={styles.trashIcon} onPress={()=>remove(index)} />
              </TouchableOpacity>:
              <TouchableOpacity style={[styles.crypto, {backgroundColor: props.colorScheme == "dark" ? '#212244' : '#fff'}]} onPress={()=>chooseNewCrypto()} >
                <Icon name={"plus"} size={30} color={props.colorScheme == "dark" ? "#fff":'#000'}/>
              </TouchableOpacity>
              )}
          </View>:null}
        </View>
        <View style={styles.bottomSettings}>
        <View style={[styles.bottomSetting, {marginBottom: 20, marginTop: 5}]}>
        <Text style={[styles.optionText, {color: props.colorScheme == "dark"? '#fff':'#000', fontFamily: 'Poppins_600SemiBold', fontSize: 15}]}>Appearance: </Text>
              <View style={{flexDirection: 'row', marginLeft: 20}}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colorScheme == "dark" ? 'rgb(41,111,255)':'transparent', borderRadius: 20}} onStartShouldSetResponder={() => changeMode("dark")}>
                  <Text style={{fontFamily: 'Poppins_600SemiBold', color: colorScheme == "dark" ? '#fff': colorScheme == "" || colorScheme == null ? Appearance.getColorScheme() == "dark" ? "#fff":'#000' :'#000'}}>Dark</Text>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colorScheme == "light" ? 'rgb(41,111,255)':'transparent', borderRadius: 20}} onStartShouldSetResponder={() => changeMode("light")}>
                  <Text style={{fontFamily: 'Poppins_600SemiBold', color: colorScheme == "dark" ? '#fff': colorScheme == "" || colorScheme == null ? Appearance.getColorScheme() == "dark" ? "#fff":'#000' :'#fff'}}>Light</Text>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colorScheme == "" || colorScheme == null ? 'rgb(41,111,255)':'transparent', borderRadius: 20}} onStartShouldSetResponder={() => changeMode("")}>
                  <Text style={{fontFamily: 'Poppins_600SemiBold', color: colorScheme == "dark" ? '#fff': colorScheme == "" || colorScheme == null ? Appearance.getColorScheme() == "dark" ? "#fff":'#fff' :'#000'}}>Auto</Text>
                </View>
              </View>
            </View>
        <TouchableOpacity style={styles.bottomSetting} onPress={() => logout()}>
              <Text style={[styles.optionText, {color: 'tomato', fontFamily: 'Poppins_600SemiBold', fontSize: 15}]}>Logout</Text>
        </TouchableOpacity>
        </View>
        </Animatable.View>
  
        <View style={dialog.visible ? [styles.dialogContainer, {backgroundColor: props.colorScheme == "dark" ? 'rgba(22,23,48, 0.95)' : 'rgba(233,240,255,0.95)'}]:[styles.dialogContainer, {display: 'none'}]} onStartShouldSetResponder={() => {Keyboard.dismiss()}}>
          <View style={[styles.dialog, { backgroundColor: props.colorScheme == "dark"? '#212244' : '#fff'}]}>
            <Text style={[styles.text, {color: props.colorScheme == "dark"? "#fff":'#000', textAlign: 'center'}]}>
                {dialog.add == true ? "Select new cryptocurrency":"Edit cryptocurrency"}
            </Text>
            <View style={[styles.picker, {backgroundColor: props.colorScheme == "dark" ? '#161730' : '#e9f0ff'}]}>
              <View style={{display: dialog.add == true ? 'flex':'none'}}>
              <RNPickerSelect
                placeholder={{
                  label: "Enter new Crypto",
                  value: null,
                  color: 'rgba(0,0,0,0.5)',
                }}
                style={pickerSelectStyles(props.colorScheme, dialog.add == true ? 'flex':'none')}
                onValueChange={(value) => setSelectedCrypto(value)}
                items={filteredCryptos.filter(function(obj) {
                  return !userCryptoList.map(x => x["name"]).includes(obj);
                  }).map( obj => {
                    var rObj = {};
                    rObj.label = obj;
                    rObj.value = obj;
                    return rObj;
                  })
                }
                Icon={() => {
                  return <Icon name={arrowRotation == "down" ? "chevron-down":"chevron-up"} size={20} color={props.colorScheme == "dark" ? 'rgba(255,255,255,0.7)':'rgba(0,0,0,0.7)'} style={{marginTop: 15}}/>;
                }}
                onOpen={() => setArrowRotation("up")}
                onClose={() => setArrowRotation("down")}
              />
              </View>
              <View style={{display: dialog.add == true ? 'none':'flex'}}>
                <Text style={{color: props.colorScheme == "dark" ? '#fff':'#000',fontFamily: 'Poppins_500Medium', fontSize: 16, paddingVertical: 12, paddingHorizontal: 10}}>
                  {dialog.name}
                </Text>
              </View>
            </View>
            <View style={{flexDirection:'row',alignItems:'center',height:'25%',justifyContent:'center'}}>
              <Text style={styles.text, {color: props.colorScheme == "dark" ? '#fff':'#000', fontSize: 15, fontFamily: 'Poppins_600SemiBold'}}>Amount</Text>
            </View>
            <View style={[styles.amountInputContainer, {backgroundColor: props.colorScheme == "dark" ? '#161730' : '#e9f0ff', color: props.colorScheme == "dark" ? '#fff' : '#000'}]}>
              <TextInput 
                keyboardType="numeric"
                placeholder= {dialog.add == true ? "Quantity":String(dialog.quantity)}
                placeholderTextColor={props.colorScheme == "dark" ? 'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'}
                style={[styles.textInput, {color: props.colorScheme == "dark" ? '#fff':'#000'}]}
                autoCapitalize="none"
                value={input.toString()}
                onChangeText={(val) => inputChange(val)}
              /> 
            </View>
            <View style={styles.dialogFooter}>
              <TouchableOpacity
                style={styles.button}
                onPress={()=>cancel()}
                activeOpacity={0.9}
                >
                <Text style={[styles.buttontext, {color: 'tomato'}]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.9}
                onPress={()=>dialog.add == true ?add():modify()}
                >
                <Text style={styles.buttontext}>{dialog.add == true ? "Add":"Save"}</Text>
              </TouchableOpacity>
              </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  else{
    return <Loader colorScheme={props.colorScheme}/>
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height:'100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding:0,
  },
  closeIcon:{
    color:'#2970ff',
    position:'absolute',
    top:10,
    right:'5%',
  },
  title:{
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 25,
  },
  optionText:{
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
  },
  cryptoContainer:{
    height:'60%',
    width:'100%',
    alignItems: 'center',
    flex:1,
    justifyContent: 'center'
  },
  scrollView:{
    width:'90%'
  },
  bottomSettings:{
    height:'17%',
    marginBottom: 20,
    marginTop: 5,
    width:'100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bottomSetting:{
    height:'30%',
    flexDirection:'row',
    width:'100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft:50,
    paddingRight:50,
  },
  titleWrapper:{
    height:'10%',
    alignItems:'center',
    justifyContent:'center',
  },
  crypto:{
    marginBottom:5,
    flexDirection:'row',
    height:60,
    borderRadius: 20,
    marginTop: 5,
    width:'100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 30,
    color: '#ffffff'
  },
  autocompleteContainer: {
    backgroundColor: '#000',
    borderWidth: 0,
    borderRadius: 20,
  },
  inputContainer:{
    borderRadius:10,
    width:'100%',
    height:40,
    alignItems:'center',
    justifyContent:'center',
  },
  searchContainer:{
    width:'100%'
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemText: {
    textAlign:'center',
    fontSize: 20,
    paddingTop: 10,
    paddingBottom: 10,
    margin: 5,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 16,
  },
  textInput: {
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingHorizontal: 15,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16 
},
dialogContainer:{
  position: 'absolute',
  width: '100%',
  height: '100%',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
},
dialog:{
  padding: 20,
  borderRadius:20,
  width:'90%',
  height: "55%",
  alignItems:'center',
  justifyContent:'flex-start',
},
text: {
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 20,
  marginTop:10,
  marginBottom:10,
},
autocomplete:{
  height:40,
  color:'#000',
},
autocompleteDialog:{
  flex: 1,
position:'relative',
},
autocompleteContainer: {
  width:200,
  marginTop:10,
  height:40,
  borderWidth: 0,
  borderRadius:10,
},
inputContainer:{
  borderRadius:20,
  width:200,
  height:40,
  alignItems:'center',
  justifyContent:'center',
},
searchContainer:{
  width:200,
},
itemText: {
  textAlign:'center',
  fontSize: 20,
  paddingTop: 10,
  paddingBottom: 10,
  margin: 5,
},
infoText: {
  textAlign: 'center',
  fontSize: 16,
},
dialogFooter:{
  marginTop: 50,
  width: '100%',
  alignSelf:'center',
  justifyContent:'space-between',
  flexDirection:"row",
},
button:{
  width:'45%',
  borderRadius:20,
  alignItems:'center',
  justifyContent:'center'
},
buttontext:{
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 15,
  color: '#2970ff'
},
amountInputContainer:{
  textAlign:'center',
  overflow:'hidden',
  borderRadius:10,
  paddingHorizontal: 10,
  height: 46,
  alignItems:'center',
  justifyContent:'center'
},
trashIcon:{
  position:'absolute',
  right:'5%',
  color:'tomato',
},
picker: {
  marginTop: 20, 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'center', 
  borderRadius: 10,
  paddingHorizontal: 10
},
});


const pickerSelectStyles = (colorScheme) =>{
  return StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderColor: 'gray',
      fontFamily: 'Poppins_500Medium',
      borderRadius: 4,
      color: colorScheme == "dark" ? '#fff':'#000',
      alignItems: 'center',
      paddingRight: 30
    },
    inputAndroid: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderColor: 'gray',
      fontFamily: 'Poppins_500Medium',
      borderRadius: 4,
      color: colorScheme == "dark" ? '#fff':'#000',
      alignItems: 'center',
    }
  });
}
