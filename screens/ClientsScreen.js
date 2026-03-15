import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { loadClients, saveClients } from '../storage/database';

export default function ClientsScreen({ navigation }) {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const data = await loadClients();
    setClients(data);
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    const existing = await loadClients();
    const newClient = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    await saveClients([...existing, newClient]);
    setName('');
    loadData();
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Διαγραφή',
      'Θέλεις να διαγράψεις αυτόν τον ασκούμενο;',
      [
        { text: 'Άκυρο', style: 'cancel' },
        {
          text: 'Διαγραφή', style: 'destructive',
          onPress: async () => {
            const existing = await loadClients();
            const updated = existing.filter(c => c.id !== id);
            await saveClients(updated);
            loadData();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 Ασκούμενοι</Text>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Όνομα νέου ασκούμενου..."
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={clients}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.clientRow}>
            <TouchableOpacity
              style={styles.clientInfo}
              onPress={() => navigation.navigate('ClientDetail', { clientName: item.name })}
            >
              <Text style={styles.clientName}>{item.name}</Text>
              <Text style={styles.clientArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Δεν υπάρχουν ασκούμενοι ακόμα.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  addRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  input: {
    flex: 1, backgroundColor: '#fff', borderRadius: 8,
    padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd'
  },
  addBtn: {
    backgroundColor: '#4CAF50', width: 48, height: 48,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center'
  },
  addBtnText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  clientRow: {
    backgroundColor: '#fff', borderRadius: 10, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden'
  },
  clientInfo: {
    flex: 1, padding: 16, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center'
  },
  clientName: { fontSize: 17, fontWeight: '500' },
  clientArrow: { fontSize: 22, color: '#aaa' },
  deleteBtn: { padding: 16 },
  deleteBtnText: { fontSize: 20 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 16 },
});