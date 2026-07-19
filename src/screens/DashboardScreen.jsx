import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions } from '../services/transactionService';

export default function DashboardScreen() {
  const [transactions, setTransactions] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getTransactions().then(setTransactions);
    }, []),
  );

  const income = transactions
    .filter(item => item.type === 'income')
    .reduce((total, item) => total + item.amount, 0);
  const expense = transactions
    .filter(item => item.type === 'expense')
    .reduce((total, item) => total + item.amount, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const topCategories = Object.entries(
    transactions
      .filter(item => item.type === 'expense' && new Date(item.createdAt) >= monthStart)
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

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>This month</Text>
            <Text style={styles.sectionHint}>Top spending categories</Text>
          </View>
          <Text style={styles.monthlyExpense}>-${expense.toFixed(2)}</Text>
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
});
