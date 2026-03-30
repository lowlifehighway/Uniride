// components/CustomTabBar.js
import React from 'react';
import BottomNav from './BottomNav';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return <BottomNav state={state} navigation={navigation} />;
};

export default CustomTabBar;
