export const SOURCES = [
  {
    id: 'rfedh_u15',
    label: 'U15 Hielo · Majadahonda',
    sport: 'ice',
    competition: 'Liga Nacional Hockey Hielo U15',
    players: ['andres', 'gaston'],
    leagueId: '3657',
    website: 'https://www.hockey.fedhielo.com',
    origin: 'http://www.hockey.fedhielo.com',
    aliases: ['LA NEVERA', 'LA NEVERA MAJADAHONDA', 'MAJADAHONDA'],
    candidates: [
      {folder:'fedhielo',prefix:'fedhielo',idm:2},
      {folder:'fedhielo',prefix:'fedhielo',idm:1},
      {folder:'rfedh',prefix:'rfedh',idm:2},
      {folder:'rfedh',prefix:'rfedh',idm:1},
      {folder:'fedh',prefix:'fedh',idm:2},
      {folder:'fedh',prefix:'fedh',idm:1}
    ]
  },
  {
    id: 'fmp_infantil',
    label: 'Infantil Madrileña · Las Rozas',
    sport: 'line',
    competition: 'Liga Infantil 1',
    players: ['andres'],
    leagueId: '4798',
    website: 'https://www.hockeylinea.fmp.es',
    origin: 'http://www.hockeylinea.fmp.es',
    aliases: ['LAS ROZAS'],
    candidates: [
      {folder:'fmp',prefix:'fmp',idm:2},
      {folder:'fmp',prefix:'fmp',idm:1}
    ]
  },
  {
    id: 'rfep_infantil_oro',
    label: 'Infantil Oro · Las Rozas',
    sport: 'line',
    competition: 'Liga Oro Infantil',
    players: ['andres'],
    leagueId: '3769',
    website: 'https://www.hockeylinea.fep.es',
    origin: 'http://www.hockeylinea.fep.es',
    aliases: ['JOKER FLOORS LAS ROZAS', 'LAS ROZAS'],
    candidates: [
      {folder:'rfep',prefix:'rfep',idm:2},
      {folder:'rfep',prefix:'rfep',idm:1}
    ]
  }
];

// Solo eventos deportivos especiales que no proceden de las federaciones.
// La liga oficial nunca se sustituye con datos de Calendar.
export const CALENDAR_EXTRAS = [
  {
    id:'cal-u13-jaca-20261010',
    sourceId:'calendar',
    source:'Calendar',
    special:true,
    title:'Festival U13 · Jaca · Gastón',
    competition:'Festival U13',
    sport:'ice',
    players:['gaston'],
    date:'2026-10-10',
    endDate:'2026-10-11',
    time:null,
    place:'away',
    venue:'Jaca'
  },
  {
    id:'cal-boston-prep-20261011',
    sourceId:'calendar',
    source:'Calendar',
    competition:'AROK Boston U17 · Preparación',
    sport:'ice',
    players:['andres'],
    date:'2026-10-11',
    time:'19:30',
    home:'AROK Boston U17',
    away:'Majadahonda U18',
    place:'home',
    venue:'Majadahonda'
  },
  {
    id:'cal-boston-prep-20261012',
    sourceId:'calendar',
    source:'Calendar',
    competition:'AROK Boston U17 · Preparación',
    sport:'ice',
    players:['andres'],
    date:'2026-10-12',
    time:'11:00',
    home:'AROK Boston U17',
    away:'Majadahonda U18',
    place:'home',
    venue:'Majadahonda'
  },
  {
    id:'cal-int-cup-20261031',
    sourceId:'calendar',
    source:'Calendar',
    special:true,
    title:'International Cup U15 · Donosti',
    competition:'International Cup U15 by Karlos Gordovil',
    sport:'ice',
    players:['andres','gaston'],
    date:'2026-10-31',
    endDate:'2026-11-01',
    time:null,
    place:'away',
    venue:'Donostia-San Sebastián'
  },
  {
    id:'cal-boston-friendly-20261201',
    sourceId:'calendar',
    source:'Calendar',
    competition:'AROK Boston U17 · Amistoso',
    sport:'ice',
    players:['andres'],
    date:'2026-12-01',
    time:null,
    home:'AROK Boston U17',
    away:'North Shore Academy',
    place:'away',
    venue:'Boston, Massachusetts'
  },
  {
    id:'cal-boston-tournament-20261204',
    sourceId:'calendar',
    source:'Calendar',
    special:true,
    title:'Boston · Torneo · 4 partidos',
    competition:'AROK Boston U17 · Torneo',
    sport:'ice',
    players:['andres'],
    date:'2026-12-04',
    endDate:'2026-12-06',
    time:null,
    place:'away',
    venue:'Boston, Massachusetts'
  }
];

export const MANUAL_GAMES = [];
