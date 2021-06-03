import React from 'react';
import { Animated, View, Easing} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Loader(props) {
    let spinValue = new Animated.Value(0);

    Animated.loop(
        Animated.timing(
            spinValue,
        {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true 
        }
        )
    ).start()

    const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
    })

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: props.colorScheme == "dark" ? '#161730' : '#e9f0ff'}}>
            <StatusBar style={props.colorScheme == 'dark' ? 'light' : 'dark'} />
            <Animated.View style={{width: 60, height: 60, borderWidth: 5, borderRadius: '50%', borderColor: 'transparent', borderTopColor: 'rgb(41,111,255)', transform: [{rotate: spin}] }}>
            </Animated.View>
        </View>
    );

}