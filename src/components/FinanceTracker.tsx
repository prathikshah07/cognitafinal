import { useState } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { FinanceTransaction } from '../types';

interface FinanceTrackerProps {
  transactions: FinanceTransaction[];
  onAddTransaction: (transaction: Omit<FinanceTransaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function FinanceTracker({ transactions, onAddTransaction, onDeleteTransaction }: FinanceTrackerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && category && description) {
      onAddTransaction({
        type,
        amount: parseFloat(amount),
        category,
        description,
        transactionDate: new Date()
      });
      setAmount('');
      setCategory('');
      setDescription('');
      setIsAdding(false);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const expenseCategories = ['Food', 'Transport', 'Books', 'Tuition', 'Housing', 'Entertainment', 'Other'];
  const incomeCategories = ['Allowance', 'Part-time Job', 'Scholarship', 'Gift', 'Other'];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Finances</h2>
            <p className="text-sm text-gray-500">Track income and expenses</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Income</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">Expenses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-50 to-blue-100' : 'from-orange-50 to-orange-100'} rounded-lg p-4`}>
          <div className={`text-sm font-medium ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'} mb-1`}>
            Balance
          </div>
          <p className="text-2xl font-bold text-gray-900">${balance.toFixed(2)}</p>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  type === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700'
                }`}
              >
                Income
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {(type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Lunch at cafeteria"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add Transaction
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No transactions yet. Add your first transaction!</p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className={`w-4 h-4 text-emerald-600`} />
                  ) : (
                    <TrendingDown className={`w-4 h-4 text-red-600`} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {transaction.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(transaction.transactionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-lg font-semibold ${
                  transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => onDeleteTransaction(transaction.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
