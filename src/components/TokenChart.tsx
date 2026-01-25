'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { formatCompactNumber } from '@/lib/utils';
import { LeaderboardUser } from '@/lib/types';

interface TokenChartProps {
    data: { timestamp: string; tokens: number }[];
}

export default function TokenChart({ data }: TokenChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center border border-zinc-800 rounded bg-zinc-900/50">
                <p className="text-zinc-500 font-mono">No data available</p>
            </div>
        );
    }

    // Format date for axis
    const chartData = data.map(d => ({
        ...d,
        time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 0,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                        dataKey="time"
                        stroke="#52525b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#52525b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatCompactNumber(value)}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px' }}
                        itemStyle={{ color: '#10b981' }}
                        formatter={(value?: number) => [new Intl.NumberFormat('en-US').format(value || 0), 'Tokens']}
                    />
                    <Area
                        type="monotone"
                        dataKey="tokens"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorTokens)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
