import { loadCachedGames } from './_lib/data.js';

export default function handler(req,res){
  try{
    res.setHeader('Cache-Control','no-store');
    res.status(200).json(loadCachedGames());
  }catch(e){
    res.status(500).json({error:String(e?.message||e)});
  }
}
