const fs = require('fs');
const path = require('path');

function replaceColors(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceColors(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content
                .replace(/#111121/gi, '#000000') // main background
                .replace(/#121221/gi, '#000000') // header background
                .replace(/#1e1e2d/gi, '#0a0a0a') // card background
                .replace(/#2d2d42/gi, '#1a1a1a') // borders
                .replace(/#252546/gi, '#1f1f1f') // hovers
                .replace(/#3d3d5a/gi, '#333333') // lighter borders/hovers
                .replace(/#9595c6/gi, '#a1a1aa') // text slates
                .replace(/bg-\[#020617\]/g, 'bg-[#000000]'); // old slate

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Updated:', fullPath);
            }
        }
    }
}
replaceColors('./src');
