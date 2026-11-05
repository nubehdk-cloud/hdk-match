import { loadGames } from './_lib/sidgad.js';
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 try {
  const data=await loadGames();
  res.status(200).json({
    checkedAt:new Date().toISOString(),
    region:process.env.VERCEL_REGION||null,
    statuses:data.status.map(({id,ok,games,error})=>({id,ok,games,error})),
    numberOfOfficialMatches:data.games.length
  });
 } catch(e) {
  res.status(500).json({error:String(e.message||e),region:process.env.VERCEL_REGION||null});
 }
}