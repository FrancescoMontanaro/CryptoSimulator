import 'react-native-gesture-handler';
import React, {useState} from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform, StyleSheet, ScrollView, Alert} from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import * as SecureStore from 'expo-secure-store';
import Loader from './Loader';

export default function SignUp(props) {
    const [loading, setLoading] = useState(false);

    const [data, setData] = React.useState({
        username: '',
        password: '',
        email:'',
        confirm_password: '',
        check_textInputChange: false,
        check_emailInput:false,
        secureTextEntry: true,
        confirm_secureTextEntry: true,
    });

    const [errors, setErrors] = React.useState(
        {
            username: false,
            email: false,
            shortPassword: false,
            confirmedPassword: false,
        }
    );

    const textInputChange = (val) => {
        if( val.length !== 0 ) {
            setData({
                ...data,
                username: val,
                check_textInputChange: true
            });
        } else {
            setData({
                ...data,
                username: val,
                check_textInputChange: false
            });
        }
    }

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

    const handleConfirmPasswordChange = (val) => {
        setData({
            ...data,
            confirm_password: val
        });
    }

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry
        });
    }

    const updateConfirmSecureTextEntry = () => {
        setData({
            ...data,
            confirm_secureTextEntry: !data.confirm_secureTextEntry
        });
    }



    const handleSubmit = () =>{

        let passwordError = errors.shortPassword;
        let usernameError = errors.username;
        let confirmedPasswordError = errors.confirmedPassword;
        let emailError = errors.email;

        if(data.username.length>0)
        {
            usernameError=false;
        }
        else{
            usernameError=true;
        }

        if(data.password.length < 6 )
        {
            console.log("errore password")
            passwordError = true;
        }else{
            passwordError=false;
        }

        if(data.password!== data.confirm_password)
        {
            console.log("errore conferma password")
            confirmedPasswordError=true;
        }else{
            confirmedPasswordError=false;
        }
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(reg.test(data.email)=== false )
        {
            emailError=true;
        }else{
            emailError=false;
        }

        setErrors({
            username: usernameError,
            shortPassword:passwordError,
            confirmedPassword:confirmedPasswordError,
            email:emailError,
        })

        if(!(errors.username || errors.shortPassword || errors.confirmedPassword || errors.email)){
            if(data.email != "" && data.password != ""){
                setLoading(true);
                firebase.auth().createUserWithEmailAndPassword(data.email,data.password).then(user => {
                    firebase.firestore().collection("users").doc(user.user.uid).set({
                        username:data.username,
                        wallet:""
                    }).then(function(){
                        SecureStore.setItemAsync("user",user.user.uid).then(function(){
                            props.reloadApp();
                        });
                    }).catch(error =>{
                        console.error(error);
                    })
                }).catch(error => {
                    if(error.code == "auth/email-already-in-use"){
                        setLoading(false);
                        Alert.alert("Attention","The Email entered corresponds to an existing account.");
                    }
                    else if(error.code == "auth/weak-password"){
                        setLoading(false);
                        Alert.alert("Attention","Your password is too weak. Choose a new one.");
                    }
                    else{
                        console.error(error.code);
                    }
                });
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
                    <Text style={[styles.text_header, {color: props.colorScheme === 'dark' ? '#fff' : '#000', fontFamily: 'Poppins_600SemiBold'}]}>Welcome to CryptoSimulator!</Text>
                </View>
                <Animatable.View 
                    animation="fadeInUpBig"
                    style={[styles.footer, {backgroundColor: props.colorScheme === 'dark' ? '#212244' : '#fff'}]}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={[styles.text_footer, {color: props.colorScheme === 'dark' ? '#fff' : '#000'}]}>Username</Text>
                    <View style={styles.action}>
                        <FontAwesome 
                            name="user-o"
                            color="#2970ff"
                            size={20}
                        />
                        <TextInput 
                            placeholder="Your Username"
                            placeholderTextColor = {props.colorScheme == "dark" ? 'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'}
                            style={[styles.textInput, {color: props.colorScheme == "dark" ? "#fff":'#000'}]}
                            autoCapitalize="none"
                            onChangeText={(val) => textInputChange(val)}
                        />
                        {data.check_textInputChange ? 
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
                        {errors.username?<Animatable.Text style={styles.error} animation="bounceIn">
                            Username already taken
                        </Animatable.Text>:null}
    
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
                            secureTextEntry={data.secureTextEntry ? true : false}
                            style={[styles.textInput, {color: props.colorScheme == "dark" ? "#fff":'#000'}]}
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
                        {errors.shortPassword?<Animatable.Text style={styles.error} animation="bounceIn">
                        Password too short
                        </Animatable.Text>:null}
    
                    <Text style={[styles.text_footer, {
                        marginTop: 25,
                        color: props.colorScheme === 'dark' ? '#fff' : '#000'
                    }]}>Confirm Password</Text>
                    <View style={styles.action}>
                        <Feather 
                            name="lock"
                            color="#2970ff"
                            size={20}
                        />
                        <TextInput 
                            placeholder="Confirm Your Password"
                            placeholderTextColor = {props.colorScheme == "dark" ? 'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'}
                            secureTextEntry={data.confirm_secureTextEntry ? true : false}
                            style={[styles.textInput, {color: props.colorScheme == "dark" ? "#fff":'#000'}]}
                            autoCapitalize="none"
                            onChangeText={(val) => handleConfirmPasswordChange(val)}
                        />
                        <TouchableOpacity
                            onPress={updateConfirmSecureTextEntry}
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
                    {errors.confirmedPassword?<Animatable.Text style={styles.error} animation="bounceIn">
                        Passwords don't match
                        </Animatable.Text>:null}
    
    
    
    
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
                            }]}>Sign Up</Text>
                        </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <Text style={ {
                                marginTop:30,
                                alignSelf:'center',
                                color: props.colorScheme == "dark" ? "#fff":"#000",
                                fontFamily: 'Poppins_500Medium',
                                fontSize: 15,
                            }}>Already have an account?</Text>
                    <View style={styles.button}>
                        <TouchableOpacity
                            style={styles.signUp}
                            onPress={() => props.navigation.navigate('SignIn')}
                        >
                            <Text style={[styles.textSignUp, {
                                color:'#2970ff'
                            }]}>Sign In</Text>
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
      flex: 1
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
        paddingVertical: 30,
    },
    text_header: {
        fontWeight: 'bold',
        fontSize: 30,
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
        borderRadius: 10,
    },
    textSign: {
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
  });
