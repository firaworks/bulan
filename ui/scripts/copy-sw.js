// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const rootPath = path.join(__dirname, '../../');

// fs.cpSync(path.join(rootPath, 'dist-sw'), path.join(rootPath, 'dist'), { recursive: true });

// fs.rmSync(path.join(rootPath, 'dist-sw'), { recursive: true, force: true });


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.join(__dirname, '../../');
const uiPath = path.join(rootPath, 'ui');

// Corrected paths to point to the 'ui' directory
fs.cpSync(path.join(uiPath, 'dist-sw'), path.join(uiPath, 'dist'), { recursive: true });

fs.rmSync(path.join(uiPath, 'dist-sw'), { recursive: true, force: true });
