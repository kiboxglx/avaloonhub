import fs from 'fs';
import path from 'path';

function replaceColors(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceColors(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css') || fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content
                // Backgrounds
                .replace(/bg-\[#000000\]/g, 'bg-background')
                .replace(/bg-black/g, 'bg-background')
                .replace(/bg-\[#0a0a0a\]/g, 'bg-card')

                // Borders
                .replace(/border-\[#1a1a1a\]/g, 'border-border')

                // Text
                .replace(/text-white/g, 'text-main')
                .replace(/text-slate-400/g, 'text-muted')
                .replace(/text-slate-500/g, 'text-dim')

                // Other common hardcoded
                .replace(/bg-white\/5/g, 'bg-main/5')
                .replace(/bg-white\/10/g, 'bg-main/10')
                .replace(/bg-white\/20/g, 'bg-main/20')
                .replace(/border-white\/5/g, 'border-main/5')
                .replace(/border-white\/20/g, 'border-main/20')
                .replace(/hover:text-white/g, 'hover:text-main')
                .replace(/hover:bg-white\/5/g, 'hover:bg-main/5')
                .replace(/hover:bg-white\/10/g, 'hover:bg-main/10');

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Updated:', fullPath);
            }
        }
    }
}
replaceColors('./src');
console.log('Done mapping semantic colors.');
