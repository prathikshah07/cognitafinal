import { useState, useEffect } from 'react'
import { MessageSquare, Brain, Zap, Send, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface CognitaAIProps {
  userId: string
}

interface AIEntry {
  id: string
  entry_text: string
  response_text: string
  created_at: string
}

export default function CognitaAI({ userId }: CognitaAIProps) {
  const [entry, setEntry] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [responses, setResponses] = useState<AIEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load AI entries from database
  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error loading entries:', error)
        return
      }

      setResponses(data || [])
    } catch (err) {
      console.error('Error loading entries:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Save entry to database
  const saveEntry = async (entryText: string, responseText: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_entries')
        .insert([
          {
            user_id: userId,
            entry_text: entryText,
            response_text: responseText
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error saving entry:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Error saving entry:', err)
      return null
    }
  }

  const generateResponse = (text: string) => {
    const responses = []
    const lower = text.toLowerCase()
    
    if (/stud|learn|focus/.test(lower)) {
      responses.push("Your dedication to studying shows commitment to academic excellence.")
    }
    if (/spend|money|budget/.test(lower)) {
      responses.push("Financial awareness strengthens your foundation for success.")
    }
    if (/mood|feel|stress/.test(lower)) {
      responses.push("Monitor emotional patterns to optimize your productivity.")
    }
    if (/habit|routine/.test(lower)) {
      responses.push("Consistent habits compound into significant growth.")
    }
    
    if (responses.length === 0) {
      responses.push("Continue documenting your experiences for deeper insights.")
    }
    
    return responses.join(' ')
  }

  // Load entries on component mount
  useEffect(() => {
    if (userId) {
      loadEntries()
    }
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entry.trim() || isAnalyzing) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = generateResponse(entry)
      
      // Save to database
      const savedEntry = await saveEntry(entry, response)
      
      if (savedEntry) {
        // Add to local state
        setResponses(prev => [savedEntry, ...prev])
        setEntry('')
      } else {
        setError('Failed to save entry. Please try again.')
      }
      
    } catch (err) {
      setError('Analysis failed. Please try again.')
      console.error('Error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="cyber-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-12 h-12 cyber-glass rounded-full">
          <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-cyber font-bold text-purple-400">Cognita AI</h2>
          <p className="text-gray-400 text-sm font-mono">Intelligent Student Companion</p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-cyber text-cyan-300 uppercase tracking-wide">
            Daily Entry Log
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
            <textarea
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="cyber-input w-full pl-10 pr-4 py-3 h-24 resize-none"
              placeholder="Log your study time, mood, habits, finances, or time management..."
              disabled={isAnalyzing}
            />
          </div>
        </div>

        {error && (
          <div className="cyber-glass p-4 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!entry.trim() || isAnalyzing}
          className="cyber-button w-full py-3 font-cyber font-semibold"
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Send className="w-5 h-5" />
              <span>Submit to Cognita</span>
            </div>
          )}
        </button>
      </form>

      {/* Analysis History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-cyber text-cyan-300">Analysis History</h3>
        </div>

        {isLoading ? (
          <div className="cyber-glass p-6 rounded-lg text-center">
            <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400 font-mono text-sm">Loading your AI history...</p>
          </div>
        ) : responses.length === 0 ? (
          <div className="cyber-glass p-6 rounded-lg text-center">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
            <p className="text-gray-400 font-mono text-sm">Submit your first entry above</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {responses.map((response) => (
              <div key={response.id} className="cyber-glass p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Brain className="w-6 h-6 text-purple-400 mt-1" />
                  <div className="flex-1">
                    <div className="text-purple-300 font-cyber text-sm font-semibold mb-1">Cognita</div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {response.response_text}
                    </p>
                    <div className="text-xs text-gray-500 mt-2 font-mono">
                      {new Date(response.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}