import { loadGames } from './_lib/data.js';
export default function handler(req,res){
  try{
    res.setHeader('Cache-Control','no-cache');
    res.status(200).json(loadGames());
  }catch(e){res.status(500).json({error:String(e?.message||e)});}
}
