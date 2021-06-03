import React from 'react'
import { PieChart } from 'react-native-svg-charts'
import { Text, View, FlatList} from 'react-native';
import { useEffect , useState} from 'react/cjs/react.development';

function parsePrice(price){
    price = price.toFixed(2);
    var integer = String(Math.trunc(price));
    var decimal = price.split(".")[1];
    if(integer.length > 3){
        integer = [integer.slice(0, (integer.length - 3)), ".", integer.slice((integer.length - 3))].join('');
    }
    return integer + "," + decimal + "$";
}

export default function WalletChart(props){
    const[data,setData]= useState([]);
    const[dataList,setDataList] = useState([]);
    const [currentWalletValue, setcurrentWalletValue] = useState(0);
    
    useEffect(()=>{
        const values=[];
        const legend=[];
        let currentValue = 0;
        Object.keys(props.wallet).forEach(function(key) {
            values.push(props.wallet[key]);
            legend.push({name:key,amount:props.wallet[key]});
            currentValue += props.wallet[key];
        });
        setData(values);
        setDataList(legend);
        setcurrentWalletValue(parsePrice(currentValue));
    },[]);

    const colors = ["#41c26e","#e34334","#f77f06","#f5d033","#a14da0", "#0986d3"];

    const renderItem = ({item, index}) =>{
        return (
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center' , marginTop: 3, marginBottom: 3}}>
                <View style={{ width: 14, height: 14, borderRadius: '50%', borderWidth: 2, borderColor: colors[index]}}/>
                <Text style={{color: props.colorScheme == "dark"? '#fff':'#000', marginLeft: 10, fontFamily: 'Poppins_600SemiBold'}}>{item.name}</Text>
            </View>
        );
    };

    const pieData = data.filter((value) => value > 0).map((value, index) => ({
        value,
        svg: {
            fill: colors[index]
        },
        key: `pie-${index}`
    }));

    return (
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={{width: '48%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <PieChart style={{ height: '100%', width:'100%' }} data={pieData} innerRadius="96%" padAngle={0}/>
                <Text
                    style={{
                        position: 'absolute', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        color: props.colorScheme == "dark" ? '#fff':'#000',
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: currentWalletValue.length < 10 ? 20:15
                    }}>
                        {currentWalletValue}
                </Text>
            </View>
            <View style={{width: '48%', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 10}}>
                <FlatList
                    scrollEnabled={false}
                    data={dataList}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{height: '100%', justifyContent: 'center', alignItems: 'left', flexDirection: 'column'}}
                />
            </View>
      </View>
    )
};