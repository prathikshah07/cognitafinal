import { BookOpen, CheckCircle2, DollarSign, Smile, CheckSquare, TrendingUp, PieChart } from 'lucide-react';
import { StudySession, Habit, FinanceTransaction, MoodEntry, Task } from '../types';

interface DashboardProps {
  studySessions: StudySession[];
  habits: Habit[];
  finances: FinanceTransaction[];
  moodEntries: MoodEntry[];
  tasks: Task[];
}

export default function Dashboard({ studySessions, habits, finances, moodEntries, tasks }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];

  const todayStudyMinutes = studySessions
    .filter(s => new Date(s.sessionDate).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const activeHabits = habits.filter(h => h.isActive).length;
  const todayHabitCompletions = habits.filter(h => h.isActive && h.completions.has(today)).length;
  const habitCompletionRate = activeHabits > 0 ? Math.round((todayHabitCompletions / activeHabits) * 100) : 0;

  const balance = finances.reduce((sum, t) =>
    sum + (t.type === 'income' ? t.amount : -t.amount), 0
  );

  const todayMood = moodEntries.find(e => e.entryDate === today);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const upcomingTasks = tasks.filter(t => {
    if (t.status === 'completed' || !t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

  const last7DaysStudy = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStudy = studySessions
      .filter(s => new Date(s.sessionDate).toDateString() === date.toDateString())
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      minutes: dayStudy
    };
  });

  const maxStudyMinutes = Math.max(...last7DaysStudy.map(d => d.minutes), 1);

  const weekExpenses = finances
    .filter(t => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return t.type === 'expense' && new Date(t.transactionDate) >= weekAgo;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const last7DaysMood = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const entry = moodEntries.find(e => e.entryDate === dateStr);
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      mood: entry?.moodRating || 0,
      energy: entry?.energyLevel || 0,
      stress: entry?.stressLevel || 0
    };
  });

  const expensesByCategory = finances
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topExpenseCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalExpenses = topExpenseCategories.reduce((sum, [, amount]) => sum + amount, 0);

  const subjectStudyTime = studySessions.reduce((acc, s) => {
    acc[s.subject] = (acc[s.subject] || 0) + s.durationMinutes;
    return acc;
  }, {} as Record<string, number>);

  const topSubjects = Object.entries(subjectStudyTime)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const categoryColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-blue-100">Here's your progress overview for today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">Study Time Today</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {Math.floor(todayStudyMinutes / 60)}h {todayStudyMinutes % 60}m
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {studySessions.length} total sessions
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Habits Today</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{habitCompletionRate}%</p>
              <p className="text-sm text-gray-500 mt-1">
                {todayHabitCompletions} of {activeHabits} completed
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-emerald-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Balance</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">${balance.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">
                ${weekExpenses.toFixed(2)} spent this week
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <Smile className="w-5 h-5" />
                <span className="text-sm font-medium">Today's Mood</span>
              </div>
              {todayMood ? (
                <>
                  <p className="text-3xl font-bold text-gray-900">{todayMood.moodRating}/5</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Energy: {todayMood.energyLevel}/5, Stress: {todayMood.stressLevel}/5
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-medium text-gray-400">Not logged</p>
                  <p className="text-sm text-gray-500 mt-1">Log your mood today</p>
                </>
              )}
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Smile className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-violet-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-violet-600 mb-2">
                <CheckSquare className="w-5 h-5" />
                <span className="text-sm font-medium">Task Progress</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{taskCompletionRate}%</p>
              <p className="text-sm text-gray-500 mt-1">
                {completedTasks} of {totalTasks} completed
              </p>
            </div>
            <div className="p-3 bg-violet-50 rounded-lg">
              <CheckSquare className="w-6 h-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-orange-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Upcoming Tasks</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{upcomingTasks.length}</p>
              <p className="text-sm text-gray-500 mt-1">
                Due in the next 3 days
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Activity (Last 7 Days)</h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {last7DaysStudy.map((day) => {
              const height = (day.minutes / maxStudyMinutes) * 100;
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-t-lg flex items-end justify-center" style={{ height: '100%' }}>
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all flex items-end justify-center pb-2"
                      style={{ height: `${height}%`, minHeight: day.minutes > 0 ? '20%' : '0%' }}
                    >
                      {day.minutes > 0 && (
                        <span className="text-xs font-medium text-white">
                          {day.minutes}m
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trends (Last 7 Days)</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Mood</span>
                <span className="text-sm text-gray-500">😊</span>
              </div>
              <div className="flex gap-1 h-12 items-end">
                {last7DaysMood.map((day) => (
                  <div key={`mood-${day.day}`} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t transition-all"
                      style={{ height: `${(day.mood / 5) * 100}%`, minHeight: day.mood > 0 ? '10%' : '2%' }}
                    />
                    <span className="text-xs text-gray-500">{day.day[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Energy</span>
                <span className="text-sm text-gray-500">⚡</span>
              </div>
              <div className="flex gap-1 h-12 items-end">
                {last7DaysMood.map((day) => (
                  <div key={`energy-${day.day}`} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-green-400 to-green-300 rounded-t transition-all"
                      style={{ height: `${(day.energy / 5) * 100}%`, minHeight: day.energy > 0 ? '10%' : '2%' }}
                    />
                    <span className="text-xs text-gray-500">{day.day[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Stress</span>
                <span className="text-sm text-gray-500">😰</span>
              </div>
              <div className="flex gap-1 h-12 items-end">
                {last7DaysMood.map((day) => (
                  <div key={`stress-${day.day}`} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-red-400 to-red-300 rounded-t transition-all"
                      style={{ height: `${(day.stress / 5) * 100}%`, minHeight: day.stress > 0 ? '10%' : '2%' }}
                    />
                    <span className="text-xs text-gray-500">{day.day[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
          </div>
          {topExpenseCategories.length > 0 ? (
            <div className="space-y-3">
              {topExpenseCategories.map(([category, amount], index) => {
                const percentage = (amount / totalExpenses) * 100;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className="text-sm text-gray-600">${amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: categoryColors[index % categoryColors.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No expense data yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Study Time by Subject</h3>
          </div>
          {topSubjects.length > 0 ? (
            <div className="space-y-3">
              {topSubjects.map(([subject, minutes], index) => {
                const maxMinutes = Math.max(...topSubjects.map(([, m]) => m));
                const percentage = (minutes / maxMinutes) * 100;
                return (
                  <div key={subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{subject}</span>
                      <span className="text-sm text-gray-600">
                        {Math.floor(minutes / 60)}h {minutes % 60}m
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: categoryColors[index % categoryColors.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No study data yet</p>
          )}
        </div>
      </div>

      {upcomingTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-2">
            {upcomingTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-600">
                    Due {new Date(task.dueDate!).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-orange-200 text-orange-700 rounded capitalize">
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
