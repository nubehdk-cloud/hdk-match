#!/usr/bin/env python3
import json, re, sys
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data"/"official-games.json"

SOURCES=[
  {
    "id":"rfedh_u15","label":"U15 Hielo · Majadahonda","source":"RFEDH","sport":"ice",
    "competition":"Liga Nacional Hockey Hielo U15","players":["andres","gaston"],
    "url":"https://hockeyapp.es/hockey-hielo/26-27/liga-nacional-hockey-hielo-u15/fedhielo_3657",
    "officialUrl":"https://www.hockey.fedhielo.com/league/3657",
    "aliases":["LA NEVERA","LA NEVERA MAJADAHONDA","MAJADAHONDA"],
    "teams":["CDH BIPOLO","CHH TXURI URDIN IHT","CH JACA","LA NEVERA","LA NEVERA MAJADAHONDA","MILENIO PANTHERS","BARÇA HOCKEY GEL","CG PUIGCERDA","KOSNER HUARTE","QUIMERAS VALDEMORO"],
    "venues":[]
  },
  {
    "id":"fmp_infantil","label":"Infantil Madrileña · Las Rozas","source":"FMP","sport":"line",
    "competition":"Liga Infantil 1","players":["andres"],
    "url":"https://hockeyapp.es/hockey-linea/26-27/liga-infantil-1/las-rozas/2_fmp_2107",
    "officialUrl":"https://www.hockeylinea.fmp.es/league/4798",
    "aliases":["LAS ROZAS"],
    "teams":["TRES CANTOS A","CPLM A","LAS ROZAS","MAMUTS A","PINGÜINOS A","PUMAS"],
    "venues":["CENTRO DEPORTIVO LAURA OTER","CENTRO DEP. MUN. FRANCISCO FDEZ. OCHOA","CENTRO DE PATINAJE LAS ROZAS","I.D. MUN. BASICA LOS ROSALES","INST. DEPORT. MUNICIPAL LAS TABLAS","POLIDEPORTIVO MUNICIPAL GALAPAGAR","A DESIGNAR"]
  },
  {
    "id":"rfep_infantil_oro","label":"Infantil Oro · Las Rozas","source":"RFEP","sport":"line",
    "competition":"Liga Oro Infantil","players":["andres"],
    "url":"https://hockeyapp.es/hockey-linea/26-27/liga-oro-infantil/rfep_3609",
    "officialUrl":"https://www.hockeylinea.fep.es/league/3609",
    "aliases":["JOKER FLOORS LAS ROZAS","LAS ROZAS"],
    "teams":["SAB TUCANS ASME","METROPOLITANO HC","BURDINOLA IK","JOKER FLOORS LAS ROZAS","PUMAS DEL NORTE","ESPANYA HOQUEI CLUB","CHL TROYANOS","CHL TROYANOS VILLARROBLEDO","CPL VALLADOLID","DRAGONS EL PUIG","CE GADEX LA QUINTA RUEDA","ROLLING LEMONS VALLADOLID","BARCELONA TSUNAMIS"],
    "venues":[]
  }
]

HINTS=[
 {"sourceId":"rfedh_u15","date":"2026-10-03","home":"CH JACA","away":"LA NEVERA","time":"13:00"}
]

def norm(s):
    s=unescape(str(s or "")).upper()
    s=s.replace("Á","A").replace("É","E").replace("Í","I").replace("Ó","O").replace("Ú","U").replace("Ü","U").replace("Ñ","N")
    return re.sub(r"[^A-Z0-9]+"," ",s).strip()

def fetch_direct(url):
    req=Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; HdKMatchBot/1.1)","Accept":"text/html,application/xhtml+xml,text/plain"})
    with urlopen(req,timeout=25) as r:
        return r.read().decode("utf-8","replace")

def fetch_reader(url):
    reader="https://r.jina.ai/http://"+url.split("://",1)[1]
    req=Request(reader,headers={"User-Agent":"Mozilla/5.0 (compatible; HdKMatchBot/1.1)"})
    with urlopen(req,timeout=30) as r:
        return r.read().decode("utf-8","replace")

def to_text(raw):
    # Jina Reader returns Markdown; remove image markup and keep link labels.
    x=re.sub(r"!\[[^\]]*\]\([^)]*\)"," ",raw)
    x=re.sub(r"\[([^\]]+)\]\([^)]*\)",r"\1",x)
    x=re.sub(r"<script[\s\S]*?</script>"," ",x,flags=re.I)
    x=re.sub(r"<style[\s\S]*?</style>"," ",x,flags=re.I)
    x=re.sub(r"</?(?:br|p|div|li|section|article|h[1-6]|tr|td|th)[^>]*>","\n",x,flags=re.I)
    x=re.sub(r"<[^>]+>"," ",x)
    x=unescape(x)
    x=x.replace("🛡️"," ").replace("🛡"," ").replace("🏒"," ").replace("🏑"," ").replace("📅"," ")
    x=re.sub(r"[ \t]+"," ",x)
    x=re.sub(r"\n\s+","\n",x)
    x=re.sub(r"\n{2,}","\n",x)
    return x.strip()

def upcoming(text):
    m=re.search(r"Pr[oó]ximos Partidos",text,re.I)
    if m: text=text[m.end():]
    z=re.search(r"\n(?:Resultados|Clasificaci[oó]n|Equipos|Plantilla)\b",text,re.I)
    if z: text=text[:z.start()]
    return text

def season_date(ddmm):
    d,m=[int(x) for x in ddmm.split("/")]
    y=2026 if m>=8 else 2027
    return f"{y:04d}-{m:02d}-{d:02d}"

def target(home,away,aliases):
    h,a=norm(home),norm(away)
    return any(n in h or n in a or h in n or a in n for n in map(norm,aliases))

def apply_hint(g):
    for h in HINTS:
        if h["sourceId"]==g["sourceId"] and h["date"]==g["date"] and norm(h["home"])==norm(g["home"]) and norm(h["away"])==norm(g["away"]):
            if not g.get("time"): g["time"]=h.get("time")
            if not g.get("venue") and h.get("venue"): g["venue"]=h["venue"]
    return g

def parse_text(src, raw):
    text=upcoming(to_text(raw))
    teams=sorted(set(src["teams"]),key=len,reverse=True)
    alt="|".join(re.escape(x) for x in teams)
    pat=re.compile(rf"({alt})\s+({alt})\s+(\d{{1,2}}/\d{{1,2}})(?:\s+(\d{{1,2}}:\d{{2}}))?",re.I)
    games=[]
    for m in pat.finditer(text):
        home,away=m.group(1).strip(),m.group(2).strip()
        if not target(home,away,src["aliases"]): continue
        before=text[max(0,m.start()-160):m.start()]
        rounds=list(re.finditer(r"(?:JORNADA|G\s*J)\s*(\d+)",before,re.I))
        after=text[m.end():m.end()+180]
        venue=None
        na=norm(after)
        hits=[]
        for v in src.get("venues",[]):
            pos=na.find(norm(v))
            if pos>=0: hits.append((pos,v))
        if hits:
            venue=min(hits,key=lambda x:x[0])[1]
        g={
          "id":f'{src["id"]}:{season_date(m.group(3))}:{norm(home)}:{norm(away)}',
          "sourceId":src["id"],"source":src["source"],"sourceUrl":src["officialUrl"],
          "competition":src["competition"],"sport":src["sport"],"players":src["players"],
          "date":season_date(m.group(3)),"time":m.group(4) or None,
          "home":home,"away":away,"venue":venue,
          "round":f'Jornada {rounds[-1].group(1)}' if rounds else None,
          "official":True
        }
        games.append(apply_hint(g))
    return list({g["id"]:g for g in games}.values()), text

def parse_source(src):
    errors=[]
    for mode,fetcher in (("direct",fetch_direct),("reader",fetch_reader)):
        try:
            raw=fetcher(src["url"])
            games,text=parse_text(src,raw)
            if games:
                print(src["id"],"via",mode)
                return games
            errors.append(f"{mode}: 0 partidos; muestra={re.sub(r'\s+',' ',text)[:350]}")
        except Exception as e:
            errors.append(f"{mode}: {e}")
    raise RuntimeError(" | ".join(errors))

def main():
    all_games=[]; status=[]
    for src in SOURCES:
        try:
            games=parse_source(src)
            all_games.extend(games)
            status.append({"id":src["id"],"label":src["label"],"ok":True,"games":len(games)})
            print(src["id"],"OK",len(games))
        except Exception as e:
            status.append({"id":src["id"],"label":src["label"],"ok":False,"error":str(e)})
            print(src["id"],"ERROR",e,file=sys.stderr)
    payload={"games":sorted(all_games,key=lambda g:(g["date"],g.get("time") or "23:59")),"status":status}
    old={}
    if OUT.exists():
        try: old=json.loads(OUT.read_text())
        except Exception: pass
    comparable_old={"games":old.get("games",[]),"status":old.get("status",[])}
    if payload!=comparable_old:
        payload["updatedAt"]=datetime.now(timezone.utc).isoformat()
        OUT.parent.mkdir(parents=True,exist_ok=True)
        OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n")
        print("UPDATED")
    else:
        print("NO_CHANGE")
    if not any(s["ok"] for s in status):
        return 2
    return 0

if __name__=="__main__":
    raise SystemExit(main())
