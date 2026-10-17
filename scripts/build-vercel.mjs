import {execFileSync} from 'node:child_process';
import {cp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'site-output');
await rm(output, {recursive:true, force:true});
const hostname = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const origin = process.env.SITE_URL || (hostname ? `https://${hostname}` : 'http://localhost:3000');
execFileSync(process.execPath, [path.join(root, 'scripts/build-pages.mjs')], {cwd:root, stdio:'inherit', env:{...process.env, SITE_URL:origin}});
await cp(path.join(root, 'public'), output, {recursive:true});
const home = await readFile(path.join(output, 'index.html'),'utf8');
const account = home.replace(/<title>.*?<\/title>/,'<title>Account access — Evermark</title>').replace(/<main id="main">[\s\S]*?<\/main>/,'<main id="main"><section class="not-found shell"><h1 class="page-title">Your brand.<br>Your space.</h1><p>Account access is not available yet. You can explore Evermark while the account service is being connected.</p><a class="button button-green" href="/">Explore Evermark</a></section></main>');
await mkdir(path.join(output,'signin'),{recursive:true});
await writeFile(path.join(output,'signin/index.html'),account);
console.log('Built Evermark pages and local assets for Vercel.');
