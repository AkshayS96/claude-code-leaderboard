'use client';

import { motion } from 'framer-motion';
import { formatCompactNumber, formatTokens } from '@/lib/utils';
import { Terminal, Shield, Cpu } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
    totalTokens: number;
}

export default function HeroSection({ totalTokens }: HeroSectionProps) {
    return (
        <div className="relative w-full py-16 md:py-24 flex flex-col items-center justify-center overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 text-center space-y-6"
            >
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Terminal className="w-5 h-5 text-emerald-500" />
                    <span className="text-emerald-500 font-mono text-sm tracking-widest uppercase">System Online</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
                    Claude Rank
                </h1>

                <p className="text-zinc-400 max-w-lg mx-auto text-lg leading-relaxed">
                    The global leaderboard for high-velocity engineering teams building with Claude Code.
                </p>

                <div className="py-8">
                    <div className="flex flex-col items-center">
                        <span className="text-sm text-zinc-500 uppercase tracking-widest mb-2 font-mono">Global Tokens Processed</span>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0.5 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 font-mono"
                        >
                            {formatCompactNumber(totalTokens)}
                        </motion.div>
                        <div className="text-zinc-500 font-mono mt-2">
                            {formatTokens(totalTokens)} exact
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <Link href="/auth/device" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        Join Leaderboard
                    </Link>
                    <a href="#" className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded font-medium transition-all">
                        Install CLI
                    </a>
                </div>
            </motion.div>

            {/* Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none fade-mask" />
        </div>
    );
}
