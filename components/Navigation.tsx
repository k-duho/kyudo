import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentOptions } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import AnalysisScreen from './AnalysisScreen';
import MainScreen from './MainScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const themeColors = {
  primary: '#FFFFFF',
  secondary: '#000000', // Black
  tertiary: '#FFD700', // Gold
};

const Navigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator 
        screenOptions={{
          drawerStyle: {
            backgroundColor: themeColors.primary,
          }
        }}
        
        drawerContentOptions={{
          activeTintColor: '#e91e63',
          itemStyle: { marginVertical: 30 },
        }}
      >
        <Drawer.Screen name="記録" component={MainScreen} />
        <Drawer.Screen name="分析" component={AnalysisScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const MainScreenStack: React.FC = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerStyle: { backgroundColor: themeColors.primary },
        headerTintColor: themeColors.secondary,
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      {/* Your Stack Screens */}
    </Stack.Navigator>
  );
};

// And do similar styling for AnalysisScreenStack

export default Navigation;
