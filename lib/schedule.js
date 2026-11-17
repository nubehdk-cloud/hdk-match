export const TIMEZONE='Europe/Madrid';
export function madridParts(value=new Date()){
  return Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',weekday:'short',hourCycle:'h23'}).formatToParts(value).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
}
export function madridDate(value=new Date()){
  const p=madridParts(value);return `${p.year}-${p.month}-${p.day}`;
}
export function weeklySlot(value=new Date()){
  const p=madridParts(value);
  return p.weekday==='Thu'&&Number(p.hour)>=12?`${p.year}-${p.month}-${p.day}`:null;
}
export function nextUpdate(value=new Date()){
  const p=madridParts(value);
  const date=new Date(Date.UTC(+p.year,+p.month-1,+p.day));
  let days=(4-date.getUTCDay()+7)%7;
  if(days===0&&+p.hour>=12)days=7;
  date.setUTCDate(date.getUTCDate()+days);
  return `${date.toISOString().slice(0,10)}T12:00`;
}
export function isPast(game,now=new Date()){
  if(!game.date)return false;
  const p=madridParts(now);
  const end=`${game.endDate||game.date}T${game.endDate?'23:59':game.endTime||game.time||'23:59'}`;
  return end<`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
