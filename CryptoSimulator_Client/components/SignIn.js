import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform, StyleSheet, ScrollView, Alert} from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import * as SecureStore from 'expo-secure-store';
import Loader from './Loader';

export default function SignIn(props) {
    const [loading, setLoading] = useState(false);

    const [data, setData] = React.useState({
        password: '',
        email:'',
        check_emailInput:false,
        secureTextEntry: true,
    });

    const [errors, setErrors] = React.useState(
        {email: false}
    );


    const emailInputChange = (val) => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if( val.length !== 0  && reg.test(val)=== true) {
            setData({
                ...data,
                email: val,
                check_emailInput: true
            });
        } else {
            setData({
                ...data,
                email: val,
                check_emailInput: false
            });
        }
    }


    const handlePasswordChange = (val) => {
        setData({
            ...data,
            password: val
        });
    }

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry
        });
    }


    const handleSubmit = () =>{

        let emailError = errors.email;

        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(reg.test(data.email)=== false )
        {
            emailError=true;
        }else{
            emailError=false;
        }

        setErrors({
            email:emailError,
        })

        if(!emailError){
            if(data.email != "" && data.password != ""){
                setLoading(true);
                firebase.auth().signInWithEmailAndPassword(data.email,data.password).then(user =>{
                    SecureStore.setItemAsync("user",user.user.uid).then(function(){
                        props.reloadApp();
                    });
                }).catch(error => {
                    if(error.code == "auth/wrong-password" || error.code == "auth/user-not-found"){
                        setLoading(false);
                        Alert.alert("Attention","Wrong Email or Password");
                    }
                    else{
                        console.error(error.code);
                    }
                })
            }
        }
    }


    if(loading){
        return <Loader colorScheme={props.colorScheme}/>
    }
    else{
        return (
            <View style={[styles.container, {backgroundColor: props.colorScheme === 'dark' ? '#161730' : '#e9f0ff'}]}>
                <View style={styles.header}>
                    <Text style={[styles.text_header,{color: props.colorScheme === 'dark' ? '#fff' : '#000', fontFamily: 'Poppins_600SemiBold'}]}>Welcome back to CryptoSimulator!</Text>
                </View>
                <Animatable.View 
                    animation="fadeInUpBig"
                    style={[styles.footer, {backgroundColor: props.colorScheme === 'dark' ? '#212244' : '#fff'}]}
                >
                    <ScrollView>
                    <Text style={[styles.text_footer, {
                        marginTop: 25,
                        color: props.colorScheme === 'dark' ? '#fff' : '#000'
                    }]}>Email</Text>
                    <View style={styles.action}>
                        <FontAwesome 
                            name="envelope-o"
                            color="#2970ff"
                            size={20}
                        />
                        <TextInput 
                            placeholder="Your email"
                            placeholderTextColor = {props.colorScheme == "dark" ? 'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'}
                            style={[styles.textInput, {color: props.colorScheme == "dark" ? "#fff":'#000'}]}
                            autoCapitalize="none"
                            onChangeText={(val) => emailInputChange(val)}
                        />
                        {data.check_emailInput ? 
                        <Animatable.View
                            animation="bounceIn"
                        >
                            <Feather 
                                name="check-circle"
                                color="#2970ff"
                                size={20}
                            />
                        </Animatable.View>
                        : null}
                    </View>
                        {errors.email?<Animatable.Text style={styles.error} animation="bounceIn">
                        Invalid email
                        </Animatable.Text>:null}
    
                    <Text style={[styles.text_footer, {
                        marginTop: 25,
                        color: props.colorScheme === 'dark' ? '#fff' : '#000'
                    }]}>Password</Text>
                    <View style={styles.action}>
                        <Feather 
                            name="lock"
                            color="#2970ff"
                            size={20}
                        />
                        <TextInput 
                            placeholder="Your Password"
                            placeholderTextColor = {props.colorScheme == "dark" ? 'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'}
                            style={[styles.textInput, {color: props.colorScheme == "dark" ? "#fff":'#000'}]}
                            secureTextEntry={data.secureTextEntry ? true : false}
                            autoCapitalize="none"
                            onChangeText={(val) => handlePasswordChange(val)}
                        />
                        <TouchableOpacity
                            onPress={updateSecureTextEntry}
                        >
                            {data.secureTextEntry ? 
                            <Feather 
                                name="eye-off"
                                color="#2970ff"
                                size={20}
                            />
                            :
                            <Feather 
                                name="eye"
                                color="#2970ff"
                                size={20}
                            />
                            }
                        </TouchableOpacity>
                    </View>
    
                    <View style={styles.button}>
                        <TouchableOpacity
                            style={styles.signIn}
                            onPress={() => handleSubmit()}
                        >
                        <LinearGradient
                            colors={['#2970ff', '#2970ff']}
                            style={styles.signIn}
                        >
                            <Text style={[styles.textSign, {
                                color:'#fff'
                            }]}>Sign In</Text>
                        </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <Text style={ {
                                marginTop:30,
                                alignSelf:'center',
                                color: props.colorScheme == "dark" ? "#fff":"#000",
                                fontFamily: 'Poppins_500Medium',
                                fontSize: 15,
                            }}>Don't have an account?</Text>
                    <View style={styles.button}>
                        <TouchableOpacity
                            style={styles.signUp}
                            onPress={() => props.navigation.navigate('SignUp')}
                        >
                            <Text style={[styles.textSignUp, {
                                color:'#2970ff'
                            }]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                    </ScrollView>
                </Animatable.View>
            </View>
        );
    }
  };

const styles = StyleSheet.create({
    container: {
      flex: 1, 
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 20
    },
    footer: {
        flex: Platform.OS === 'ios' ? 5 : 5,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    text_header: {
        fontWeight: 'bold',
        fontSize: 30
    },
    text_footer: {
        fontSize: 14,
        fontFamily: 'Poppins_500Medium'
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2970ff',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        fontFamily: 'Poppins_500Medium'
    },
    button: {
        alignItems: 'center',
        marginTop: 30
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    signUp: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth:2,
        borderColor:'#2970ff'
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    textSignUp: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    textPrivate: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20
    },
    color_textPrivate: {
        color: '#2970ff'
    },
    error:{
        color:'tomato',
        fontSize:12,
        marginTop:5,
        fontFamily: 'Poppins_500Medium'
    }
});
