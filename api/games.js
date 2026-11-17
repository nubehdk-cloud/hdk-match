import snapshot from '../data/games.json' with {type:'json'};
import {mergeCalendarGames} from './_lib/data.js';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  return res.status(200).json(mergeCalendarGames(snapshot));
}
