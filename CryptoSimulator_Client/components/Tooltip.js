import React from 'react';
import {G, Line, Circle} from 'react-native-svg'

export default function Tooltip(props){
    const touchX = props.touchX;
    const deviceWidth = props.deviceWidth;
    const data = props.data;
    const x = props.x;
    const y = props.y;

    if(touchX >= 0 && deviceWidth != null && data.length > 0){
        var swipeIndex = Math.floor((touchX / deviceWidth) * data.length);
        if(swipeIndex < data.length){
            return (
                <G x={ x(swipeIndex) - (75 / 2) }>
                <G x={ 75 / 2 }>
                    <Line
                      y1={ '100%' }
                      y2={ 0 }
                      stroke={ props.color }
                      strokeWidth={ 2 }
                    />
                    <Circle
                        cy={ y(data[swipeIndex])}
                        r={ 6 }
                        fill={ props.color }
                    />
                </G>
              </G>
            )
        }
        else{
            return(null);
        }
    }
    else{
        return (null);
    }
}