import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity,
  Modal,
  TextInput, } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions } from '../services/transactionService';
import { getBudget, saveBudget } from '../services/budgetService';

export default function DashboardScreen() {
  const [transactions, setTransactions] = useState([]);

const [budget, setBudget] = useState(0);
const [budgetModalVisible, setBudgetModalVisible] = useState(false);
const [budgetInput, setBudgetInput] = useState('');
const [remainingBudget, setRemainingBudget] = useState(0);

  useFocusEffect(
  useCallback(() => {
    loadDashboard();
  }, []),
);

async function loadDashboard() {
  const data = await getTransactions();
  setTransactions(data);

  const savedBudget = await getBudget();
  console.log('Saved Budget:', savedBudget);
  setBudget(savedBudget.amount);

  const totalExpense = data
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  setRemainingBudget(savedBudget.amount  - totalExpense);
}

async function saveMonthlyBudget() {
  const value = Number(budgetInput);

  if (isNaN(value) || value < 0) return;

 const saved = await saveBudget(value);

setBudget(saved.amount);

  const totalExpense = transactions
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  setRemainingBudget(saved.amount - totalExpense);

  setBudgetInput('');
  setBudgetModalVisible(false);
}

  const income = transactions
    .filter(item => item.type === 'income')
    .reduce((total, item) => total + item.amount, 0);
  const expense = transactions
    .filter(item => item.type === 'expense')
    .reduce((total, item) => total + item.amount, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthlyExpenses = transactions.filter(
    item => item.type === 'expense' && new Date(item.createdAt) >= monthStart,
  );
  const monthExpense = monthlyExpenses.reduce((total, item) => total + item.amount, 0);

  const topCategories = Object.entries(
    monthlyExpenses
      .reduce((totals, item) => {
        const category = item.category || 'Other';
        totals[category] = (totals[category] || 0) + item.amount;
        return totals;
      }, {}),
  )
    .sort(([, left], [, right]) => right - left)
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>PERSONAL FINANCE</Text>
        <Text style={styles.title}>Overview</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current balance</Text>
          <Text style={styles.balance}>${(income - expense).toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.label}>Income</Text>
            <Text style={styles.income}>+${income.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.label}>Expenses</Text>
            <Text style={styles.expense}>-${expense.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.budgetCard}>

  <View style={styles.budgetHeader}>

    <Text style={styles.sectionTitle}>
      Monthly Budget
    </Text>

    <TouchableOpacity
      onPress={() => {
        setBudgetInput(budget.toString());
        setBudgetModalVisible(true);
      }}>

      <Text style={styles.editBudget}>
        {budget > 0 ? 'Edit' : 'Set'}
      </Text>

    </TouchableOpacity>

  </View>

  <Text style={styles.budgetAmount}>
    Budget: ${Number(budget).toFixed(2)}
  </Text>

  <Text style={styles.spentAmount}>
    Spent: ${Number(expense).toFixed(2)}
  </Text>

  <Text
    style={[
      styles.remainingAmount,
      {
        color:
          remainingBudget >= 0
            ? '#16a34a'
            : '#dc2626',
      },
    ]}>

    Remaining: ${ (remainingBudget>0) ?  Number(remainingBudget).toFixed(2): 0}

  </Text>

  {budget > 0 && (

    <>

      <View style={styles.progressTrack}>

        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(
                (expense / budget) * 100,
                100,
              )}%`,
              backgroundColor:
                expense >= budget
                  ? '#dc2626'
                  : expense >= budget * 0.75
                  ? '#f59e0b'
                  : '#2563eb',
            },
          ]}
        />

      </View>

      <Text style={styles.progressText}>
        {Math.min(
          (expense / budget) * 100,
          100,
        ).toFixed(0)}
        % Used
      </Text>

    </>

  )}

</View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>This month</Text>
            <Text style={styles.sectionHint}>Top spending categories</Text>
          </View>
          <Text style={styles.monthlyExpense}>-${monthExpense.toFixed(2)}</Text>
        </View>

        <View style={styles.categoryCard}>
          {topCategories.length ? (
            topCategories.map(([category, total], index) => (
              <View key={category} style={styles.categoryRow}>
                <View style={styles.categoryNameRow}>
                  <View style={[styles.categoryDot, { opacity: 1 - index * 0.2 }]} />
                  <Text style={styles.categoryName}>{category}</Text>
                </View>
                <Text style={styles.categoryAmount}>${total.toFixed(2)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>Add an expense to see your monthly breakdown.</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Recent transactions</Text>

        {transactions.slice(0, 5).map(item => (
          <View key={item.id} style={styles.item}>
            <View>
              <Text style={styles.itemNote}>{item.note}</Text>
              <Text style={styles.date}>
                {item.category || 'Other'} {'\u2022'} {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={item.type === 'income' ? styles.income : styles.expense}>
              {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
            </Text>
          </View>
        ))}

        {!transactions.length && (
          <Text style={styles.empty}>No transactions yet. Add your first one.</Text>
        )}
      </ScrollView>
      <Modal
  visible={budgetModalVisible}
  transparent
  animationType="slide">

  <View style={styles.modalOverlay}>

    <View style={styles.modalContainer}>

      <Text style={styles.modalTitle}>
        Monthly Budget
      </Text>

      <TextInput
        style={styles.modalInput}
        keyboardType="decimal-pad"
        placeholder="Enter Budget"
        value={budgetInput}
        onChangeText={setBudgetInput}
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveMonthlyBudget}>

        <Text style={styles.saveButtonText}>
          Save
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          setBudgetModalVisible(false)
        }>

        <Text style={styles.cancelButton}>
          Cancel
        </Text>

      </TouchableOpacity>

    </View>

  </View>

</Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { gap: 16, padding: 24, paddingBottom: 32 },
  eyebrow: { color: '#2563eb', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#0f172a', fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  balanceCard: { backgroundColor: '#1d4ed8', borderRadius: 20, padding: 22 },
  balanceLabel: { color: '#bfdbfe', fontSize: 14, fontWeight: '600' },
  balance: { color: '#fff', fontSize: 34, fontWeight: '800', marginTop: 8 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 16, flex: 1, gap: 8, padding: 16 },
  label: { color: '#64748b', fontSize: 14 },
  income: { color: '#16a34a', fontSize: 17, fontWeight: '800' },
  expense: { color: '#dc2626', fontSize: 17, fontWeight: '800' },
  sectionHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: '#0f172a', fontSize: 18, fontWeight: '800', marginTop: 8 },
  sectionHint: { color: '#64748b', fontSize: 13, marginTop: 3 },
  monthlyExpense: { color: '#dc2626', fontSize: 16, fontWeight: '800' },
  categoryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  categoryRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  categoryNameRow: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  categoryDot: { backgroundColor: '#2563eb', borderRadius: 4, height: 8, width: 8 },
  categoryName: { color: '#334155', fontSize: 15, fontWeight: '600' },
  categoryAmount: { color: '#0f172a', fontSize: 15, fontWeight: '800' },
  item: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  itemNote: { color: '#0f172a', fontSize: 16, fontWeight: '700' },
  date: { color: '#64748b', marginTop: 4 },
  empty: { color: '#64748b', lineHeight: 20, textAlign: 'center' },
  budgetCard: {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 16,
  marginTop: 4,
},

budgetHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},

editBudget: {
  color: '#2563eb',
  fontWeight: '700',
  fontSize: 15,
},

budgetAmount: {
  fontSize: 17,
  fontWeight: '700',
  color: '#0f172a',
  marginBottom: 6,
},

spentAmount: {
  fontSize: 15,
  color: '#dc2626',
  marginBottom: 4,
},

remainingAmount: {
  fontSize: 15,
  fontWeight: '700',
  marginBottom: 14,
},

progressTrack: {
  height: 10,
  backgroundColor: '#e2e8f0',
  borderRadius: 10,
  overflow: 'hidden',
},

progressFill: {
  height: '100%',
  borderRadius: 10,
},

progressText: {
  textAlign: 'right',
  marginTop: 8,
  color: '#64748b',
  fontWeight: '600',
},

modalOverlay: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0,0,0,0.45)',
},

modalContainer: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 24,
},

modalTitle: {
  fontSize: 22,
  fontWeight: '700',
  marginBottom: 18,
  color: '#0f172a',
},

modalInput: {
  borderWidth: 1,
  borderColor: '#cbd5e1',
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 16,
  marginBottom: 18,
},

saveButton: {
  backgroundColor: '#2563eb',
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center',
},

saveButtonText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 16,
},

cancelButton: {
  textAlign: 'center',
  marginTop: 16,
  color: '#64748b',
  fontWeight: '700',
},
});
