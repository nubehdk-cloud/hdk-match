export const SOURCES = [
  {
    id: 'rfedh_u15', label: 'U15 Hielo · Majadahonda', sport: 'ice', competition: 'Liga Nacional Hockey Hielo U15',
    players: ['andres', 'gaston'], leagueId: '3657', website: 'https://www.hockey.fedhielo.com', origin: 'http://www.hockey.fedhielo.com',
    aliases: ['LA NEVERA', 'LA NEVERA MAJADAHONDA', 'MAJADAHONDA'],
    candidates: [
      {folder:'fedhielo',prefix:'fedhielo',idm:2},{folder:'fedhielo',prefix:'fedhielo',idm:1},
      {folder:'rfedh',prefix:'rfedh',idm:2},{folder:'rfedh',prefix:'rfedh',idm:1},
      {folder:'fedh',prefix:'fedh',idm:2},{folder:'fedh',prefix:'fedh',idm:1}
    ]
  },
  {
    id: 'fmp_infantil', label: 'Infantil Madrileña · Las Rozas', sport: 'line', competition: 'Liga Infantil 1',
    players: ['andres'], leagueId: '4798', website: 'https://www.hockeylinea.fmp.es', origin: 'http://www.hockeylinea.fmp.es',
    aliases: ['LAS ROZAS'], candidates: [{folder:'fmp',prefix:'fmp',idm:2},{folder:'fmp',prefix:'fmp',idm:1}]
  },
  {
    id: 'rfep_infantil_oro', label: 'Infantil Oro · Las Rozas', sport: 'line', competition: 'Liga Oro Infantil',
    players: ['andres'], leagueId: '3769', website: 'https://www.hockeylinea.fep.es', origin: 'http://www.hockeylinea.fep.es',
    aliases: ['JOKER FLOORS LAS ROZAS', 'LAS ROZAS'], candidates: [{folder:'rfep',prefix:'rfep',idm:2},{folder:'rfep',prefix:'rfep',idm:1}]
  }
];

// Calendario de respaldo: solo se usa si una fuente oficial no devuelve ningún partido futuro.
// En cuanto la fuente vuelve a devolver futuros, estos partidos dejan de usarse.
export const FALLBACK_GAMES = [
  {id:'fb-ice-20261003',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2026-10-03',time:null,home:'CH Jaca',away:'Majadahonda',venue:null},
  {id:'fb-fmp-20261004',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2026-10-04',time:'17:00',home:'Tres Cantos A',away:'Las Rozas',venue:'Centro Deportivo Laura Oter'},
  {id:'fb-fmp-20261017',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2026-10-17',time:'14:15',home:'Mamuts A',away:'Las Rozas',venue:null},
  {id:'fb-ice-20261018',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2026-10-18',time:'14:45',home:'Barça Hockey Gel',away:'Majadahonda',venue:null},
  {id:'fb-rfep-20261024a',sourceId:'rfep_infantil_oro',source:'RFEP',competition:'Liga Oro Infantil',sport:'line',players:['andres'],date:'2026-10-24',time:null,home:'Burdinola IK',away:'Joker Floors Las Rozas',venue:null},
  {id:'fb-rfep-20261024b',sourceId:'rfep_infantil_oro',source:'RFEP',competition:'Liga Oro Infantil',sport:'line',players:['andres'],date:'2026-10-24',time:null,home:'Joker Floors Las Rozas',away:'Pumas del Norte',venue:null},
  {id:'fb-ice-20261107',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2026-11-07',time:null,home:'Quimeras Valdemoro',away:'Majadahonda',venue:null},
  {id:'fb-ice-20261114',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2026-11-14',time:null,home:'Majadahonda',away:'Quimeras Valdemoro',venue:null},
  {id:'fb-fmp-20261114',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2026-11-14',time:null,home:'Las Rozas',away:'Pumas',venue:'Centro de Patinaje Las Rozas'},
  {id:'fb-ice-20261121',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2026-11-21',time:null,home:'Majadahonda',away:'Kosner Huarte',venue:null},
  {id:'fb-fmp-20261121',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2026-11-21',time:null,home:'CPLM A',away:'Las Rozas',venue:null},
  {id:'fb-fmp-20261128',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2026-11-28',time:null,home:'Pingüinos A',away:'Las Rozas',venue:null},
  {id:'fb-ice-20261205',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2026-12-05',time:null,home:'Majadahonda',away:'Barça Hockey Gel',venue:null},
  {id:'fb-fmp-20261212',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2026-12-12',time:null,home:'Las Rozas',away:'Tres Cantos A',venue:'Centro de Patinaje Las Rozas'},
  {id:'fb-rfep-20261219a',sourceId:'rfep_infantil_oro',source:'RFEP',competition:'Liga Oro Infantil',sport:'line',players:['andres'],date:'2026-12-19',time:null,home:'Joker Floors Las Rozas',away:'Metropolitano HC',venue:null},
  {id:'fb-rfep-20261219b',sourceId:'rfep_infantil_oro',source:'RFEP',competition:'Liga Oro Infantil',sport:'line',players:['andres'],date:'2026-12-19',time:null,home:'Espanya Hoquei Club',away:'Joker Floors Las Rozas',venue:null},
  {id:'fb-rfep-20261220',sourceId:'rfep_infantil_oro',source:'RFEP',competition:'Liga Oro Infantil',sport:'line',players:['andres'],date:'2026-12-20',time:null,home:'Joker Floors Las Rozas',away:'SAB Tucans ASME',venue:null},
  {id:'fb-ice-20270109',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2027-01-09',time:null,home:'Majadahonda',away:'CDH Bipolo',venue:null},
  {id:'fb-ice-20270116',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2027-01-16',time:null,home:'Majadahonda',away:'Milenio Panthers',venue:null},
  {id:'fb-fmp-20270116',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2027-01-16',time:null,home:'Las Rozas',away:'Mamuts A',venue:'Centro de Patinaje Las Rozas'},
  {id:'fb-ice-20270123',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2027-01-23',time:null,home:'Majadahonda',away:'CH Jaca',venue:null},
  {id:'fb-fmp-20270123',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2027-01-23',time:null,home:'Pumas',away:'Las Rozas',venue:null},
  {id:'fb-ice-20270130',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2027-01-30',time:null,home:'Kosner Huarte',away:'Majadahonda',venue:null},
  {id:'fb-ice-20270207',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2027-02-07',time:null,home:'CG Puigcerdà',away:'Majadahonda',venue:null},
  {id:'fb-ice-20270214',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2027-02-14',time:null,home:'Majadahonda',away:'Txuri Urdin',venue:null},
  {id:'fb-ice-20270220',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2027-02-20',time:null,home:'Txuri Urdin',away:'Majadahonda',venue:null},
  {id:'fb-fmp-20270220',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2027-02-20',time:null,home:'Las Rozas',away:'Pingüinos A',venue:'Centro de Patinaje Las Rozas'},
  {id:'fb-ice-20270306',sourceId:'rfedh_u15',source:'RFEDH',competition:'Liga Nacional Hockey Hielo U15',sport:'ice',players:['andres','gaston'],date:'2027-03-06',time:null,home:'Majadahonda',away:'CG Puigcerdà',venue:null},
  {id:'fb-fmp-20270313',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2027-03-13',time:null,home:'Tres Cantos A',away:'Las Rozas',venue:null},
  {id:'fb-fmp-20270403',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2027-04-03',time:null,home:'Mamuts A',away:'Las Rozas',venue:null},
  {id:'fb-fmp-20270410',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2027-04-10',time:null,home:'Las Rozas',away:'Pumas',venue:'Centro de Patinaje Las Rozas'},
  {id:'fb-fmp-20270417',sourceId:'fmp_infantil',source:'FMP',competition:'Liga Infantil 1',sport:'line',players:['andres'],date:'2027-04-17',time:null,home:'CPLM A',away:'Las Rozas',venue:null}
];

// Excepciones añadidas manualmente cuando no están en las federaciones.
export const MANUAL_GAMES = [];
