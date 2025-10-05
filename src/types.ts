export interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  notes?: string;
  sessionDate: Date;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  targetFrequency: 'daily' | 'weekly';
  color: string;
  isActive: boolean;
  completions: Set<string>;
}

export interface FinanceTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  transactionDate: Date;
}

export interface MoodEntry {
  id: string;
  moodRating: number;
  energyLevel: number;
  stressLevel: number;
  notes?: string;
  entryDate: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  estimatedMinutes?: number;
  completedAt?: Date;
}
