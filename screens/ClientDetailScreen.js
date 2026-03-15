import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { countMonthSessions, loadAppointments } from '../storage/database';

const MONTHS = ['Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος','Μάιος','Ιούνιος',
  'Ιούλιος','Αύγουστος','Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος'];

export default function ClientDetailScreen({ route }) {
  const { clientName } = route.params;
  const [appointments, setAppointments] = useState({});
  const [sessions, setSessions] = useState([]);
  const [monthCount, setMonthCount] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const appts = await loadAppointments();
    setAppointments(appts);

    // Βρες όλες τις συνεδρίες αυτού του ασκούμενου
    const allSessions = [];
    Object.entries(appts).forEach(([dateKey, slots]) => {
      Object.entries(slots).forEach(([hour, slot]) => {
        if (slot && slot.clientName === clientName) {
          allSessions.push({ dateKey, hour, ...slot });
        }
      });
    });

    // Ταξινόμηση από νεότερο σε παλαιότερο
    allSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    setSessions(allSessions);

    const count = countMonthSessions(appts, clientName);
    setMonthCount(count);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{clientName}</Text>

      {/* Συνεδρίες μήνα */}
      <View style={styles.monthCard}>
        <Text style={styles.monthCardTitle}>Συνεδρίες τρέχοντος μήνα</Text>
        <View style={styles.dotsRow}>
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i < monthCount && styles.dotFilled]}
            />
          ))}
        </View>
        <Text style={styles.monthCount}>{monthCount}/8</Text>
        {monthCount === 7 && (
          <Text style={styles.warning}>⚠️ Προτελευταία συνεδρία μήνα!</Text>
        )}
        {monthCount === 8 && (
          <Text style={styles.complete}>🎉 Ολοκληρώθηκαν οι 8 συνεδρίες!</Text>
        )}
      </View>

      {/* Ιστορικό */}
      <Text style={styles.sectionTitle}>📋 Ιστορικό Συνεδριών</Text>
      {sessions.length === 0 && (
        <Text style={styles.emptyText}>Δεν υπάρχουν συνεδρίες ακόμα.</Text>
      )}
      {sessions.map((s, index) => {
        const d = new Date(s.date);
        return (
          <View key={index} style={[styles.sessionCard, s.paid && styles.sessionPaid]}>
            <View>
              <Text style={styles.sessionDate}>
                {d.getDate()} {MONTHS[d.getMonth()]} {d.getFullYear()}
              </Text>
              <Text style={styles.sessionHour}>🕐 {s.hour}</Text>
            </View>
            <Text style={[styles.paidText, { color: s.paid ? '#4CAF50' : '#f44336' }]}>
              {s.paid ? '✅ Πληρωμένο' : '❌ Απλήρωτο'}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16 },
  monthCard: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 16, marginBottom: 20, alignItems: 'center'
  },
  monthCardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#444' },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#eee', borderWidth: 2, borderColor: '#ddd'
  },
  dotFilled: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  monthCount: { fontSize: 22, fontWeight: 'bold', color: '#2196F3' },
  warning: { color: '#FF9800', fontWeight: '600', marginTop: 8, fontSize: 15 },
  complete: { color: '#4CAF50', fontWeight: '600', marginTop: 8, fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 20 },
  sessionCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    marginBottom: 8, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center'
  },
  sessionPaid: { borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  sessionDate: { fontSize: 15, fontWeight: '600' },
  sessionHour: { color: '#666', marginTop: 2 },
  paidText: { fontWeight: '600' },
});