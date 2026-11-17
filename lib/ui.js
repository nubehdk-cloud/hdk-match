import {loadAppData} from './app-data.js';
import {isPast,nextUpdate} from './schedule.js';
const state={person:'all',sport:'all',place:'all',data:null};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>String(s||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const pumas=g=>g.sport==='line'&&g.players?.includes('gaston')&&String(g.sourceId||'').endsWith('_pumas');
const rozas=g=>g.sport==='line'&&g.players?.includes('andres')&&g.official;
const isHome=g=>g.place?g.place==='home':pumas(g)?norm(g.home).includes('PUMAS'):g.sport==='ice'?['LA NEVERA','MAJADAHONDA'].some(x=>norm(g.home).includes(x)):norm(g.home).includes('LAS ROZAS');
const fmt=d=>new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',weekday:'short',day:'numeric',month:'short'}).format(new Date(`${d}T12:00:00Z`));
const stamp=d=>d?new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(d)):'pendiente';
const whenText=g=>!g.date?'Fecha y hora pendientes':g.endDate?`${fmt(g.date)} – ${fmt(g.endDate)}${g.time?` · ${g.time}`:''}`:g.time?`${fmt(g.date)} · ${g.time}${g.endTime?`–${g.endTime}`:''}`:`${fmt(g.date)} · Hora pendiente`;
const names=g=>g.players?.length===2?'Andrés + Gastón':g.players?.includes('gaston')?'Gastón':'Andrés';
const icon=g=>g.sport==='ice'?'🧊':'🛼';
const filtered=()=>[...(state.data?.games||[])].filter(g=>!isPast(g)&&(state.person==='all'||g.players?.includes(state.person))&&(state.sport==='all'||g.sport===state.sport)&&(state.place==='all'||(state.place==='home'?isHome(g):!isHome(g)))).sort((a,b)=>`${a.date||'9999'}T${a.time||'23:59'}`.localeCompare(`${b.date||'9999'}T${b.time||'23:59'}`));
function card(g){
  const matchup=g.special&&!g.home&&!g.away?`<div class="teams" style="grid-template-columns:1fr"><div style="text-align:center">${esc(g.title||g.competition)}</div></div>`:`<div class="teams"><div class="h">${esc(g.home)}</div><div class="dash">—</div><div>${esc(g.away)}</div></div>`;
  const source=state.data.status?.find(s=>s.id===g.sourceId);
  const note=[g.requiresCallup?'Sujeto a convocatoria.':'',source?.ok===false?`Última verificación: ${stamp(source.lastSuccessAt)}.`:''].filter(Boolean).join(' ');
  return `<article class="card${pumas(g)?' pumas':rozas(g)?' rozas':g.sport==='ice'?' hielo':''}"><div class="meta"><div><div class="tags">${g.special?'📅 Evento':icon(g)} ${esc(g.competition)} · ${esc(names(g))}${g.round?` · ${esc(g.round)}`:''}</div><div class="when">${esc(whenText(g))}</div></div><div class="where">${isHome(g)?'CASA':'FUERA'}</div></div>${matchup}${g.venue?`<div class="venue">📍 ${esc(g.venue)}</div>`:''}${note?`<div class="note">${esc(note)}</div>`:''}</article>`;
}
function render(){
  if(!state.data)return;
  const list=filtered(),dated=list.filter(g=>g.date),pending=list.filter(g=>!g.date),first=dated[0];
  const failed=(state.data.status||[]).filter(s=>!s.ok);
  const stale=(state.data.status||[]).some(s=>s.lastSuccessAt&&Date.now()-new Date(s.lastSuccessAt).getTime()>8*86400000);
  const warning=failed.length||stale?'<div class="error"><strong>Hay fuentes pendientes de actualizar</strong><div>Se conserva la última lectura oficial disponible. Consulta su fecha en Fuentes.</div></div>':'';
  const officialWarning=state.data.officialStatus?.ok===false?'<div class="error">No se pudo cargar la actualización guardada de partidos. Pulsa Recargar datos.</div>':'';
  const calendarWarning=state.data.calendarStatus?.ok===false?'<div class="error">No se pudieron cargar AROK y las tecnificaciones. Pulsa Recargar datos.</div>':'';
  const next=first?`<section class="next"><div class="eyebrow">${first.special?'Siguiente evento':'Siguiente partido oficial'}</div><div class="nextline"><div class="nextmatch">${icon(first)} ${esc(first.special&&!first.home&&!first.away?first.title||first.competition:`${first.home} — ${first.away}`)}</div><div class="nextwhen">${esc(whenText(first))}</div></div></section>`:'';
  const cards=dated.length?`<div class="list">${dated.map(card).join('')}</div>`:'<div class="empty">No hay partidos ni eventos próximos con estos filtros.</div>';
  const pendingCards=pending.length?`<h2 class="pending-title">Partidos con fecha pendiente</h2><div class="list">${pending.map(card).join('')}</div>`:'';
  const statuses=(state.data.status||[]).map(s=>`<div class="statusrow"><span>${esc(s.label)}</span><span class="${s.ok?'ok':'bad'}">${s.ok?'✓':'⚠'} ${esc(stamp(s.lastSuccessAt))}${s.ok?'':' · pendiente'}</span></div>`).join('');
  $('#app').innerHTML=`<section class="schedule" aria-label="Actualización semanal"><strong>Actualización semanal · jueves a las 12:00</strong><div>Última lectura oficial: ${esc(stamp(state.data.generatedAt))} · Madrid</div><div>Próxima: ${esc(fmt(nextUpdate().slice(0,10)))} · 12:00</div><div class="sub">Abrir o recargar la app no consulta las federaciones.</div><div class="actions"><button class="linkbtn" id="reload">Recargar datos</button></div></section>${warning}${officialWarning}${calendarWarning}${next}${cards}${pendingCards}<details><summary>Fuentes y fechas de actualización</summary>${statuses}<div class="foot">AROK y tecnificaciones se conservan desde Google Calendar.</div></details>`;
  $('#reload').addEventListener('click',load);
}
let activeLoad=null;
function load(){
  if(activeLoad)return activeLoad;
  $('#app').innerHTML='<div class="loading">Cargando la última actualización…</div>';
  activeLoad=loadAppData().then(data=>{state.data=data;render()}).catch(()=>{
    $('#app').innerHTML='<div class="error">No se pudo cargar HDK Match.<div class="actions"><button class="linkbtn" id="retry">Volver a cargar</button></div></div>';
    $('#retry').addEventListener('click',load);
  }).finally(()=>{activeLoad=null});
  return activeLoad;
}
function bind(group,key,attr){$$(group+' .chip').forEach(b=>b.addEventListener('click',()=>{state[key]=b.dataset[attr];$$(group+' .chip').forEach(x=>x.classList.toggle('active',x===b));render()}))}
bind('#people','person','person');bind('#sports','sport','sport');bind('#place','place','place');
if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').then(reg=>reg.update()).catch(()=>{});
load();
