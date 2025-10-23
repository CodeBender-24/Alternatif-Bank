import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useAppData } from './src/context/AppContext';
import { colors } from './src/theme/colors';

import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import OtpVerifyScreen from './src/screens/OtpVerifyScreen';
import KycScreen from './src/screens/KycScreen';
import HomeScreen from './src/screens/HomeScreen';
import TransferScreen from './src/screens/TransferScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import CardsScreen from './src/screens/CardsScreen';
import SupportScreen from './src/screens/SupportScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: '#ffffff',
    text: colors.text
  }
};

const AuthStackScreen = ({ hasAccount }) => (
  <AuthStack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName={hasAccount ? 'Login' : 'Onboarding'}
  >
    <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="OtpVerify" component={OtpVerifyScreen} />
    <AuthStack.Screen name="Kyc" component={KycScreen} />
  </AuthStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerStyle: { backgroundColor: '#ffffff' },
      headerShadowVisible: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: '#ffffff' },
      tabBarIcon: ({ color, size }) => {
        let iconName = 'home';
        switch (route.name) {
          case 'Ana Sayfa':
            iconName = 'home';
            break;
          case 'Transfer':
            iconName = 'swap-horizontal';
            break;
          case 'Ödemeler':
            iconName = 'document-text';
            break;
          case 'Kartlar':
            iconName = 'card';
            break;
          case 'Destek':
            iconName = 'chatbubbles';
            break;
          case 'Ayarlar':
            iconName = 'settings';
            break;
          default:
            iconName = 'ellipse';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      }
    })}
  >
    <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
    <Tab.Screen name="Transfer" component={TransferScreen} />
    <Tab.Screen name="Ödemeler" component={PaymentsScreen} />
    <Tab.Screen name="Kartlar" component={CardsScreen} />
    <Tab.Screen name="Destek" component={SupportScreen} />
    <Tab.Screen name="Ayarlar" component={SettingsScreen} />
  </Tab.Navigator>
);

const AppShell = () => {
  const { state } = useAppData();
  return (
    <NavigationContainer theme={navTheme}>
      {state.isAuthenticated ? <TabNavigator /> : <AuthStackScreen hasAccount={Boolean(state.user)} />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
