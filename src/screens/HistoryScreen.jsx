import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from '../services/transactionService';

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

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Other');
  const [type, setType] = useState('expense');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadTransactions = useCallback(async () => {
    setTransactions(await getTransactions());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  function openEditor(item) {
    setEditing(item);
    setAmount(String(item.amount));
    setNote(item.note === 'No description' ? '' : item.note);
    setCategory(item.category || 'Other');
    setType(item.type);
  }

  function closeEditor() {
    setEditing(null);
  }

  async function saveEdit() {
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than zero.');
      return;
    }

    try {
      await updateTransaction(editing.id, {
        amount: parsedAmount,
        note: note.trim() || 'No description',
        category,
        type,
      });

      closeEditor();
      loadTransactions();
    } catch {
      Alert.alert('Save failed', 'Could not update this transaction.');
    }
  }

  function confirmDelete(id) {
    Alert.alert('Delete transaction?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(id);
          loadTransactions();
        },
      },
    ]);
  }

  const filteredTransactions = transactions.filter(item => {
  const searchText = search.trim().toLowerCase();
  const matchesSearch =
    !searchText ||
    item.note.toLowerCase().includes(searchText) ||
    (item.category || 'Other').toLowerCase().includes(searchText);

  const matchesType = typeFilter === 'all' || item.type === typeFilter;
  const matchesCategory =
    categoryFilter === 'all' || (item.category || 'Other') === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>History</Text>
      <Text style={styles.hint}>Search, filter, or tap a transaction to edit it.</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search description or category"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterRow}>
        {[
          { label: 'All', value: 'all' },
          { label: 'Income', value: 'income' },
          { label: 'Expense', value: 'expense' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              typeFilter === filter.value && styles.filterButtonActive,
            ]}
            onPress={() => setTypeFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterText,
                typeFilter === filter.value && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryFilters}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            categoryFilter === 'all' && styles.categoryActive,
          ]}
          onPress={() => setCategoryFilter('all')}
        >
          <Text
            style={[
              styles.categoryText,
              categoryFilter === 'all' && styles.categoryTextActive,
            ]}
          >
            All categories
          </Text>
        </TouchableOpacity>

        {CATEGORIES.map(item => (
          <TouchableOpacity
            key={item}
            style={[
              styles.categoryButton,
              categoryFilter === item && styles.categoryActive,
            ]}
            onPress={() => setCategoryFilter(item)}
          >
            <Text
              style={[
                styles.categoryText,
                categoryFilter === item && styles.categoryTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredTransactions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
        <Text style={styles.empty}>
          {transactions.length === 0
            ? 'No transactions yet.'
            : 'No transactions match these filters.'}
        </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity style={styles.itemDetails} onPress={() => openEditor(item)}>
              <Text style={styles.note}>{item.note}</Text>
              <Text style={styles.date}>
                {item.category || 'Other'} · {new Date(item.createdAt).toLocaleString()}
              </Text>
              <Text style={item.type === 'income' ? styles.income : styles.expense}>
                {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => confirmDelete(item.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={Boolean(editing)} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Transaction</Text>

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'expense' && styles.expenseButton]}
                onPress={() => setType('expense')}
              >
                <Text style={styles.typeText}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'income' && styles.incomeButton]}
                onPress={() => setType('income')}
              >
                <Text style={styles.typeText}>Income</Text>
              </TouchableOpacity>
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
              placeholder="Description"
              value={note}
              onChangeText={setNote}
            />

            <View style={styles.categoryList}>
              {CATEGORIES.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.categoryButton,
                    category === item && styles.categoryActive,
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

            <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={closeEditor}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '700' },
  hint: { color: '#64748b', marginBottom: 16, marginTop: 6 },
  list: { gap: 12, paddingBottom: 24 },
  item: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  searchInput: {
  borderColor: '#cbd5e1',
  borderRadius: 8,
  borderWidth: 1,
  marginBottom: 12,
  padding: 13,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    borderColor: '#cbd5e1',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: {
    color: '#334155',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  categoryFilters: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 1,
  },
  categoryScroll: { flexGrow: 0, height: 48, marginBottom: 14 },
  itemDetails: { flex: 1, gap: 5 },
  note: { fontSize: 16, fontWeight: '700' },
  date: { color: '#64748b', fontSize: 12 },
  income: { color: '#16a34a', fontWeight: '700' },
  expense: { color: '#dc2626', fontWeight: '700' },
  delete: { color: '#dc2626', fontWeight: '700', marginLeft: 12 },
  empty: { color: '#64748b', marginTop: 32, textAlign: 'center' },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 14,
    padding: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: '700' },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeButton: {
    alignItems: 'center',
    backgroundColor: '#64748b',
    borderRadius: 8,
    flex: 1,
    padding: 12,
  },
  expenseButton: { backgroundColor: '#dc2626' },
  incomeButton: { backgroundColor: '#16a34a' },
  typeText: { color: '#fff', fontWeight: '700' },
  input: {
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    padding: 13,
  },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryButton: {
    alignSelf: 'center',
    borderColor: '#cbd5e1',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  categoryActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  categoryText: { color: '#334155' },
  categoryTextActive: { color: '#fff', fontWeight: '700' },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    marginTop: 4,
    padding: 15,
  },
  saveText: { color: '#fff', fontWeight: '700' },
  cancelButton: { alignItems: 'center', padding: 10 },
  cancelText: { color: '#64748b', fontWeight: '700' },
});
