import { loadGames } from './_lib/sidgad.js';
export default async function handler(req,res){
  try{
    const payload=await loadGames();
    res.setHeader('CDN-Cache-Control','s-maxage=14400, stale-while-revalidate=86400');
    res.setHeader('Cache-Control','public, max-age=60');
    res.status(200).json(payload);
  }catch(e){ res.status(500).json({error:String(e?.message||e)}); }
}
