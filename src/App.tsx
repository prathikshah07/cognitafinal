import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, CheckCircle2, DollarSign, Smile, CheckSquare, LogOut, User } from 'lucide-react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import StudyTracker from './components/StudyTracker';
import HabitTracker from './components/HabitTracker';
import FinanceTracker from './components/FinanceTracker';
import MoodTracker from './components/MoodTracker';
import TaskManager from './components/TaskManager';
import { StudySession, Habit, FinanceTransaction, MoodEntry, Task } from './types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

type Tab = 'dashboard' | 'study' | 'habits' | 'finance' | 'mood' | 'tasks';

function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [finances, setFinances] = useState<FinanceTransaction[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;

    await Promise.all([
      loadStudySessions(),
      loadHabits(),
      loadFinances(),
      loadMoodEntries(),
      loadTasks()
    ]);
  };

  const loadStudySessions = async () => {
    const { data } = await supabase
      .from('study_sessions')
      .select('*')
      .order('session_date', { ascending: false });

    if (data) {
      setStudySessions(data.map(s => ({
        id: s.id,
        subject: s.subject,
        durationMinutes: s.duration_minutes,
        notes: s.notes,
        sessionDate: new Date(s.session_date)
      })));
    }
  };

  const loadHabits = async () => {
    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('is_active', true);

    if (habitsError) return;

    if (habitsData && habitsData.length > 0) {
      const habitIds = habitsData.map((h) => h.id);

      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('habit_id,completion_date')
        .in('habit_id', habitIds);

      if (completionsError) {
        // If the completions query fails, still hydrate habits without completions
        setHabits(
          habitsData.map((h) => ({
            id: h.id,
            name: h.name,
            description: h.description,
            targetFrequency: h.target_frequency as 'daily' | 'weekly',
            color: h.color,
            isActive: h.is_active,
            completions: new Set<string>(),
          }))
        );
        return;
      }

      const completionsByHabit = new Map<string, Set<string>>();
      (completionsData || []).forEach((c: { habit_id: string; completion_date: string }) => {
        if (!completionsByHabit.has(c.habit_id)) {
          completionsByHabit.set(c.habit_id, new Set<string>());
        }
        completionsByHabit.get(c.habit_id)!.add(c.completion_date);
      });

      const habitsWithCompletions = habitsData.map((h) => ({
        id: h.id,
        name: h.name,
        description: h.description,
        targetFrequency: h.target_frequency as 'daily' | 'weekly',
        color: h.color,
        isActive: h.is_active,
        completions: completionsByHabit.get(h.id) || new Set<string>(),
      }));

      setHabits(habitsWithCompletions);
    } else {
      setHabits([]);
    }
  };

  const loadFinances = async () => {
    const { data } = await supabase
      .from('finances')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (data) {
      setFinances(data.map(f => ({
        id: f.id,
        type: f.type as 'income' | 'expense',
        amount: parseFloat(f.amount),
        category: f.category,
        description: f.description,
        transactionDate: new Date(f.transaction_date)
      })));
    }
  };

  const loadMoodEntries = async () => {
    const { data } = await supabase
      .from('mood_entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (data) {
      setMoodEntries(data.map(m => ({
        id: m.id,
        moodRating: m.mood_rating,
        energyLevel: m.energy_level,
        stressLevel: m.stress_level,
        notes: m.notes,
        entryDate: m.entry_date
      })));
    }
  };

  const loadTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setTasks(data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.due_date ? new Date(t.due_date) : undefined,
        priority: t.priority as 'low' | 'medium' | 'high',
        status: t.status as 'pending' | 'in_progress' | 'completed',
        estimatedMinutes: t.estimated_minutes,
        completedAt: t.completed_at ? new Date(t.completed_at) : undefined
      })));
    }
  };

  const addStudySession = async (session: Omit<StudySession, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('study_sessions')
      .insert([{
        user_id: user.id,
        subject: session.subject,
        duration_minutes: session.durationMinutes,
        notes: session.notes,
        session_date: session.sessionDate.toISOString()
      }])
      .select()
      .single();

    if (data && !error) {
      setStudySessions([{
        id: data.id,
        subject: data.subject,
        durationMinutes: data.duration_minutes,
        notes: data.notes,
        sessionDate: new Date(data.session_date)
      }, ...studySessions]);
    }
  };

  const deleteStudySession = async (id: string) => {
    await supabase.from('study_sessions').delete().eq('id', id);
    setStudySessions(studySessions.filter(s => s.id !== id));
  };

  const addHabit = async (habit: Omit<Habit, 'id' | 'completions'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('habits')
      .insert([{
        user_id: user.id,
        name: habit.name,
        description: habit.description,
        target_frequency: habit.targetFrequency,
        color: habit.color,
        is_active: habit.isActive
      }])
      .select()
      .single();

    if (data && !error) {
      setHabits([...habits, {
        id: data.id,
        name: data.name,
        description: data.description,
        targetFrequency: data.target_frequency as 'daily' | 'weekly',
        color: data.color,
        isActive: data.is_active,
        completions: new Set()
      }]);
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    if (!user) return;

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    if (habit.completions.has(date)) {
      await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('completion_date', date);
    } else {
      await supabase
        .from('habit_completions')
        .insert([{
          user_id: user.id,
          habit_id: habitId,
          completion_date: date
        }]);
    }

    setHabits(habits.map(h => {
      if (h.id === habitId) {
        const newCompletions = new Set(h.completions);
        if (newCompletions.has(date)) {
          newCompletions.delete(date);
        } else {
          newCompletions.add(date);
        }
        return { ...h, completions: newCompletions };
      }
      return h;
    }));
  };

  const deleteHabit = async (id: string) => {
    await supabase.from('habits').delete().eq('id', id);
    setHabits(habits.filter(h => h.id !== id));
  };

  const addTransaction = async (transaction: Omit<FinanceTransaction, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('finances')
      .insert([{
        user_id: user.id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        transaction_date: transaction.transactionDate.toISOString()
      }])
      .select()
      .single();

    if (data && !error) {
      setFinances([{
        id: data.id,
        type: data.type as 'income' | 'expense',
        amount: parseFloat(data.amount),
        category: data.category,
        description: data.description,
        transactionDate: new Date(data.transaction_date)
      }, ...finances]);
    }
  };

  const deleteTransaction = async (id: string) => {
    await supabase.from('finances').delete().eq('id', id);
    setFinances(finances.filter(f => f.id !== id));
  };

  const addMoodEntry = async (entry: Omit<MoodEntry, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('mood_entries')
      .upsert([{
        user_id: user.id,
        mood_rating: entry.moodRating,
        energy_level: entry.energyLevel,
        stress_level: entry.stressLevel,
        notes: entry.notes,
        entry_date: entry.entryDate
      }], { onConflict: 'user_id,entry_date' })
      .select()
      .single();

    if (data && !error) {
      const newEntry = {
        id: data.id,
        moodRating: data.mood_rating,
        energyLevel: data.energy_level,
        stressLevel: data.stress_level,
        notes: data.notes,
        entryDate: data.entry_date
      };

      const existingIndex = moodEntries.findIndex(e => e.entryDate === entry.entryDate);
      if (existingIndex >= 0) {
        const updated = [...moodEntries];
        updated[existingIndex] = newEntry;
        setMoodEntries(updated);
      } else {
        setMoodEntries([newEntry, ...moodEntries]);
      }
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'completedAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        user_id: user.id,
        title: task.title,
        description: task.description,
        due_date: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        estimated_minutes: task.estimatedMinutes
      }])
      .select()
      .single();

    if (data && !error) {
      setTasks([...tasks, {
        id: data.id,
        title: data.title,
        description: data.description,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        priority: data.priority as 'low' | 'medium' | 'high',
        status: data.status as 'pending' | 'in_progress' | 'completed',
        estimatedMinutes: data.estimated_minutes,
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined
      }]);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate?.toISOString();
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.estimatedMinutes !== undefined) dbUpdates.estimated_minutes = updates.estimatedMinutes;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt?.toISOString();

    await supabase.from('tasks').update(dbUpdates).eq('id', id);
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setStudySessions([]);
    setHabits([]);
    setFinances([]);
    setMoodEntries([]);
    setTasks([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const tabs = [
    { id: 'dashboard' as Tab, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'study' as Tab, name: 'Study', icon: BookOpen },
    { id: 'habits' as Tab, name: 'Habits', icon: CheckCircle2 },
    { id: 'finance' as Tab, name: 'Finance', icon: DollarSign },
    { id: 'mood' as Tab, name: 'Mood', icon: Smile },
    { id: 'tasks' as Tab, name: 'Tasks', icon: CheckSquare }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Cognita</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="sm:hidden flex gap-1 pb-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            studySessions={studySessions}
            habits={habits}
            finances={finances}
            moodEntries={moodEntries}
            tasks={tasks}
          />
        )}
        {activeTab === 'study' && (
          <StudyTracker
            sessions={studySessions}
            onAddSession={addStudySession}
            onDeleteSession={deleteStudySession}
          />
        )}
        {activeTab === 'habits' && (
          <HabitTracker
            habits={habits}
            onAddHabit={addHabit}
            onToggleCompletion={toggleHabitCompletion}
            onDeleteHabit={deleteHabit}
          />
        )}
        {activeTab === 'finance' && (
          <FinanceTracker
            transactions={finances}
            onAddTransaction={addTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        )}
        {activeTab === 'mood' && (
          <MoodTracker
            entries={moodEntries}
            onAddEntry={addMoodEntry}
          />
        )}
        {activeTab === 'tasks' && (
          <TaskManager
            tasks={tasks}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        )}
      </main>
    </div>
  );
}

export default App;
