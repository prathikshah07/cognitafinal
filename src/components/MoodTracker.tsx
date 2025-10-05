import { useState } from 'react';
import { Smile, Plus, TrendingUp } from 'lucide-react';
import { MoodEntry } from '../types';

interface MoodTrackerProps {
  entries: MoodEntry[];
  onAddEntry: (entry: Omit<MoodEntry, 'id'>) => void;
}

export default function MoodTracker({ entries, onAddEntry }: MoodTrackerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [moodRating, setMoodRating] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [notes, setNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.entryDate === today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEntry({
      moodRating,
      energyLevel,
      stressLevel,
      notes: notes || undefined,
      entryDate: today
    });
    setMoodRating(3);
    setEnergyLevel(3);
    setStressLevel(3);
    setNotes('');
    setIsAdding(false);
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];
  const energyEmojis = ['🔋', '🔋', '🔋', '⚡', '⚡'];
  const stressEmojis = ['😌', '😌', '😐', '😰', '😫'];

  const avgMood = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.moodRating, 0) / entries.length).toFixed(1)
    : '0';

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Smile className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mood Tracker</h2>
            <p className="text-sm text-gray-500">Track your daily wellbeing</p>
          </div>
        </div>
        {!todayEntry && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Today
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Smile className="w-4 h-4" />
            <span className="text-sm font-medium">Average Mood</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgMood}/5</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Entries</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How do you feel today?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMoodRating(value)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all text-2xl ${
                      moodRating === value
                        ? 'border-yellow-500 bg-yellow-50 scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {moodEmojis[value - 1]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Energy Level
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl">{energyEmojis[energyLevel - 1]}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stress Level
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl">{stressEmojis[stressLevel - 1]}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="How was your day?"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Save Entry
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

      {todayEntry && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Today's Entry</h3>
            <span className="text-3xl">{moodEmojis[todayEntry.moodRating - 1]}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Mood:</span>
              <span className="ml-1 font-medium">{todayEntry.moodRating}/5</span>
            </div>
            <div>
              <span className="text-gray-600">Energy:</span>
              <span className="ml-1 font-medium">{todayEntry.energyLevel}/5</span>
            </div>
            <div>
              <span className="text-gray-600">Stress:</span>
              <span className="ml-1 font-medium">{todayEntry.stressLevel}/5</span>
            </div>
          </div>
          {todayEntry.notes && (
            <p className="text-sm text-gray-700 mt-2">{todayEntry.notes}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Last 7 Days</h3>
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((date) => {
            const entry = entries.find(e => e.entryDate === date);
            const dayName = new Date(date).toLocaleDateString('en', { weekday: 'short' });
            return (
              <div
                key={date}
                className={`p-3 rounded-lg text-center ${
                  entry
                    ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="text-xs font-medium text-gray-600 mb-1">{dayName}</div>
                {entry ? (
                  <div className="text-2xl">{moodEmojis[entry.moodRating - 1]}</div>
                ) : (
                  <div className="text-2xl text-gray-300">-</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
