import { BarChart3, TrendingUp, Brain, Target, Clock, DollarSign, Heart, Zap } from 'lucide-react'

interface CognitaAnalyticsProps {
  userId: string
}

export default function CognitaAnalytics({ userId }: CognitaAnalyticsProps) {
  // TODO: Use userId to fetch user-specific analytics data from database
  console.log('Analytics for user:', userId)
  
  const data = {
    studyHours: 12.5,
    financialHealth: 78,
    moodScore: 7.2,
    habitStreak: 14,
    productivityScore: 85
  }

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    unit = '', 
    description 
  }: {
    title: string
    value: number
    icon: any
    color: string
    unit?: string
    description: string
  }) => (
    <div className="cyber-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full cyber-glass flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cyber font-semibold text-white">{title}</h3>
            <p className="text-xs text-gray-400 font-mono">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {value.toFixed(1)}{unit}
          </div>
          <div className="text-xs text-gray-500 font-mono">7-day avg</div>
        </div>
      </div>
      
      {/* Simple Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color.replace('text-', 'bg-')}`}
          style={{ width: `${Math.min(100, (value / (unit === '%' ? 100 : 24)) * 100)}%` }}
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <BarChart3 className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-cyber font-bold text-cyan-400">Performance Dashboard</h2>
            <p className="text-gray-400 font-mono text-sm">Cognita's analytical overview</p>
          </div>
        </div>
        
        {/* Overall Score */}
        <div className="cyber-glass p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="font-cyber text-purple-300">Overall Performance</span>
            <span className="text-2xl font-bold text-white">{data.productivityScore}/100</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
              style={{ width: `${data.productivityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Study Focus"
          value={data.studyHours}
          icon={Brain}
          color="text-purple-400"
          unit="h"
          description="Weekly study hours"
        />
        
        <MetricCard
          title="Financial Health"
          value={data.financialHealth}
          icon={DollarSign}
          color="text-green-400"
          unit="%"
          description="Spending discipline"
        />
        
        <MetricCard
          title="Mood Stability"
          value={data.moodScore}
          icon={Heart}
          color="text-pink-400"
          unit="/10"
          description="Emotional wellbeing"
        />
        
        <MetricCard
          title="Habit Consistency"
          value={data.habitStreak}
          icon={Target}
          color="text-cyan-400"
          unit=" days"
          description="Active streak"
        />
        
        <MetricCard
          title="Time Efficiency"
          value={data.productivityScore}
          icon={Clock}
          color="text-orange-400"
          unit="%"
          description="Productivity index"
        />
        
        <MetricCard
          title="Growth Potential"
          value={88.5}
          icon={TrendingUp}
          color="text-indigo-400"
          unit="%"
          description="Learning trajectory"
        />
      </div>

      {/* Cognita Insights */}
      <div className="cyber-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-cyber font-bold text-cyan-300">Cognita's Assessment</h3>
        </div>
        
        <div className="space-y-3">
          <div className="cyber-glass p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-gray-300 text-sm leading-relaxed">
              Your study consistency shows improvement with {data.studyHours} hours logged this week. 
              Consider focused 25-minute blocks to maximize retention and minimize fatigue.
            </p>
          </div>
          
          <div className="cyber-glass p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-gray-300 text-sm leading-relaxed">
              Financial discipline remains strong at {data.financialHealth}% health score. 
              This stability supports academic goals without monetary stress.
            </p>
          </div>
          
          <div className="cyber-glass p-4 rounded-lg border-l-4 border-pink-500">
            <p className="text-gray-300 text-sm leading-relaxed">
              Mood patterns indicate balanced emotional state. 
              Maintain sleep hygiene and exercise for optimal cognitive performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}