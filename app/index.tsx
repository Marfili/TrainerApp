import { createStackNavigator } from '@react-navigation/stack';
import CalendarScreen from '../screens/CalendarScreen';
import ClientDetailScreen from '../screens/ClientDetailScreen';
import ClientsScreen from '../screens/ClientsScreen';
import DayScreen from '../screens/DayScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: '📅 Ημερολόγιο' }}
      />
      <Stack.Screen
        name="Day"
        component={DayScreen}
        options={{ title: 'Ημέρα' }}
      />
      <Stack.Screen
        name="Clients"
        component={ClientsScreen}
        options={{ title: 'Ασκούμενοι' }}
      />
      <Stack.Screen
        name="ClientDetail"
        component={ClientDetailScreen}
        options={{ title: 'Προφίλ' }}
      />
    </Stack.Navigator>
  );
}