import { useState } from 'react';
import { CheckSquare, Plus, Clock, AlertCircle, Trash2, Circle, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'completedAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskManager({ tasks, onAddTask, onUpdateTask, onDeleteTask }: TaskManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title) {
      onAddTask({
        title,
        description: description || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        status: 'pending',
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setEstimatedMinutes('');
      setIsAdding(false);
    }
  };

  const toggleTaskStatus = (task: Task) => {
    if (task.status === 'completed') {
      onUpdateTask(task.id, { status: 'pending', completedAt: undefined });
    } else {
      onUpdateTask(task.id, { status: 'completed', completedAt: new Date() });
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const upcomingTasks = pendingTasks.filter(t => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700 border-gray-300',
    medium: 'bg-blue-100 text-blue-700 border-blue-300',
    high: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-50 rounded-lg">
            <CheckSquare className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
            <p className="text-sm text-gray-500">Manage your time effectively</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-violet-600 mb-1">
            <Circle className="w-4 h-4" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Upcoming</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{upcomingTasks.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="e.g., Complete math assignment"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Additional details"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date (optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Time (min)
                </label>
                <input
                  type="number"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="e.g., 60"
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-lg font-medium capitalize transition-all ${
                      priority === p
                        ? priorityColors[p]
                        : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Create Task
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
        {pendingTasks.length === 0 && completedTasks.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No tasks yet. Add your first task!</p>
        ) : (
          <>
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Pending Tasks</h3>
                <div className="space-y-2">
                  {pendingTasks.map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <button
                          onClick={() => toggleTaskStatus(task)}
                          className="mt-1 p-0.5 text-gray-400 hover:text-violet-600 transition-colors"
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded capitalize border ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            {task.dueDate && (
                              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                                <Clock className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                                {isOverdue && ' (Overdue)'}
                              </span>
                            )}
                            {task.estimatedMinutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.estimatedMinutes} min
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Completed Tasks</h3>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 bg-green-50 rounded-lg opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className="mt-1 p-0.5 text-green-600 hover:text-gray-400 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-700 line-through">{task.title}</h3>
                        {task.completedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Completed {new Date(task.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
