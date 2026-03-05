import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { MainTabParamList, MapStackParamList } from '../types';

import MapScreen from '../screens/MapScreen';
import ShelterDetailScreen from '../screens/ShelterDetailScreen';
import RateShelterScreen from '../screens/RateShelterScreen';
import AddShelterScreen from '../screens/AddShelterScreen';
import TopSheltersScreen from '../screens/TopSheltersScreen';

// Root stack — ShelterDetail and RateShelter sit here so any tab can navigate to them
export type RootStackParamList = MapStackParamList & { Tabs: undefined };
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function Tabs() {
  return (
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
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Shelters' }} />
      <Tab.Screen name="Top5" component={TopSheltersScreen} options={{ title: 'Top 5', headerShown: true }} />
      <Tab.Screen name="AddShelter" component={AddShelterScreen} options={{ title: 'Add Shelter', headerShown: true }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: true }}>
        <RootStack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <RootStack.Screen
          name="ShelterDetail"
          component={ShelterDetailScreen}
          options={({ route }) => ({ title: route.params.shelter.name })}
        />
        <RootStack.Screen name="RateShelter" component={RateShelterScreen} options={{ title: 'Rate Shelter' }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
