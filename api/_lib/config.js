export const SOURCES = [
  {
    id: 'rfedh_u15',
    label: 'U15 Hielo · Majadahonda',
    source: 'RFEDH',
    sport: 'ice',
    competition: 'Liga Nacional Hockey Hielo U15',
    players: ['andres', 'gaston'],
    officialUrl: 'https://www.hockey.fedhielo.com/league/3657',
    mirrorUrl: 'https://hockeyapp.es/hockey-hielo/26-27/liga-nacional-hockey-hielo-u15/fedhielo_3657',
    aliases: ['LA NEVERA', 'LA NEVERA MAJADAHONDA', 'MAJADAHONDA'],
    teams: ['CDH BIPOLO','CHH TXURI URDIN IHT','CH JACA','LA NEVERA','LA NEVERA MAJADAHONDA','MILENIO PANTHERS','BARÇA HOCKEY GEL','CG PUIGCERDA','KOSNER HUARTE','QUIMERAS VALDEMORO']
  },
  {
    id: 'fmp_infantil',
    label: 'Infantil Madrileña · Las Rozas',
    source: 'FMP',
    sport: 'line',
    competition: 'Liga Infantil 1',
    players: ['andres'],
    officialUrl: 'https://www.hockeylinea.fmp.es/league/4798',
    mirrorUrl: 'https://hockeyapp.es/hockey-linea/26-27/liga-infantil-1/fmp_4798',
    aliases: ['LAS ROZAS'],
    teams: ['TRES CANTOS A','CPLM A','LAS ROZAS','MAMUTS A','PINGÜINOS A','PUMAS'],
    venues: ['CENTRO DEPORTIVO LAURA OTER','CENTRO DEP. MUN. FRANCISCO FDEZ. OCHOA','CENTRO DE PATINAJE LAS ROZAS','I.D. MUN. BASICA LOS ROSALES','INST. DEPORT. MUNICIPAL LAS TABLAS','POLIDEPORTIVO MUNICIPAL GALAPAGAR','A DESIGNAR']
  },
  {
    id: 'rfep_infantil_oro',
    label: 'Infantil Oro · Las Rozas',
    source: 'RFEP',
    sport: 'line',
    competition: 'Liga Oro Infantil',
    players: ['andres'],
    officialUrl: 'https://www.hockeylinea.fep.es/league/3609',
    mirrorUrl: 'https://hockeyapp.es/hockey-linea/26-27/liga-oro-infantil/rfep_3609',
    aliases: ['JOKER FLOORS LAS ROZAS', 'LAS ROZAS'],
    teams: ['SAB TUCANS ASME','METROPOLITANO HC','BURDINOLA IK','JOKER FLOORS LAS ROZAS','PUMAS DEL NORTE','ESPANYA HOQUEI CLUB','CHL TROYANOS','CHL TROYANOS VILLARROBLEDO','CPL VALLADOLID','DRAGONS EL PUIG','CE GADEX LA QUINTA RUEDA','ROLLING LEMONS VALLADOLID','BARCELONA TSUNAMIS']
  }
];

export const OFFICIAL_HINTS = [
  {sourceId:'rfedh_u15', date:'2026-10-03', home:'CH JACA', away:'LA NEVERA', time:'13:00'}
];

export const CALENDAR_EXTRAS = [
  {id:'cal-u13-jaca-20261010',sourceId:'calendar',source:'Calendar',special:true,title:'Festival U13 · Jaca · Gastón',competition:'Festival U13',sport:'ice',players:['gaston'],date:'2026-10-10',endDate:'2026-10-11',time:null,place:'away',venue:'Jaca'},
  {id:'cal-boston-prep-20261011',sourceId:'calendar',source:'Calendar',competition:'AROK Boston U17 · Preparación',sport:'ice',players:['andres'],date:'2026-10-11',time:'19:30',home:'AROK Boston U17',away:'Majadahonda U18',place:'home',venue:'Majadahonda'},
  {id:'cal-boston-prep-20261012',sourceId:'calendar',source:'Calendar',competition:'AROK Boston U17 · Preparación',sport:'ice',players:['andres'],date:'2026-10-12',time:'11:00',home:'AROK Boston U17',away:'Majadahonda U18',place:'home',venue:'Majadahonda'},
  {id:'cal-int-cup-20261031',sourceId:'calendar',source:'Calendar',special:true,title:'International Cup U15 · Donosti',competition:'International Cup U15 by Karlos Gordovil',sport:'ice',players:['andres','gaston'],date:'2026-10-31',endDate:'2026-11-01',time:null,place:'away',venue:'Donostia-San Sebastián'},
  {id:'cal-boston-friendly-20261201',sourceId:'calendar',source:'Calendar',competition:'AROK Boston U17 · Amistoso',sport:'ice',players:['andres'],date:'2026-12-01',time:null,home:'AROK Boston U17',away:'North Shore Academy',place:'away',venue:'Boston, Massachusetts'},
  {id:'cal-boston-tournament-20261204',sourceId:'calendar',source:'Calendar',special:true,title:'Boston · Torneo · 4 partidos',competition:'AROK Boston U17 · Torneo',sport:'ice',players:['andres'],date:'2026-12-04',endDate:'2026-12-06',time:null,place:'away',venue:'Boston, Massachusetts'}
];

export const MANUAL_GAMES = [];
