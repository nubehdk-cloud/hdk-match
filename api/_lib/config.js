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
    leagueId: '3609',
    website: 'https://www.hockeylinea.fep.es',
    origin: 'http://www.hockeylinea.fep.es',
    aliases: ['JOKER FLOORS LAS ROZAS', 'LAS ROZAS'],
    candidates: [
      {folder:'rfep',prefix:'rfep',idm:2},
      {folder:'rfep',prefix:'rfep',idm:1}
    ]
  }
];

// Solo eventos especiales tomados del Google Calendar principal.
// Los partidos de liga NO se importan del Calendar: siempre vienen de la federación.
export const CALENDAR_EXTRAS = [
  {
    id:'cal-04icpd1l3q3d6bqcb74c3dl88k',
    calendarEventId:'04icpd1l3q3d6bqcb74c3dl88k',
    sourceId:'calendar', source:'Calendar', special:true,
    title:'U13 Jaca · Gastón', competition:'Festival U13',
    sport:'ice', players:['gaston'],
    date:'2026-10-10', endDate:'2026-10-11',
    time:null, place:'away', venue:'Jaca'
  },
  {
    id:'cal-6t541j0voidl23nmim1sf965o4',
    calendarEventId:'6t541j0voidl23nmim1sf965o4',
    sourceId:'calendar', source:'Calendar', special:true,
    title:'AROK Boston U17 · Preparación · Majadahonda',
    competition:'Preparación Boston', sport:'ice', players:['andres'],
    date:'2026-10-11', endDate:'2026-10-12',
    time:null, place:'home', venue:'Majadahonda'
  },
  {
    id:'cal-o6oqh8m150pa5a0n01m0dv4p8c',
    calendarEventId:'o6oqh8m150pa5a0n01m0dv4p8c',
    sourceId:'calendar', source:'Calendar', special:true,
    title:'International Cup U15 · Donosti · Andrés + Gastón',
    competition:'International Cup U15 by Karlos Gordovil',
    sport:'ice', players:['andres','gaston'],
    date:'2026-10-31', endDate:'2026-11-01',
    time:null, place:'away', venue:'Donostia-San Sebastián'
  },
  {
    id:'cal-qgcnp4chpcjtrcag9deihfn20s',
    calendarEventId:'qgcnp4chpcjtrcag9deihfn20s',
    sourceId:'calendar', source:'Calendar', special:true,
    title:'AROK · Boston · Viaje y torneo',
    competition:'AROK Boston U17',
    sport:'ice', players:['andres'],
    date:'2026-11-29', endDate:'2026-12-07',
    time:null, place:'away', venue:'Boston, Massachusetts'
  },
  {
    id:'cal-6v56eoggl1t4an0tjjc9vccdas',
    calendarEventId:'6v56eoggl1t4an0tjjc9vccdas',
    sourceId:'calendar', source:'Calendar', special:true,
    title:'Rungsted IK · Prueba Andrés · Porteros + U16',
    competition:'Prueba Rungsted IK',
    sport:'ice', players:['andres'],
    date:'2027-01-04', time:null, place:'away',
    venue:'Rungsted Ishockey Klub, Rungsted Kyst'
  },
  {
    id:'cal-odpp2qg05n6i5d5mlo2qeaqvcg',
    calendarEventId:'odpp2qg05n6i5d5mlo2qeaqvcg',
    sourceId:'calendar', source:'Calendar', special:true,
    title:'Rungsted IK · Prueba Andrés · U16',
    competition:'Prueba Rungsted IK',
    sport:'ice', players:['andres'],
    date:'2027-01-07', time:null, place:'away',
    venue:'Rungsted Ishockey Klub, Rungsted Kyst'
  }
];

export const MANUAL_GAMES = [];
