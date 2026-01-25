'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCompactNumber } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FloatingCode } from '@/components/FloatingCode';

export default function UserProfilePage() {
    const params = useParams();
    const handle = params.handle as string;

    const [profile, setProfile] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (!handle) return;

        const fetchData = async () => {
            const decodedHandle = decodeURIComponent(handle);

            // Fetch Profile
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('twitter_handle', decodedHandle)
                .single();

            if (data) setProfile(data);

            if (data) {
                const { data: logs } = await supabase
                    .from('usage_logs')
                    .select('timestamp, token_count, meta')
                    .eq('user_id', data.id)
                    .order('timestamp', { ascending: true })
                    .limit(50);

                if (logs) {
                    const mapped = logs.map(l => ({
                        time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        tokens: l.token_count,
                        input: l.meta?.input || 0,
                        output: l.meta?.output || 0
                    }));
                    setChartData(mapped);
                }
            }
        };

        fetchData();
    }, [handle]);

    if (!profile) return <div className="min-h-screen bg-[#faf9f6] text-zinc-500 p-8 font-mono">Loading profile data...</div>;

    return (
        <main className="min-h-screen bg-[#faf9f6] text-zinc-800 font-mono p-4 md:p-8 relative selection:bg-[#EB5B39] selection:text-white">
            <FloatingCode side="left" />
            <FloatingCode side="right" />

            <div className="max-w-4xl mx-auto relative z-10 w-full">
                <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 uppercase text-xs tracking-widest font-bold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Grid
                </Link>

                <header className="flex flex-col md:flex-row items-center gap-6 mb-12 border-b border-zinc-200 pb-8">
                    <div className="w-24 h-24 bg-white rounded-xl border border-zinc-200 flex items-center justify-center overflow-hidden shadow-sm">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl text-zinc-300 font-bold">{profile.twitter_handle[0]}</span>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-bold text-zinc-900 mb-2">@{profile.twitter_handle}</h1>
                        <div className="flex gap-8 text-sm text-zinc-500 uppercase tracking-widest font-medium">
                            <div>
                                <span className="block text-[#EB5B39] font-bold text-2xl mb-1">{formatCompactNumber(profile.total_tokens)}</span>
                                Total Tokens
                            </div>
                            <div>
                                <span className="block text-[#EB5B39] font-bold text-2xl mb-1">{formatCompactNumber(profile.cache_tokens)}</span>
                                Cache Hits
                            </div>
                        </div>
                    </div>
                </header>

                <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
                    <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-8 font-bold">Activity (Last 50 Events)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="time" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e4e4e7', color: '#18181b', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#18181b' }}
                                    cursor={{ fill: '#f4f4f5' }}
                                />
                                <Bar dataKey="input" stackId="a" fill="#ea580c" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="output" stackId="a" fill="#fdba74" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </main>
    );
}
