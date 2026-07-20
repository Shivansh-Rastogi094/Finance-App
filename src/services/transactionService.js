import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@finance_app_transactions';
const STORAGE_VERSION_KEY = '@finance_app_transactions_version';
const CURRENT_STORAGE_VERSION = '1';

function normalizeTransaction(value) {
  if (!value || typeof value !== 'object') return null;

  const amount = Number(value.amount);
  const createdAt = new Date(value.createdAt);

  if (!value.id || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(createdAt.getTime())) {
    return null;
  }

  return {
    id: String(value.id),
    amount,
    note: typeof value.note === 'string' && value.note.trim() ? value.note : 'No description',
    type: value.type === 'income' ? 'income' : 'expense',
    category: typeof value.category === 'string' && value.category.trim() ? value.category : 'Other',
    createdAt: createdAt.toISOString(),
  };
}

async function ensureStorageVersion() {
  const version = await AsyncStorage.getItem(STORAGE_VERSION_KEY);
  if (!version) {
    await AsyncStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
  }
}

async function readTransactions() {
  await ensureStorageVersion();
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw);
  const values = Array.isArray(parsed) ? parsed : parsed?.data;

  if (!Array.isArray(values)) {
    throw new Error('Transaction storage has an unsupported format.');
  }

  return values.map(normalizeTransaction).filter(Boolean);
}

async function writeTransactions(transactions) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  await AsyncStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
}

export async function getTransactions() {
  try {
    const transactions = await readTransactions();
    return [...transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    // Keep the raw value untouched so a future migration can recover it.
    console.error('Could not load transactions:', error);
    return [];
  }
}

export async function addTransaction(transaction) {
  const transactions = await getTransactions();
  const amount = Number(transaction.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Transaction amount must be greater than zero.');
  }

  const newTransaction = normalizeTransaction({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...transaction,
    amount,
    createdAt: new Date().toISOString(),
  });

  await writeTransactions([newTransaction, ...transactions]);
  return newTransaction;
}

export async function deleteTransaction(id) {
  const transactions = await getTransactions();
  await writeTransactions(transactions.filter(item => item.id !== id));
}

export async function updateTransaction(id, changes) {
  const transactions = await getTransactions();
  const updated = transactions.map(transaction =>
    transaction.id === id
      ? normalizeTransaction({ ...transaction, ...changes }) || transaction
      : transaction,
  );

  await writeTransactions(updated);
}
