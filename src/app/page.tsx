'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Terminal, Cpu, Zap, Activity } from 'lucide-react';
import { formatCompactNumber } from '@/lib/utils';
import Link from 'next/link';
import { FloatingCode } from '@/components/FloatingCode';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  twitter_handle: string;
  avatar_url: string;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  last_active: string;
}

export default function LeaderboardPage() {
  console.log('LeaderboardPage rendering');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState({ peak_throughput: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Auth check - Session:', session, 'Error:', error);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, 'User:', session?.user?.email);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' });
      const data = await res.json();

      if (data.users) setProfiles(data.users);
      if (data.stats) setStats(data.stats);
    } catch (e) {
      console.error("Failed to fetch leaderboard", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel('leaderboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        // We can just refetch everything to be safe and get fresh stats if we wanted, 
        // but stats might not update from postgres changes. 
        // For now, let's just refetch.
        fetchLeaderboard();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main className="min-h-screen bg-[#faf9f6] text-zinc-800 font-mono p-4 md:p-8 relative selection:bg-[#EB5B39] selection:text-white">
      <FloatingCode side="left" />
      <FloatingCode side="right" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-12 border-b border-zinc-200 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#EB5B39] rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Terminal className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
              Claude Rank
            </h1>
          </div>
          <p className="text-zinc-500 text-lg max-w-2xl">
            Global telemetry for high-velocity engineering teams.
            Tracking <span className="text-[#EB5B39] font-bold">{profiles.reduce((acc, p) => acc + (p.total_tokens || 0), 0).toLocaleString()}</span> tokens shipped.
          </p>

          <div className="mt-8 flex gap-4">
            {authLoading ? (
              <div className="px-6 py-3 bg-zinc-200 text-zinc-400 rounded-lg font-medium shadow-xl shadow-zinc-200 animate-pulse">
                Loading...
              </div>
            ) : user ? (
              <>
                <Link href={`/u/${user.user_metadata?.preferred_username || user.user_metadata?.user_name}`} className="px-6 py-3 bg-[#EB5B39] text-white hover:bg-[#d94e2f] rounded-lg transition-all font-medium shadow-xl shadow-orange-200">
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                  className="px-6 py-3 border border-zinc-200 bg-white text-zinc-600 hover:text-red-600 hover:border-red-200 rounded-lg transition-all font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="px-6 py-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all font-medium shadow-xl shadow-zinc-200">
                Join Network
              </Link>
            )}
            <Link href="/setup" className="px-6 py-3 border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 rounded-lg transition-all font-medium">
              How to Setup
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard label="Active Nodes" value={profiles.length.toString()} icon={<Cpu />} />
          <StatCard label="Peak T/s" value={formatCompactNumber(stats.peak_throughput)} icon={<Zap />} />
          <StatCard label="System Status" value="ONLINE" icon={<Activity />} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-5 bg-zinc-50 border-b border-zinc-100 text-xs uppercase tracking-wider text-zinc-400 font-bold">
            <div className="col-span-1">#</div>
            <div className="col-span-4 pl-2">X Account</div>
            <div className="col-span-3 text-right">Tokens</div>
            <div className="col-span-2 text-right hidden md:block">Eff.</div>
            <div className="col-span-2 text-right hidden md:block">Cache</div>
          </div>

          <div className="divide-y divide-zinc-100">
            {loading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Scanning network...</div>
            ) : (
              <AnimatePresence>
                {profiles.map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-12 gap-4 p-5 hover:bg-orange-50/50 transition-colors items-center group"
                  >
                    <div className="col-span-1 font-bold text-zinc-300 text-xl group-hover:text-[#EB5B39] transition-colors">{index + 1}</div>
                    <div className="col-span-4 flex items-center gap-4 pl-2">
                      <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-200">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-zinc-400 font-bold">{profile.twitter_handle?.slice(0, 1)}</span>
                        )}
                      </div>
                      <a href={`https://x.com/${profile.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="font-medium text-zinc-900 group-hover:text-[#EB5B39] transition-colors">
                        @{profile.twitter_handle}
                      </a>
                    </div>
                    <div className="col-span-3 text-right font-bold text-zinc-900 font-mono text-lg">
                      {formatCompactNumber(profile.total_tokens || 0)}
                    </div>
                    <div className="col-span-2 text-right hidden md:block text-zinc-500 font-mono">
                      {(profile.input_tokens + profile.cache_read_tokens) > 0
                        ? Math.round((profile.cache_read_tokens / (profile.input_tokens + profile.cache_read_tokens)) * 100)
                        : 0}%
                    </div>
                    <div className="col-span-2 text-right hidden md:block text-zinc-500 font-mono">
                      {formatCompactNumber(profile.cache_read_tokens || 0)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-zinc-200 text-center text-sm text-zinc-400">
          <div className="flex justify-center gap-6">
            <Link href="/terms" className="hover:text-zinc-600 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-zinc-600 transition-colors">Privacy Policy</Link>
          </div>
          <p className="mt-4 text-xs">This is a community project and is not affiliated with or endorsed by any AI company.</p>
        </footer>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: any }) {
  return (
    <div className="p-5 border border-zinc-200 bg-white rounded-xl flex items-center gap-4 shadow-sm">
      <div className="p-3 bg-orange-50 text-[#EB5B39] rounded-lg">
        {icon}
      </div>
      <div>
        <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1 font-bold">{label}</div>
        <div className="text-2xl font-bold text-zinc-900">{value}</div>
      </div>
    </div>
  );
}
