import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_PATH = path.join(os.homedir(), '.claude-rank.json');

export async function logoutCommand() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.log(chalk.yellow('Not logged in.'));
        return;
    }

    try {
        fs.unlinkSync(CONFIG_PATH);
        console.log(chalk.green('✓ Logged out successfully.'));
        console.log(chalk.gray(`Removed credentials from ${CONFIG_PATH}`));
    } catch (e: any) {
        console.error(chalk.red(`Failed to logout: ${e.message}`));
        process.exit(1);
    }
}
