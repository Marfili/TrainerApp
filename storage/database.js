import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveAppointments = async (appointments) => {
  await AsyncStorage.setItem('appointments', JSON.stringify(appointments));
};

export const loadAppointments = async () => {
  const data = await AsyncStorage.getItem('appointments');
  return data ? JSON.parse(data) : {};
};

export const saveClients = async (clients) => {
  await AsyncStorage.setItem('clients', JSON.stringify(clients));
};

export const loadClients = async () => {
  const data = await AsyncStorage.getItem('clients');
  return data ? JSON.parse(data) : [];
};

// Μετράει συνεδρίες ασκούμενου για τον τρέχοντα μήνα (1-8 κυκλικά)
export const countMonthSessions = (appointments, clientName) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  let count = 0;

  Object.values(appointments).forEach(daySlots => {
    Object.values(daySlots).forEach(slot => {
      const entries = Array.isArray(slot) ? slot : [slot];
      entries.forEach(entry => {
        if (entry && entry.clientName === clientName) {
          const d = new Date(entry.date);
          if (d.getMonth() === month && d.getFullYear() === year) {
            count++;
          }
        }
      });
    });
  });

  // Κυκλικά 1-8
  const remainder = count % 8;
  return remainder === 0 && count > 0 ? 8 : remainder;
};

// Μετράει συνεδρίες μέχρι και μια συγκεκριμένη ημερομηνία
export const countSessionsUpToDate = (appointments, clientName, upToDate) => {
  const month = upToDate.getMonth();
  const year = upToDate.getFullYear();
  let count = 0;

  Object.entries(appointments).forEach(([dateKey, daySlots]) => {
    Object.values(daySlots).forEach(slot => {
      const entries = Array.isArray(slot) ? slot : [slot];
      entries.forEach(entry => {
        if (entry && entry.clientName === clientName) {
          const d = new Date(entry.date);
          if (d.getMonth() === month && d.getFullYear() === year &&
              d <= upToDate) {
            count++;
          }
        }
      });
    });
  });

  const remainder = count % 8;
  return remainder === 0 && count > 0 ? 8 : remainder;
};