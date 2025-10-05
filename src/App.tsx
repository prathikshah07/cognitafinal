import { useState, useEffect } from 'react';
import { supabaseClient as supabase } from './lib/supabaseClient';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import type { User } from '@supabase/supabase-js';

interface CyberUser extends User {
  user_metadata: User['user_metadata'] & { display_name?: string };
}

function App() {
  const [user, setUser] = useState<CyberUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Async function to get initial session and set up auth listener
    async function initializeAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Session error:', error.message);
          setUser(null);
        } else if (session?.user) {
          setUser(session.user as CyberUser);
          console.log('User session found:', session.user);
        } else {
          setUser(null);
          console.log('No active user session found');
        }
      } catch (err) {
        console.error('Unexpected session fetch error:', err);
        setUser(null);
      } finally {
        setLoading(false);
        setTimeout(() => {
          setIsInitialized(true);
          console.log('🚀 COGNITA NEURAL INTERFACE ACTIVATED');
        }, 2000);
      }
    }

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user as CyberUser);
        console.log(`Auth event: ${event}`);

        if (event === 'SIGNED_IN') {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert(
                {
                  id: session.user.id,
                  email: session.user.email,
                  display_name:
                    session.user.user_metadata?.display_name ||
                    session.user.email?.split('@')[0] ||
                    'User',
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'id' }
              );

            if (profileError && !profileError.message.includes('duplicate')) {
              console.error('Profile error:', profileError);
            }
          } catch (err) {
            console.error('Profile creation failed:', err);
          }
        }
      } else {
        setUser(null);
        console.log(`Auth event: ${event} - user signed out`);
      }
      setLoading(false);
    });

    // Clean up subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-cyan-400 font-mono">
        <div>INITIALIZING NEURAL INTERFACE...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {!user ? <Auth /> : <Dashboard user={user} />}
    </div>
  );
}

export default App;
