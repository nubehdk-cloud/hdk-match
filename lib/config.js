const ice = {sport:'ice',federation:'RFEDH',aliases:['LA NEVERA','MAJADAHONDA']};
const line = {sport:'line'};
export const SOURCES = [
  {...ice,id:'rfedh_u15',calendarKey:'rfedh_u15',label:'U15 Hielo · Majadahonda',competition:'Liga Nacional Hockey Hielo U15',players:['andres','gaston'],leagueId:'3657',url:'https://www.hockey.fedhielo.com/league/3657',heading:'LIGA NACIONAL HOCKEY HIELO U15'},
  {...ice,id:'rfedh_u18',calendarKey:'rfedh_u18',label:'U18 Hielo · Majadahonda',competition:'Liga Nacional Hockey Hielo U18',players:['andres'],leagueId:'3646',url:'https://www.hockey.fedhielo.com/league/3646',heading:'LIGA NACIONAL HOCKEY HIELO U18',requiresCallup:true},
  {...line,id:'fmp_infantil',calendarKey:'fmp_infantil',label:'Infantil Madrileña · Las Rozas',competition:'Liga Infantil 1 · Madrileña',players:['andres'],leagueId:'4798',federation:'FMP',aliases:['LAS ROZAS'],url:'https://www.hockeylinea.fmp.es/league/4798?liga=4798&vista=calendar',heading:'LIGA INFANTIL 1'},
  {...line,id:'fmp_infantil_pumas',calendarKey:'fmp_infantil',label:'Infantil Madrileña · Pumas Galapagar',competition:'Liga Infantil 1 · Madrileña',players:['gaston'],leagueId:'4798',federation:'FMP',aliases:['PUMAS'],url:'https://www.hockeylinea.fmp.es/league/4798?liga=4798&vista=calendar',heading:'LIGA INFANTIL 1'},
  {...line,id:'fmp_juvenil',calendarKey:'fmp_juvenil',label:'Juvenil Madrileña · Las Rozas',competition:'Liga Juvenil · Madrileña',players:['andres'],leagueId:'4799',federation:'FMP',aliases:['LAS ROZAS'],url:'https://www.hockeylinea.fmp.es/league/4798?liga=4799&vista=calendar',heading:'LIGA JUVENIL'},
  {...line,id:'rfep_infantil_oro',calendarKey:'rfep_infantil_oro',label:'Infantil Oro · Las Rozas',competition:'Liga Oro Infantil',players:['andres'],leagueId:'3609',federation:'RFEP',aliases:['LAS ROZAS'],url:'https://www.hockeylinea.fep.es/league/3609?liga=3609&vista=calendar',heading:'LIGA ORO INFANTIL'},
  {...line,id:'rfep_infantil_oro_pumas',calendarKey:'rfep_infantil_oro',label:'Infantil Oro · Pumas Galapagar',competition:'Liga Oro Infantil',players:['gaston'],leagueId:'3609',federation:'RFEP',aliases:['PUMAS DEL NORTE'],url:'https://www.hockeylinea.fep.es/league/3609?liga=3609&vista=calendar',heading:'LIGA ORO INFANTIL'}
];
export const MANUAL_GAMES=[];
// User excluded this U18 fixture on 16 November: Andrés is not called up.
export const EXCLUSIONS=[{sourceId:'rfedh_u18',matchId:'837',date:'2026-11-21',home:'CH JACA',away:'LA NEVERA'}];
