import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addTransaction } from '../services/transactionService';
const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Salary',
  'Other',
];

export default function AddTransactionScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');

  async function handleSave() {
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than zero.');
      return;
    }

    try {
      await addTransaction({
        amount: parsedAmount,
        note: note.trim() || 'No description',
        type,
        category,
      });

      setAmount('');
      setNote('');
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Save failed', 'Could not save this transaction.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Transaction</Text>

      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.expenseActive]}
          onPress={() => setType('expense')}
        >
          <Text style={styles.buttonText}>Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.incomeActive]}
          onPress={() => setType('income')}
        >
          <Text style={styles.buttonText}>Income</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Category</Text>

      <View style={styles.categoryList}>
        {CATEGORIES.map(item => (
          <TouchableOpacity
            key={item}
            style={[
              styles.categoryButton,
              category === item && styles.categoryButtonActive,
            ]}
            onPress={() => setCategory(item)}
          >
            <Text
              style={[
                styles.categoryText,
                category === item && styles.categoryTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Transaction</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#64748b',
    borderRadius: 8,
    padding: 14,
  },
  expenseActive: { backgroundColor: '#dc2626' },
  incomeActive: { backgroundColor: '#16a34a' },
  buttonText: { color: '#fff', fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    marginTop: 8,
    padding: 16,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionLabel: {
  fontSize: 16,
  fontWeight: '700',
  marginTop: 4,
    },
    categoryList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryButton: {
      borderColor: '#cbd5e1',
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    categoryButtonActive: {
      backgroundColor: '#2563eb',
      borderColor: '#2563eb',
    },
    categoryText: {
      color: '#334155',
    },
    categoryTextActive: {
      color: '#fff',
      fontWeight: '700',
    },
});