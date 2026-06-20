export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Tab {
  id: string;
  name: string;
  roomCode: string;
  createdBy: string;
  createdAt: string;
}

export interface TabMember {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  id: string;
  tabId: string;
  paidBy: string;
  paidByUser: { id: string; name: string };
  description: string;
  amount: string;
  category: string;
  createdAt: string;
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: string;
}

export interface Balance {
  id: string;
  name: string;
  balance: number;
}
