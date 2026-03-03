import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  MapStackParamList,
} from '../types';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import MapScreen from '../screens/MapScreen';
import ShelterDetailScreen from '../screens/ShelterDetailScreen';
import RateShelterScreen from '../screens/RateShelterScreen';
import AddShelterScreen from '../screens/AddShelterScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const MapStack = createNativeStackNavigator<MapStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function MapNavigator() {
  return (
    <MapStack.Navigator>
      <MapStack.Screen
        name="MapHome"
        component={MapScreen}
        options={{ title: 'Shelters' }}
      />
      <MapStack.Screen
        name="ShelterDetail"
        component={ShelterDetailScreen}
        options={({ route }) => ({ title: route.params.shelter.name })}
      />
      <MapStack.Screen
        name="RateShelter"
        component={RateShelterScreen}
        options={{ title: 'Rate Shelter' }}
      />
    </MapStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icons: Record<string, string> = { Map: '🗺️', AddShelter: '➕' };
          return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>;
        },
        tabBarActiveTintColor: '#4f6ef7',
        tabBarInactiveTintColor: '#aaa',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Map" component={MapNavigator} options={{ title: 'Shelters' }} />
      <Tab.Screen name="AddShelter" component={AddShelterScreen} options={{ title: 'Add Shelter', headerShown: true }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4f6ef7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
