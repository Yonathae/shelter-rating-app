import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import {
  MainTabParamList,
  MapStackParamList,
} from '../types';

import MapScreen from '../screens/MapScreen';
import ShelterDetailScreen from '../screens/ShelterDetailScreen';
import RateShelterScreen from '../screens/RateShelterScreen';
import AddShelterScreen from '../screens/AddShelterScreen';
import TopSheltersScreen from '../screens/TopSheltersScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const MapStack = createNativeStackNavigator<MapStackParamList>();

function MapNavigator() {
  return (
    <MapStack.Navigator>
      <MapStack.Screen name="MapHome" component={MapScreen} options={{ title: 'Shelters' }} />
      <MapStack.Screen
        name="ShelterDetail"
        component={ShelterDetailScreen}
        options={({ route }) => ({ title: route.params.shelter.name })}
      />
      <MapStack.Screen name="RateShelter" component={RateShelterScreen} options={{ title: 'Rate Shelter' }} />
    </MapStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            const icons: Record<string, string> = { Map: '🗺️', Top5: '🏆', AddShelter: '➕' };
            return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>;
          },
          tabBarActiveTintColor: '#4f6ef7',
          tabBarInactiveTintColor: '#aaa',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Map" component={MapNavigator} options={{ title: 'Shelters' }} />
        <Tab.Screen name="Top5" component={TopSheltersScreen} options={{ title: 'Top 5', headerShown: true }} />
        <Tab.Screen name="AddShelter" component={AddShelterScreen} options={{ title: 'Add Shelter', headerShown: true }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
