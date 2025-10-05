import { useState, useEffect } from 'react'
import { User, LogOut, Brain, BarChart3, Zap } from 'lucide-react'
import { supabaseClient as supabase } from '../lib/supabaseClient'
import { StudySession, FinanceTransaction, MoodEntry, Habit, Task } from '../types'
import CognitaAI from './CognitaAI'
import CognitaAnalytics from './CognitaAnalytics'
import StudyTracker from './StudyTracker'
import FinanceTracker from './FinanceTracker'
import MoodTracker from './MoodTracker'
import HabitTracker from './HabitTracker'
import TaskManager from './TaskManager'

interface DashboardProps {
  user: any
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('ai')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  const loadUserProfile = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      } else {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Profile load error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleAddStudySession = (session: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString() // Simple ID generation for now
    }
    setStudySessions(prev => [...prev, newSession])
  }

  const handleDeleteStudySession = (id: string) => {
    setStudySessions(prev => prev.filter(session => session.id !== id))
  }

  const handleAddTransaction = (transaction: Omit<FinanceTransaction, 'id'>) => {
    const newTransaction: FinanceTransaction = {
      ...transaction,
      id: Date.now().toString() // Simple ID generation for now
    }
    setTransactions(prev => [...prev, newTransaction])
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id))
  }

  const handleAddMoodEntry = (entry: Omit<MoodEntry, 'id'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString()
    }
    setMoodEntries(prev => [...prev, newEntry])
  }

  const handleAddHabit = (habit: Omit<Habit, 'id' | 'completions'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      completions: new Set()
    }
    setHabits(prev => [...prev, newHabit])
  }

  const handleToggleHabitCompletion = (habitId: string, date: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const newCompletions = new Set(habit.completions)
        if (newCompletions.has(date)) {
          newCompletions.delete(date)
        } else {
          newCompletions.add(date)
        }
        return { ...habit, completions: newCompletions }
      }
      return habit
    }))
  }

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id))
  }

  const handleAddTask = (task: Omit<Task, 'id' | 'completedAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString()
    }
    setTasks(prev => [...prev, newTask])
  }

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ))
  }

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }

  useEffect(() => {
    loadUserProfile()
  }, [user.id])

  const tabs = [
    { id: 'ai', label: 'Cognita AI', icon: Brain, color: 'text-purple-400' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-cyan-400' },
    { id: 'study', label: 'Study', icon: Brain, color: 'text-blue-400' },
    { id: 'finance', label: 'Finance', icon: Brain, color: 'text-green-400' },
    { id: 'mood', label: 'Mood', icon: Brain, color: 'text-pink-400' },
    { id: 'habits', label: 'Habits', icon: Brain, color: 'text-indigo-400' },
    { id: 'tasks', label: 'Tasks', icon: Brain, color: 'text-orange-400' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="cyber-spinner mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="cyber-glass border-b border-cyan-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 cyber-glass rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-cyber font-bold neon-text">COGNITA</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-cyber text-cyan-300">
                  {userProfile?.display_name || user.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-gray-500 font-mono">Neural Interface Active</div>
              </div>
              <div className="w-8 h-8 cyber-glass rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={handleSignOut}
                className="cyber-button-secondary px-3 py-1 text-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="cyber-glass border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-cyber text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? `cyber-button ${tab.color} border-current`
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {activeTab === 'ai' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-cyber font-bold neon-text mb-4">
                  Welcome to Cognita AI
                </h2>
                <p className="text-gray-400 font-mono max-w-2xl mx-auto leading-relaxed">
                  Your intelligent academic companion analyzes five essential domains of student life: 
                  study patterns, financial habits, emotional wellbeing, daily routines, and time management. 
                  Submit your daily experiences below for personalized insights and strategic guidance.
                </p>
              </div>
              <CognitaAI userId={user.id} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-cyber font-bold neon-text mb-4">
                  Performance Analytics
                </h2>
                <p className="text-gray-400 font-mono max-w-2xl mx-auto">
                  Cognita's comprehensive analysis of your academic and personal growth across all life domains.
                </p>
              </div>
              <CognitaAnalytics userId={user.id} />
            </div>
          )}

          {activeTab === 'study' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-cyber font-bold text-blue-400 mb-4">
                  Study Tracker
                </h2>
                <p className="text-gray-400 font-mono">
                  Monitor your learning sessions, subjects, and academic progress.
                </p>
              </div>
              <StudyTracker 
                sessions={studySessions}
                onAddSession={handleAddStudySession}
                onDeleteSession={handleDeleteStudySession}
              />
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-cyber font-bold text-green-400 mb-4">
                  Financial Management
                </h2>
                <p className="text-gray-400 font-mono">
                  Track expenses and maintain financial discipline for academic success.
                </p>
              </div>
              <FinanceTracker 
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>
          )}

          {activeTab === 'mood' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-cyber font-bold text-pink-400 mb-4">
                  Mood & Wellbeing
                </h2>
                <p className="text-gray-400 font-mono">
                  Monitor emotional patterns and maintain optimal mental health.
                </p>
              </div>
              <MoodTracker 
                entries={moodEntries}
                onAddEntry={handleAddMoodEntry}
              />
            </div>
          )}

          {activeTab === 'habits' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-cyber font-bold text-indigo-400 mb-4">
                  Habit Formation
                </h2>
                <p className="text-gray-400 font-mono">
                  Build consistent routines that support your academic goals.
                </p>
              </div>
              <HabitTracker 
                habits={habits}
                onAddHabit={handleAddHabit}
                onToggleCompletion={handleToggleHabitCompletion}
                onDeleteHabit={handleDeleteHabit}
              />
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-cyber font-bold text-orange-400 mb-4">
                  Task Management
                </h2>
                <p className="text-gray-400 font-mono">
                  Organize assignments, projects, and academic responsibilities.
                </p>
              </div>
              <TaskManager 
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="cyber-glass border-t border-gray-700/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="font-cyber text-cyan-300 text-sm">COGNITA AI SYSTEM</span>
            </div>
            <p className="text-xs text-gray-500 font-mono">
              Intelligent Academic Companion • Neural Interface v2.0 • Quantum-Safe Encryption
            </p>
          </div>
        </div>
      </footer>

      {/* Floating elements */}
      <div className="fixed bottom-6 right-6">
        <div className="cyber-glass p-3 rounded-full border border-cyan-500/50">
          <Brain className="w-6 h-6 text-cyan-400 animate-cyber-pulse" />
        </div>
      </div>
    </div>
  )
}