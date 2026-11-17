// Read JSON captures from stdin; this importer never contacts a federation.
import fs from 'node:fs';
import {buildSnapshot} from '../lib/sidgad.js';
import {weeklySlot} from '../lib/schedule.js';
const file=new URL('../data/games.json',import.meta.url);
const previous=JSON.parse(fs.readFileSync(file,'utf8'));
const now=new Date(),slot=weeklySlot(now);
const initial=process.argv.includes('--initial');
if(!initial&&(!slot||previous.weeklySlot===slot)){
  console.log('SKIPPED: outside Thursday after 12:00 Madrid, or this week already checked.');
  process.exit(0);
}
const input=JSON.parse(fs.readFileSync(0,'utf8'));
if(!Array.isArray(input.captures))throw new Error('Expected {captures:[...]}');
const snapshot=buildSnapshot(previous,input.captures,now.toISOString());
if(!initial)snapshot.weeklySlot=slot;
fs.writeFileSync(new URL('../data/games.json.tmp',import.meta.url),JSON.stringify(snapshot,null,2)+'\n');
fs.renameSync(new URL('../data/games.json.tmp',import.meta.url),file);
for(const s of snapshot.status)console.log(s.id,s.ok?'OK':'RETAINED',s.games,s.error||'');
