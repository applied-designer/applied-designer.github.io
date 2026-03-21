import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const docsDir = join(rootDir, 'docs');

const jsFiles = readdirSync(join(docsDir, 'assets')).filter(f => f.endsWith('.js'));

for (const file of jsFiles) {
    const content = readFileSync(join(docsDir, 'assets', file), 'utf-8');
    if (content.includes('SampleResults')) {
        console.error(`FAIL: "${file}" contains "SampleResults" - dev-only page is bundled in production`);
        process.exit(1);
    }
}

console.log('\x1b[32m✓ Production bundle does not contain "SampleResults"\x1b[0m');
