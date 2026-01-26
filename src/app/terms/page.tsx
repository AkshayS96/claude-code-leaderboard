'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FloatingCode } from '@/components/FloatingCode';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#faf9f6] text-zinc-800 font-mono p-4 md:p-8 relative selection:bg-[#EB5B39] selection:text-white">
            <FloatingCode side="left" />
            <FloatingCode side="right" />

            <div className="max-w-3xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-12 uppercase text-xs tracking-widest font-bold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <article className="prose prose-zinc prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#EB5B39] max-w-none">
                    <h1 className="text-4xl mb-8">Terms of Service</h1>
                    <p className="lead text-xl text-zinc-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using Claude Rank ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                    </p>

                    <h2>2. Description of Service</h2>
                    <p>
                        Claude Rank is a leaderboard platform that tracks and displays token usage statistics for engineering teams provided "as is" and on an "as available" basis.
                    </p>

                    <h2>3. User Conduct</h2>
                    <p>
                        You agree to use the Service only for lawful purposes. You are prohibited from:
                    </p>
                    <ul>
                        <li>Manipulating or falsifying telemetry data sent to the Service.</li>
                        <li>Attempting to access accounts that do not belong to you.</li>
                        <li>Overloading or disrupting the integrity of the Service's infrastructure.</li>
                    </ul>

                    <h2>4. Data Accuracy</h2>
                    <p>
                        We do not guarantee the accuracy of rankings or token counts. Metrics are based on user-submitted telemetry and may be subject to latency or error.
                    </p>

                    <h2>5. Termination</h2>
                    <p>
                        We reserve the right to terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>

                    <h2>6. Limitation of Liability</h2>
                    <p>
                        In no event shall Claude Rank, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
                    </p>
                </article>
            </div>
        </main>
    );
}
