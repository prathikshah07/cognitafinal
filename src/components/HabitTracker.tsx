import { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { Habit } from '../types';

interface HabitTrackerProps {
  habits: Habit[];
  onAddHabit: (habit: Omit<Habit, 'id' | 'completions'>) => void;
  onToggleCompletion: (habitId: string, date: string) => void;
  onDeleteHabit: (id: string) => void;
}

export default function HabitTracker({ habits, onAddHabit, onToggleCompletion, onDeleteHabit }: HabitTrackerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onAddHabit({
        name,
        description: description || undefined,
        targetFrequency: frequency,
        color,
        isActive: true
      });
      setName('');
      setDescription('');
      setFrequency('daily');
      setColor('#3b82f6');
      setIsAdding(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const colors = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#ef4444', label: 'Red' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Habits</h2>
            <p className="text-sm text-gray-500">Build better routines</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Habit Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Morning Exercise, Read for 30min"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Additional details"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === c.value ? 'border-gray-900 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Habit
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

      <div className="space-y-4">
        {habits.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No habits yet. Create your first habit!</p>
        ) : (
          habits.filter(h => h.isActive).map((habit) => (
            <div key={habit.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1"
                    style={{ backgroundColor: habit.color }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      Target: {habit.targetFrequency}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteHabit(habit.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                {last7Days.map((date) => {
                  const isCompleted = habit.completions.has(date);
                  const isToday = date === today;
                  return (
                    <button
                      key={date}
                      onClick={() => onToggleCompletion(habit.id, date)}
                      className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                        isCompleted
                          ? 'bg-green-50 border-2 border-green-500'
                          : isToday
                          ? 'bg-gray-100 border-2 border-gray-300'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <span className="text-xs font-medium text-gray-600">
                        {new Date(date).toLocaleDateString('en', { weekday: 'short' })}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(habit.completions.size / 30) * 100}%`,
                      backgroundColor: habit.color
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {habit.completions.size} days
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
