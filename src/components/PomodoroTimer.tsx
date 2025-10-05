import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

interface PomodoroTimerProps {
  onSessionComplete?: (minutes: number) => void;
}

export default function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  // Use number for browser timer id to avoid NodeJS typing and ensure clearInterval works reliably
  const intervalRef = useRef<number | null>(null);

  const presets = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  };

  useEffect(() => {
    if (isActive) {
      // Always clear any existing interval before setting a new one
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'pomodoro') {
      setCompletedPomodoros((prev) => prev + 1);
      if (onSessionComplete) {
        onSessionComplete(presets.pomodoro);
      }
      setCompletedPomodoros((prev) => {
        const next = prev; // prev already incremented in prior set, so derive using callback for consistency
        const isLongBreak = (next % 4) === 0;
        if (isLongBreak) {
          setMode('longBreak');
          setMinutes(presets.longBreak);
        } else {
          setMode('shortBreak');
          setMinutes(presets.shortBreak);
        }
        return next;
      });
    } else {
      setMode('pomodoro');
      setMinutes(presets.pomodoro);
    }
    setSeconds(0);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(presets[mode]);
    setSeconds(0);
  };

  const switchMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setIsActive(false);
    setMode(newMode);
    setMinutes(presets[newMode]);
    setSeconds(0);
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((presets[mode] * 60 - (minutes * 60 + seconds)) / (presets[mode] * 60)) * 100;

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-100 rounded-lg">
          <Timer className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pomodoro Timer</h2>
          <p className="text-sm text-gray-500">Focus with the Pomodoro Technique</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => switchMode('pomodoro')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
            mode === 'pomodoro'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
            mode === 'shortBreak'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          Short Break
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
            mode === 'longBreak'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          Long Break
        </button>
      </div>

      <div className="relative mb-6">
        <svg className="w-full h-auto" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={mode === 'pomodoro' ? '#dc2626' : mode === 'shortBreak' ? '#16a34a' : '#2563eb'}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {formatTime(minutes, seconds)}
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {mode === 'shortBreak' ? 'Short Break' : mode === 'longBreak' ? 'Long Break' : 'Focus Time'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={toggleTimer}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            mode === 'pomodoro'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : mode === 'shortBreak'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start
            </>
          )}
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Completed Pomodoros</span>
          <div className="flex gap-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < (completedPomodoros % 4)
                    ? 'bg-red-600'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-gray-900">
          {completedPomodoros}
        </div>
      </div>
    </div>
  );
}
