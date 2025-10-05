import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; // <--- The CORRECT path
import { Zap, Loader2, RefreshCw } from 'lucide-react'; // Using lucide-react for icons


// Type for the Insight data structure from your database
interface Insight {
  id: number;
  insight_text: string;
  created_at: string;
  category: string;
}


// ====================================================================
// AIInsights Component
// ====================================================================


function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Function to fetch all existing insights for the user
  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User session expired. Please log in.");
        return;
      }


      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });


      if (error) throw error;
      setInsights(data || []);


    } catch (err) {
      console.error('Error fetching insights:', err);
      setError("Could not load past insights.");
    } finally {
      setIsLoading(false);
    }
  }, []);


  // Function to call the secure Edge Function and trigger a new analysis
  const generateNewInsight = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // 1. Call the deployed Edge Function securely
      const { error: invokeError } = await supabase.functions.invoke('cerebras-completion', {});


      if (invokeError) {
        // Log the full error to the console for the backend person to debug
        console.error("Function Invoke Error:", invokeError);
        throw new Error(invokeError.message || "AI function call failed.");
      }


      // 2. Fetch the updated list of insights (including the new one)
      await fetchInsights();


    } catch (err) {
      console.error("Generation Error:", err);
      setError(`Failed to generate insight: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };


  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);


  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <h1 className="text-3xl font-extrabold text-indigo-700 flex items-center">
          <Zap className="w-8 h-8 mr-3 text-yellow-500 fill-yellow-300" />
          AI Performance Insights
        </h1>
        <button
          onClick={generateNewInsight}
          disabled={isGenerating || isLoading}
          className="flex items-center px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-150 disabled:bg-gray-400"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing Data...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              Generate New Insight
            </>
          )}
        </button>
      </div>


      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          Error: {error}
        </div>
      )}


      {isLoading && !isGenerating && (
        <p className="text-center text-gray-500 mt-8">Loading insights...</p>
      )}


      {!isLoading && insights.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg mt-8">
          <p className="text-xl text-gray-600">No AI insights found.</p>
          <p className="text-sm text-gray-500 mt-2">Click "Generate New Insight" to get your first analysis!</p>
        </div>
      )}


      <div className="space-y-6">
        {insights.map((insightItem, index) => (
          <div
            key={insightItem.id}
            className={`p-5 rounded-lg shadow-inner border ${index === 0 ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${insightItem.category === 'mood' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                {index === 0 ? 'Latest Analysis' : insightItem.category}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(insightItem.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {insightItem.insight_text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


export default AIInsights;




