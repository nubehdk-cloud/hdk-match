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
    teams: ['CDH BIPOLO','CHH TXURI URDIN IHT','CH JACA','LA NEVERA MAJADAHONDA','LA NEVERA','MILENIO PANTHERS','BARÇA HOCKEY GEL','CG PUIGCERDA','KOSNER HUARTE','QUIMERAS VALDEMORO'],
    venues: [],
    candidates: [
      {folder:'fedhielo',prefix:'fedhielo',idm:31},
      {folder:'rfedh',prefix:'rfedh',idm:31},
      {folder:'fedh',prefix:'fedh',idm:31},
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
    teams: ['TRES CANTOS A','CPLM A','LAS ROZAS','MAMUTS A','PINGÜINOS A','PUMAS'],
    venues: ['CENTRO DEPORTIVO LAURA OTER','CENTRO DEP. MUN. FRANCISCO FDEZ. OCHOA','CENTRO DE PATINAJE LAS ROZAS','I.D. MUN. BASICA LOS ROSALES','INST. DEPORT. MUNICIPAL LAS TABLAS','POLIDEPORTIVO MUNICIPAL GALAPAGAR','A DESIGNAR'],
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
    teams: ['SAB TUCANS ASME','METROPOLITANO HC','BURDINOLA IK','JOKER FLOORS LAS ROZAS','PUMAS DEL NORTE','ESPANYA HOQUEI CLUB','CHL TROYANOS VILLARROBLEDO','CHL TROYANOS','CPL VALLADOLID','DRAGONS EL PUIG','CE GADEX LA QUINTA RUEDA','ROLLING LEMONS VALLADOLID','BARCELONA TSUNAMIS'],
    venues: [],
    candidates: [
      {folder:'rfep',prefix:'rfep',idm:2},
      {folder:'rfep',prefix:'rfep',idm:1}
    ]
  }
];


// Gastón juega hockey línea con Pumas de Galapagar únicamente en categoría Infantil.
// Mantenemos las fuentes de Las Rozas de Andrés sin modificaciones.
SOURCES.push(
  {
    ...SOURCES.find(s=>s.id==='fmp_infantil'),
    id:'fmp_infantil_pumas',
    label:'Infantil Madrileña · Pumas Galapagar',
    competition:'Liga Infantil 1 · Madrileña',
    players:['gaston'],
    aliases:['PUMAS','PUMAS GALAPAGAR','PUMAS DEL NORTE'],
  },
  {
    ...SOURCES.find(s=>s.id==='rfep_infantil_oro'),
    id:'rfep_infantil_oro_pumas',
    label:'Infantil Oro · Pumas Galapagar',
    players:['gaston'],
    aliases:['PUMAS DEL NORTE','PUMAS GALAPAGAR'],
  }
);

// Los eventos deportivos especiales se sincronizan en data/calendar-events.json.
// Los encuentros de liga se obtienen exclusivamente de SOURCES (federaciones).

export const MANUAL_GAMES = [];
