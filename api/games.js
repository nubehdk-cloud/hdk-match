import { loadGames } from './_lib/sidgad.js';
export default async function handler(req,res){
  try{
    const payload=await loadGames();
    res.setHeader('CDN-Cache-Control','s-maxage=300, stale-while-revalidate=600');
    res.setHeader('Cache-Control','no-cache');
    res.status(200).json(payload);
  }catch(e){ res.status(500).json({error:String(e?.message||e)}); }
}
