import { useState } from 'react';
import { Clock, Plus, BookOpen, Trash2 } from 'lucide-react';
import { StudySession } from '../types';
import PomodoroTimer from './PomodoroTimer';

interface StudyTrackerProps {
  sessions: StudySession[];
  onAddSession: (session: Omit<StudySession, 'id'>) => void;
  onDeleteSession: (id: string) => void;
}

export default function StudyTracker({ sessions, onAddSession, onDeleteSession }: StudyTrackerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && duration) {
      onAddSession({
        subject,
        durationMinutes: parseInt(duration),
        notes: notes || undefined,
        sessionDate: new Date()
      });
      setSubject('');
      setDuration('');
      setNotes('');
      setIsAdding(false);
    }
  };

  const handlePomodoroComplete = (minutes: number) => {
    if (subject) {
      onAddSession({
        subject,
        durationMinutes: minutes,
        notes: 'Completed via Pomodoro timer',
        sessionDate: new Date()
      });
    }
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const todaySessions = sessions.filter(s => {
    const today = new Date();
    const sessionDate = new Date(s.sessionDate);
    return sessionDate.toDateString() === today.toDateString();
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PomodoroTimer onSessionComplete={handlePomodoroComplete} />

        <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Study Time</h2>
            <p className="text-sm text-gray-500">Track your study sessions</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Session
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Total Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalHours}h {remainingMinutes}m
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-sm font-medium text-green-600 mb-1">Today</div>
          <p className="text-2xl font-bold text-gray-900">{todaySessions.length} sessions</p>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Mathematics, History"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 60"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What did you study?"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Session
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
        {sessions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No study sessions yet. Add your first session!</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{session.subject}</h3>
                  <span className="text-sm text-gray-500">
                    {session.durationMinutes} min
                  </span>
                </div>
                {session.notes && (
                  <p className="text-sm text-gray-600 mt-1">{session.notes}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(session.sessionDate).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => onDeleteSession(session.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No study sessions yet. Add your first session or use the Pomodoro timer!</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{session.subject}</h3>
                    <span className="text-sm text-gray-500">
                      {session.durationMinutes} min
                    </span>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-gray-600 mt-1">{session.notes}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(session.sessionDate).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
