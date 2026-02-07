'use client';

import { Terminal, Command, CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { FloatingCode } from '@/components/FloatingCode';

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute right-3 top-3 p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
            title="Copy to clipboard"
        >
            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
    );
}

function CodeBlock({ children, copyText }: { children: React.ReactNode; copyText: string }) {
    return (
        <div className="relative bg-zinc-900 rounded-lg p-4 font-mono text-sm text-zinc-100 overflow-x-auto">
            <CopyButton text={copyText} />
            <pre>{children}</pre>
        </div>
    );
}

export default function SetupPage() {
    return (
        <main className="min-h-screen bg-[#faf9f6] text-zinc-800 font-mono p-4 md:p-8 relative selection:bg-[#EB5B39] selection:text-white">
            <FloatingCode side="left" />
            <FloatingCode side="right" />

            <div className="max-w-3xl mx-auto relative z-10">
                <header className="mb-12">
                    <Link href="/" className="text-zinc-400 hover:text-zinc-600 text-sm mb-4 inline-block">
                        ← Back to Leaderboard
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#EB5B39] rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                            <Terminal className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
                            Setup Telemetry
                        </h1>
                    </div>
                    <p className="text-zinc-500 text-lg">
                        Track your AI coding assistant usage and compete on the global leaderboard.
                    </p>
                </header>

                <div className="space-y-8">
                    {/* Step 1 */}
                    <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-orange-50 text-[#EB5B39] rounded-full flex items-center justify-center font-bold text-sm">1</div>
                            <h2 className="text-xl font-bold text-zinc-900">Get the CLI</h2>
                        </div>
                        <p className="text-zinc-500 mb-4">
                            You can run the CLI directly using npx (no installation required):
                        </p>
                        <CodeBlock copyText="npx crank-cli --help">
                            <span className="text-zinc-400">$</span> npx crank-cli --help
                        </CodeBlock>
                    </section>

                    {/* Step 2 */}
                    <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-orange-50 text-[#EB5B39] rounded-full flex items-center justify-center font-bold text-sm">2</div>
                            <h2 className="text-xl font-bold text-zinc-900">Authenticate</h2>
                        </div>
                        <p className="text-zinc-500 mb-4">
                            Run the login command and follow the instructions to authenticate with your X (Twitter) account:
                        </p>
                        <CodeBlock copyText="npx crank-cli login">
                            <span className="text-zinc-400">$</span> npx crank-cli login
                        </CodeBlock>
                        <p className="text-zinc-400 text-sm mt-3">
                            This will open a browser window where you can authorize the CLI using a device code.
                        </p>
                    </section>

                    {/* Step 3 */}
                    <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-orange-50 text-[#EB5B39] rounded-full flex items-center justify-center font-bold text-sm">3</div>
                            <h2 className="text-xl font-bold text-zinc-900">Start Tracking</h2>
                        </div>
                        <p className="text-zinc-500 mb-4">
                            The CLI will automatically track your token usage when you use AI coding assistants:
                        </p>
                        <CodeBlock copyText="npx crank-cli setup">
                            <span className="text-zinc-400">$</span> npx crank-cli setup
                        </CodeBlock>
                        <p className="text-zinc-400 text-sm mt-3">
                            This starts tracking and reports metrics to the leaderboard in real-time.
                        </p>
                    </section>

                    {/* How it works */}
                    <section className="bg-zinc-50 rounded-xl border border-zinc-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Command className="w-5 h-5 text-[#EB5B39]" />
                            <h2 className="text-lg font-bold text-zinc-900">How it Works</h2>
                        </div>
                        <ul className="space-y-3 text-zinc-600 text-sm">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>The CLI tracks token usage from your AI coding sessions</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>Token counts (input, output, cache) are automatically captured and reported</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>Your API keys and message content are never stored - only token metrics</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>View your stats in real-time on the leaderboard</span>
                            </li>
                        </ul>
                    </section>

                    {/* Disclaimer */}
                    <p className="text-zinc-400 text-xs text-center">
                        This is a community project and is not affiliated with or endorsed by any AI company.
                    </p>

                    {/* CTA */}
                    <div className="flex gap-4 pt-4">
                        <Link
                            href="/"
                            className="px-6 py-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all font-medium"
                        >
                            View Leaderboard
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
