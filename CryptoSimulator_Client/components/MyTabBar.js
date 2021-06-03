import * as React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const dimensions = Dimensions.get("window");

export default function MyTabBar({ state, descriptors, navigation, colorScheme, display }) {
  return (
    <View style={{position:'absolute', bottom:0, display: display == true ? 'flex':'none', flexDirection: 'row', backgroundColor: colorScheme === 'dark' ? '#212244' : '#fff',
    shadowColor: '#666',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2, }}>
    {state.routes.map((route, index) => {
      const { options } = descriptors[route.key];
      const label =
        options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

      const isFocused = state.index === index;

      const onPress = () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
        });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };
        
        const getIcon = (label) =>{
          if(label=='Charts')
            return "home";
          if(label=='Predictions')
              return "trending-up";
          if(label=='Account')
            return "user";
        };

        return (
        <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={1}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.appbar}
          >
            <Icon name={getIcon(label)} size={28} style={{color: isFocused ? '#2970ff' : colorScheme === 'dark' ? '#fff' : '#000'}} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9f0ff'
  },
  text: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 30,
  },
  appbar:{
      flex: 1 , 
      alignItems:'center',
      padding: 12,
      paddingBottom: dimensions.height > 800 ? 30:12 
  },
});