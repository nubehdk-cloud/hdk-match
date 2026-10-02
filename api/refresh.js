import { loadGames } from './_lib/sidgad.js';
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{ res.setHeader('Cache-Control','no-store'); res.status(200).json(await loadGames()); }
  catch(e){ res.status(500).json({error:String(e?.message||e)}); }
}
