import api from "../lib/axios";

export async function getExpenses(tabId: string) {
  const res = await api.get(`/tabs/${tabId}/expenses`);
  return res.data;
}

export async function addExpense(
  tabId: string,
  data: {
    description: string;
    amount: number;
    category: string;
    splitWith: string[];
  },
) {
  const res = await api.post(`/tabs/${tabId}/expenses`, data);
  return res.data;
}

export async function getBalances(tabId: string) {
  const res = await api.get(`/tabs/${tabId}/expenses/balances`);
  return res.data;
}

export async function getSettlements(tabId: string) {
  const res = await api.get(`/tabs/${tabId}/expenses/settle`);
  return res.data;
}

export async function updateExpense(
  tabId: string,
  expenseId: string,
  data: {
    description: string;
    amount: number;
    category: string;
    splitWith: string[];
  },
) {
  const res = await api.put(`/tabs/${tabId}/expenses/${expenseId}`, data);
  return res.data;
}

export async function deleteExpense(tabId: string, expenseId: string) {
  const res = await api.delete(`/tabs/${tabId}/expenses/${expenseId}`);
  return res.data;
}
