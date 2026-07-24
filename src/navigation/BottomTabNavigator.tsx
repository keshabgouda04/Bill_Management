import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../modules/dashboard';
import { ViewBillsScreen } from '../modules/bills';
import { CategoriesScreen } from '../modules/categories';
import { ProfileScreen } from '../modules/profile';
import { BottomTabBar } from './components/BottomTabBar';

export type MainTabParamList = {
  Dashboard: undefined;
  ViewBills: undefined;
  Categories: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="ViewBills" component={ViewBillsScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
