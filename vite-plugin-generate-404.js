import fs from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function generate404Plugin() {
    return {
        name: 'vite-plugin-generate-404',
        
        async closeBundle() {
            const templatePath = resolve(__dirname, '404-template.html');
            let template = fs.readFileSync(templatePath, 'utf-8');
            
            const { getRoutes } = await import('./src/routes.js');
            const routes = getRoutes(false);
            const routeList = routes.map(r => `'${r.path}'`);
            
            template = template.replace('{{ROUTES}}', `[${routeList.join(', ')}]`);
            
            const docsDir = resolve(__dirname, 'docs');
            if (!fs.existsSync(docsDir)) {
                fs.mkdirSync(docsDir, { recursive: true });
            }
            
            fs.writeFileSync(resolve(docsDir, '404.html'), template);
            
            console.log('\x1b[32m✓ Generated docs/404.html with routes:\x1b[0m', 
                routes.map(r => r.path).join(', '));
        }
    };
}
