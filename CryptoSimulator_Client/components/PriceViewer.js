import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["Gen", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getDate(timestamp){
    if(timestamp == null || timestamp == ""){
        return "";
    }
    var date = new Date(timestamp);
    var textDate = days[date.getDay()] + " " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
    return textDate;
}

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

export default function PriceViewer(props){
    const touchX = props.touchX;
    const deviceWidth = props.deviceWidth;
    const data = props.data;

    if(touchX >= 0 && deviceWidth != null && data.length > 0){
        var swipeIndex = Math.floor((touchX / deviceWidth) * data.length);
        if(swipeIndex < data.length){
            return(
                <View>
                    <Text style={[styles.currentPrice, {color: props.colorScheme === "dark" ? '#fff' : '#000'}]}>{parsePrice(data[swipeIndex][1])}</Text>
                    <Text style={[styles.currentDate, {color: props.colorScheme === "dark" ? '#fff' : '#000'}]}>{getDate(data[swipeIndex][0])}</Text>
                </View>
            )
        }
        else{
            return(
                <View>
                    <Text style={[styles.currentPrice, {color: props.colorScheme === "dark" ? '#fff' : '#000'}]}>{parsePrice(data[data.length - 1][1])}</Text>
                    <Text style={[styles.currentDate, {color: props.colorScheme === "dark" ? '#fff' : '#000'}]}>Current price</Text>
                </View>
            )
        }
    }
    else{
        return(
            <View>
                <Text style={[styles.currentPrice, {color: props.colorScheme === "dark" ? '#fff' : '#000'}]}>{parsePrice(data[data.length - 1][1])}</Text>
                <Text style={[styles.currentDate, {color: props.colorScheme === "dark" ? '#fff' : '#000'}]}>Current price</Text>
            </View>
        )
    }
};

const styles = StyleSheet.create({
    currentPrice: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 18,
        margin: 0
    },
    currentDate: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 12,
        margin: 0
    },
})