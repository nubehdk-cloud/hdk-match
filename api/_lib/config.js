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

// Excepciones añadidas manualmente cuando no están en las federaciones.
export const MANUAL_GAMES = [];
