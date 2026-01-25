'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const codeSnippets = [
    "const rank = await redis.zrevrank('rank:daily', handle);",
    "export const OTEL_RESOURCE_ATTRIBUTES = 'twitter_handle=@user';",
    "fn update_metrics(cx: Context, payload: MetricPayload) -> Result<()> {",
    "  let tokens = payload.sum.data_points.iter().map(|dp| dp.value).sum();",
    "  db.execute('UPDATE profiles SET tokens = tokens + $1', params![tokens])?;",
    "}",
    "interface TelemetryEvent {",
    "  timestamp: number;",
    "  token_count: number;",
    "  model_id: 'claude-3-7-sonnet';",
    "}",
    "// Optimizing cache hits...",
    "if (cacheHit) { metrics.increment('cache_read', tokens); }",
    "console.log('Shipped 4000 tokens in 200ms');",
];

// Re-write component to be simpler and cleaner
export function FloatingCode({ side }: { side: 'left' | 'right' }) {
    const [lines, setLines] = useState<any[]>([]);

    useEffect(() => {
        const count = 15; // Slightly fewer lines for cleaner look
        const newLines = Array.from({ length: count }).map((_, i) => ({
            id: i,
            text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
            top: (i * (100 / count)),
            // Drastically slower: 60-90 seconds for full traversal
            speed: 60 + Math.random() * 30
        }));
        setLines(newLines);
    }, []);

    return (
        <div className={`fixed top-0 key h-screen ${side === 'left' ? 'left-0' : 'right-0'} w-80 overflow-hidden pointer-events-none z-0 hidden md:block`}>
            <style jsx>{`
                .mask-gradient {
                    mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
                    -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
                }
             `}</style>
            <div className="mask-gradient w-full h-full relative">
                {lines.map((line, i) => (
                    <CodeLine key={line.id} line={line} side={side} index={i} />
                ))}
            </div>
        </div>
    );
}

function CodeLine({ line, side, index }: any) {
    // Generate a consistent random duration based on index to stable hydration if needed, 
    // but client-side is fine.

    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{
                y: typeof window !== 'undefined' ? window.innerHeight + 200 : 1200,
                opacity: [0, 1, 1, 0]
            }}
            transition={{
                duration: line.speed,
                repeat: Infinity,
                ease: "linear",
                // Stagger delays negatively to ensure visible instantly
                delay: -1 * Math.random() * line.speed
            }}
            className={`absolute ${side === 'left' ? 'left-4' : 'right-4'} text-xs font-mono text-zinc-400/30 whitespace-nowrap`}
            style={{
                marginLeft: (index % 4) * 15,
                fontSize: 10 + (index % 3) * 2
            }}
        >
            {line.text}
        </motion.div>
    );
}
