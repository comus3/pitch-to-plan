import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IdeasListScreen } from '../app/IdeasListScreen';
import { IdeaDetailScreen } from '../app/IdeaDetailScreen';
import { InterviewScreen } from '../app/InterviewScreen';

export type RootStackParamList = {
  IdeasList: undefined;
  IdeaDetail: { ideaId: string };
  Interview: { ideaId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="IdeasList"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="IdeasList" component={IdeasListScreen} />
        <Stack.Screen
          name="IdeaDetail"
          component={IdeaDetailScreen}
          options={{
            headerShown: true,
            title: 'Idea Details',
          }}
        />
        <Stack.Screen
          name="Interview"
          component={InterviewScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
