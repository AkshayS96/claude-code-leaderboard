import fetch from 'node-fetch';
import chalk from 'chalk';
import fs from 'fs';
// @ts-ignore
import Table from 'cli-table3';
import { urls, CONFIG_PATH } from '../config';

export async function statusCommand() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error(chalk.red('Not logged in. Run `claude-rank login`'));
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

    try {
        const res = await fetch(urls.USER(config.twitter_handle));
        if (!res.ok) throw new Error('Failed to fetch stats');

        const user = await res.json() as any;

        const table = new Table({
            head: [chalk.cyan('Metric'), chalk.cyan('Value')],
            style: { head: [], border: [] }
        });

        table.push(
            ['Global Rank', chalk.bold.yellow(`#${user.rank || '?'}`)],
            ['Twitter Handle', chalk.bold.white(`@${user.twitter_handle}`)],
            ['Total Tokens', chalk.green(user.total_tokens.toLocaleString())],
            ['Input Tokens', user.input_tokens.toLocaleString()],
            ['Output Tokens', user.output_tokens.toLocaleString()],
            ['Cache Read', user.cache_read_tokens?.toLocaleString() || '0'],
            ['Cache Write', user.cache_write_tokens?.toLocaleString() || '0'],
            ['Savings Score', chalk.blue(`${user.savings_score?.toFixed(1)}%`)]
        );

        console.log(chalk.bold(`\n  AI RANK STATUS`));
        console.log(table.toString());

    } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
    }
}
