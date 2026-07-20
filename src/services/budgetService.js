import AsyncStorage from '@react-native-async-storage/async-storage';

const BUDGET_KEY = '@finance_app_monthly_budget';

export async function getBudget() {
  try {
    const data = await AsyncStorage.getItem(BUDGET_KEY);

    if (!data) {
      return {
        amount: 0,
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
      };
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Could not load budget:', error);

    return {
      amount: 0,
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    };
  }
}

export async function saveBudget(amount) {
  const budget = {
    amount: Number(amount),
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  };

  await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(budget));

  return budget;
}

export async function clearBudget() {
  await AsyncStorage.removeItem(BUDGET_KEY);
}