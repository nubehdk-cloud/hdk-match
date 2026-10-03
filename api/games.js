import { loadGames } from './_lib/sidgad.js';

export default async function handler(req,res){
  try{
    res.setHeader('Cache-Control','no-store');
    res.status(200).json(await loadGames());
  }catch(e){
    res.status(500).json({error:String(e?.message||e)});
  }
}
