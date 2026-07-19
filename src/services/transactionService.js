import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@finance_app_transactions';

export async function getTransactions() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const transactions = raw ? JSON.parse(raw) : [];

    return transactions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error('Could not load transactions:', error);
    return [];
  }
}

export async function addTransaction(transaction) {
  const transactions = await getTransactions();

  const newTransaction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...transaction,
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([newTransaction, ...transactions]),
  );

  return newTransaction;
}

export async function deleteTransaction(id) {
  const transactions = await getTransactions();
  const updatedTransactions = transactions.filter(item => item.id !== id);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
}

export async function updateTransaction(id, changes) {
  const transactions = await getTransactions();

  const updatedTransactions = transactions.map(transaction =>
    transaction.id === id ? { ...transaction, ...changes } : transaction,
  );

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedTransactions),
  );
}