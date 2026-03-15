import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { countSessionsUpToDate, loadAppointments, loadClients, saveAppointments } from '../storage/database';

const HOURS = [];
for (let h = 7; h <= 21; h++) {
  HOURS.push(`${h}:00`);
}

const MONTHS = ['Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος','Μάιος','Ιούνιος',
  'Ιούλιος','Αύγουστος','Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος'];

export default function DayScreen({ route, navigation }) {
  const { day, month, year } = route.params;
  const dateKey = `${year}-${month + 1}-${day}`;

  const [appointments, setAppointments] = useState({});
  const [clients, setClients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);
  const [clientName, setClientName] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  const [sessionCounts, setSessionCounts] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const appts = await loadAppointments();
    const cls = await loadClients();
    setAppointments(appts);
    setClients(cls);

    // Υπολόγισε συνεδρίες για κάθε ασκούμενο μέχρι αυτή τη μέρα
    const counts = {};
    const thisDate = new Date(year, month, day);
    cls.forEach(c => {
      counts[c.name] = countSessionsUpToDate(appts, c.name, thisDate);
    });
    setSessionCounts(counts);
  };

  const dayAppointments = appointments[dateKey] || {};

  const getClientsForHour = (hour) => {
    const slot = dayAppointments[hour];
    if (!slot) return [];
    if (Array.isArray(slot)) return slot;
    return [slot];
  };

  const handleHourPress = (hour) => {
    setSelectedHour(hour);
    setClientName('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!clientName.trim()) return;

    const appts = await loadAppointments();
    if (!appts[dateKey]) appts[dateKey] = {};

    const existing = getClientsForHour(selectedHour);
    const newEntry = {
      clientName: clientName.trim(),
      paid: false,
      date: new Date(year, month, day).toISOString(),
    };

    appts[dateKey][selectedHour] = [...existing, newEntry];
    await saveAppointments(appts);

    // Έλεγχος για 7η συνεδρία
    const thisDate = new Date(year, month, day);
    const sessions = countSessionsUpToDate(appts, clientName.trim(), thisDate);
    if (sessions === 7) {
      Alert.alert(
        '⚠️ Προσοχή!',
        `Ο/Η ${clientName.trim()} είναι στην 7η συνεδρία του μήνα!\nΠροτελευταία — σύντομα χρειάζεται ανανέωση!`
      );
    } else if (sessions === 8) {
      Alert.alert(
        '🎉 Ολοκλήρωση!',
        `Ο/Η ${clientName.trim()} ολοκλήρωσε τις 8 συνεδρίες του μήνα!`
      );
    }

    setModalVisible(false);
    loadData();
  };

  const handleDelete = async (hour, index) => {
    Alert.alert(
      'Διαγραφή',
      'Θέλεις να διαγράψεις αυτό το ραντεβού;',
      [
        { text: 'Άκυρο', style: 'cancel' },
        {
          text: 'Διαγραφή', style: 'destructive',
          onPress: async () => {
            const appts = await loadAppointments();
            const existing = getClientsForHour(hour);
            const updated = existing.filter((_, i) => i !== index);
            if (updated.length === 0) {
              delete appts[dateKey][hour];
            } else {
              appts[dateKey][hour] = updated;
            }
            await saveAppointments(appts);
            loadData();
          }
        }
      ]
    );
  };

  const togglePaid = async (hour, index) => {
    const appts = await loadAppointments();
    const existing = [...getClientsForHour(hour)];
    existing[index] = { ...existing[index], paid: !existing[index].paid };
    appts[dateKey][hour] = existing;
    await saveAppointments(appts);
    loadData();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {day} {MONTHS[month]} {year}
      </Text>

      <ScrollView>
        {HOURS.map(hour => {
          const hourClients = getClientsForHour(hour);
          return (
            <View key={hour} style={styles.hourBlock}>
              <View style={styles.hourHeader}>
                <Text style={styles.hourText}>{hour}</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => handleHourPress(hour)}
                >
                  <Text style={styles.addBtnText}>+ Προσθήκη</Text>
                </TouchableOpacity>
              </View>

              {hourClients.map((appt, index) => {
                const count = sessionCounts[appt.clientName] || 0;
                const isWarning = count === 7;
                const isComplete = count === 8;

                return (
                  <View
                    key={index}
                    style={[
                      styles.apptCard,
                      appt.paid && styles.apptPaid,
                      isWarning && styles.apptWarning,
                      isComplete && styles.apptComplete,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.apptInfo}
                      onPress={() => navigation.navigate('ClientDetail', { clientName: appt.clientName })}
                    >
                      <View style={styles.nameRow}>
                        <Text style={styles.apptName}>{appt.clientName}</Text>
                        <Text style={styles.sessionBadge}>
                          {count}/8
                        </Text>
                      </View>
                      <Text style={styles.apptStatus}>
                        {appt.paid ? '✅ Πληρωμένο' : '❌ Απλήρωτο'}
                        {isWarning ? '  ⚠️ Προτελευταία!' : ''}
                        {isComplete ? '  🎉 Ολοκληρώθηκε!' : ''}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.apptButtons}>
                      <TouchableOpacity
                        style={styles.paidBtn}
                        onPress={() => togglePaid(hour, index)}
                      >
                        <Text style={styles.paidBtnText}>💰</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(hour, index)}
                      >
                        <Text style={styles.deleteBtnText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Προσθήκη στις {selectedHour}</Text>
            <TextInput
              style={styles.input}
              placeholder="Όνομα ασκούμενου"
              value={clientName}
              onChangeText={setClientName}
              onFocus={() => setShowClientList(true)}
            />
            {showClientList && clients.length > 0 && (
              <ScrollView style={styles.clientDropdown}>
                {clients
                  .filter(c => c.name.toLowerCase().includes(clientName.toLowerCase()))
                  .map(c => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.clientOption}
                      onPress={() => {
                        setClientName(c.name);
                        setShowClientList(false);
                      }}
                    >
                      <Text>{c.name}</Text>
                    </TouchableOpacity>
                  ))
                }
              </ScrollView>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Άκυρο</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>Αποθήκευση</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', padding: 16, backgroundColor: '#fff' },
  hourBlock: {
    backgroundColor: '#fff', marginBottom: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  hourHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6
  },
  hourText: { fontSize: 15, fontWeight: '700', color: '#444', width: 50 },
  addBtn: { backgroundColor: '#e3f2fd', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  addBtnText: { color: '#2196F3', fontWeight: '600', fontSize: 13 },
  apptCard: {
    backgroundColor: '#2196F3', borderRadius: 8, padding: 10,
    marginBottom: 4, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center'
  },
  apptPaid: { backgroundColor: '#4CAF50' },
  apptWarning: { backgroundColor: '#FF9800' },
  apptComplete: { backgroundColor: '#9C27B0' },
  apptInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  apptName: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sessionBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    color: '#fff', fontSize: 12, fontWeight: 'bold',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10
  },
  apptStatus: { color: '#fff', fontSize: 12, marginTop: 2 },
  apptButtons: { flexDirection: 'row', gap: 6 },
  paidBtn: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, padding: 6 },
  paidBtnText: { fontSize: 16 },
  deleteBtn: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, padding: 6 },
  deleteBtnText: { fontSize: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center'
  },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, fontSize: 16, marginBottom: 8
  },
  clientDropdown: {
    maxHeight: 150, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, marginBottom: 12
  },
  clientOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, padding: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#ddd', alignItems: 'center'
  },
  cancelText: { color: '#666' },
  saveBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#2196F3', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
});