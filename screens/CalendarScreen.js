import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';
import { loadAppointments } from '../storage/database';

const MONTHS = ['Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος','Μάιος','Ιούνιος',
  'Ιούλιος','Αύγουστος','Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος'];
const DAYS = ['Κυρ','Δευ','Τρί','Τετ','Πέμ','Παρ','Σάβ'];

export default function CalendarScreen({ navigation }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [appointments, setAppointments] = useState({});

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const data = await loadAppointments();
    setAppointments(data);
  };

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (month, year) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const hasAppointment = (day) => {
    const key = `${currentYear}-${currentMonth + 1}-${day}`;
    return appointments[key] && Object.keys(appointments[key]).length > 0;
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDay(currentMonth, currentYear);
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();
      const hasDot = hasAppointment(d);

      cells.push(
        <TouchableOpacity
          key={d}
          style={[styles.dayCell, isToday && styles.todayCell]}
          onPress={() => navigation.navigate('Day', {
            day: d, month: currentMonth, year: currentYear
          })}
        >
          <Text style={[styles.dayNumber, isToday && styles.todayText]}>{d}</Text>
          {hasDot && <View style={styles.dot} />}
        </TouchableOpacity>
      );
    }
    return cells;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header μήνα */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth}>
          <Text style={styles.arrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTHS[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity onPress={nextMonth}>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Ονόματα ημερών */}
      <View style={styles.weekRow}>
        {DAYS.map(d => (
          <Text key={d} style={styles.weekDay}>{d}</Text>
        ))}
      </View>

      {/* Ημέρες */}
      <View style={styles.grid}>
        {renderDays()}
      </View>

      {/* Κουμπί ασκούμενων */}
      <TouchableOpacity
        style={styles.clientsButton}
        onPress={() => navigation.navigate('Clients')}
      >
        <Text style={styles.clientsButtonText}>👥 Ασκούμενοι</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  arrow: { fontSize: 32, color: '#2196F3', paddingHorizontal: 12 },
  monthTitle: { fontSize: 20, fontWeight: 'bold' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  weekDay: { width: 40, textAlign: 'center', fontWeight: '600', color: '#666' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%', aspectRatio: 1, justifyContent: 'center',
    alignItems: 'center', borderRadius: 8, marginVertical: 2
  },
  emptyDay: { width: '14.28%', aspectRatio: 1 },
  todayCell: { backgroundColor: '#2196F3' },
  dayNumber: { fontSize: 16 },
  todayText: { color: '#fff', fontWeight: 'bold' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginTop: 2 },
  clientsButton: {
    backgroundColor: '#4CAF50', padding: 16,
    borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 32
  },
  clientsButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});