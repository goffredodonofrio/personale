# -*- coding: utf-8 -*-
"""Notifiche di casa sul telefono (app ntfy), ogni sera alle 19 per il giorno dopo.

Due canali, con nomi segreti passati da GitHub come segreti (mai scritti nel repo):
  NTFY_CASA  -> spazzatura da mettere fuori stasera + impegni di domani dal Calendario famiglia
  NTFY_SOLDI -> scadenze sopra i 500 € (domani, tra 3 giorni, tra 7 se sopra i 5.000 €)
SCADENZE e' un JSON preparato sul Mac da _stile/notifiche.py leggendo Soldi di casa (che sul sito e' cifrata).

Prova a mano (senza mandare niente):  python3 notifiche/manda.py --secco [--giorno 2026-10-06]
"""
import os, sys, json, urllib.request, datetime as dt
from zoneinfo import ZoneInfo

ROMA = ZoneInfo('Europe/Rome')
QUI = os.path.dirname(os.path.abspath(__file__)); RADICE = os.path.dirname(QUI)
SECCO = '--secco' in sys.argv
GIORNI = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica']
MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
RIFIUTI = {'organico': 'organico', 'carta': 'carta', 'vetro': 'vetro', 'plastica': 'plastica',
           'indifferenziato': 'indifferenziato', 'sfalci': 'sfalci (se attivati)'}

def eur(v): return '{:,.0f}'.format(v).replace(',', '.') + ' €'
def data_lunga(d): return f'{GIORNI[d.weekday()]} {d.day} {MESI[d.month - 1]}'
def elenco(xs): return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' e ' + xs[-1]

# ------------------------------------------------------------------ quando
adesso = dt.datetime.now(ROMA)
if '--giorno' in sys.argv:
    oggi = dt.date.fromisoformat(sys.argv[sys.argv.index('--giorno') + 1]) - dt.timedelta(1)
else:
    oggi = adesso.date()
    # GitHub lavora in UTC: ci sono due orari (17 e 18 UTC) e si tiene solo quello che a Roma fa le 19
    prog = os.environ.get('SCHEDULE', '').split()
    if prog and len(prog) >= 2:
        ora_utc = int(prog[1]); scarto = int(adesso.utcoffset().total_seconds() // 3600)
        if ora_utc + scarto != 19:
            print('orario non valido con l\'ora attuale di Roma, salto'); sys.exit(0)
domani = oggi + dt.timedelta(1)

# ------------------------------------------------------------------ spazzatura
def rifiuti():
    R = json.load(open(os.path.join(QUI, 'rifiuti.json'), encoding='utf-8'))
    fino = dt.date.fromisoformat(R['valido_fino'])
    if domani > fino:
        if domani.weekday() == 0 or domani == fino + dt.timedelta(1):
            return None, f'Il calendario dei rifiuti è finito il {fino.day}/{fino.month}: serve quello nuovo di S.E.T.A.'
        return None, None
    t = R['raccolta'].get(domani.isoformat(), [])
    return ([RIFIUTI.get(x, x) for x in t] or None), None

# ------------------------------------------------------------------ calendario famiglia (stessa logica della pagina)
KIDS = {'edo': 'Edoardo', 'bia': 'Bianca'}
SLOT = [('gym', 'Palestra', 'gym'), ('m', 'Accompagnamento', 'drop'), ('p', 'Ritiro', 'pick'), ('s', 'Sera', 'eve')]

def calendario():
    S = json.load(open(os.path.join(RADICE, 'calendario', 'dati.json'), encoding='utf-8'))
    persone = {p['id']: p['name'] for p in S.get('people', [])}; persone.update(KIDS)
    def W(v):
        if isinstance(v, dict):
            by = [x for x in v.get('by', []) if x not in KIDS]
            wi = [x for x in v.get('with', []) + [x for x in v.get('by', []) if x in KIDS] if x not in by]
            return by, wi
        if v == 'both': return ['gof', 'caro'], []
        if isinstance(v, str) and v.startswith('k:'):
            return [], (['edo', 'bia'] if v == 'k:both' else [v[2:]])
        return ([v] if v else []), []
    def chi(v):
        by, wi = W(v)
        n = lambda ids: elenco([persone.get(i, i) for i in ids]) if ids else ''
        t = n(by)
        if wi: t = (t + ' con ' if t else 'per ') + n(wi)
        return t
    lun = domani - dt.timedelta(domani.weekday()); i = domani.weekday()
    sett = S.get('weeks', {}).get(lun.isoformat(), {})
    gg = sett.get('days', {}).get(domani.isoformat(), {}) or {}
    O, R = gg.get('t', {}) or {}, gg.get('r', {}) or {}
    T = dict(S.get('times', {})); WT = {'edo': T.get('edo'), 'bia': T.get('bia')}; WT.update(sett.get('times', {}) or {})
    ev = []
    if i < 5:
        for k, titolo, tk in SLOT:
            r = R.get(k, {}) or {}; who = r.get('who', '')
            if k == 'gym' and not any(W(who)): continue
            std = {'gym': T.get('gym'), 'm': T.get('drop'), 'p': min(WT['edo'], WT['bia']), 's': T.get('eve')}[k]
            sub = ''
            if k == 'p': sub = f"uscita {WT['edo']}" if WT['edo'] == WT['bia'] else f"Edoardo {WT['edo']}, Bianca {WT['bia']}"
            ev.append((O.get(tk) or std, r.get('title') or titolo, r.get('sub', sub), chi(who) or 'chi? da decidere'))
    for r in S.get('recurring', []):
        if i in (r.get('days') or []) and (r.get('freq') != 'monthly' or domani.day <= 7):
            ev.append((O.get('rec:' + r['id']) or r.get('time') or '', r['title'], r.get('sub', ''), chi(r.get('who', ''))))
    for e in gg.get('extra', []) or []:
        ev.append((e.get('time') or '', e.get('title', ''), e.get('sub', ''), chi(e.get('who', ''))))
    ev.sort(key=lambda e: e[0] or '99:99')
    righe = []
    for ora, titolo, sub, who in ev:
        r = (ora + '  ' if ora else '') + titolo
        if who: r += ' · ' + who
        if sub and titolo in ('Ritiro',): r += f' ({sub})'
        righe.append(r)
    nota = (gg.get('note') or '').strip()
    return righe, nota

# ------------------------------------------------------------------ scadenze sopra i 500 €
def scadenze():
    raw = os.environ.get('SCADENZE', '')
    if not raw: return None
    D = json.loads(raw); righe = []; forte = False
    for x in D.get('date', []):
        d = dt.date.fromisoformat(x['d']); n = (d - oggi).days
        if n == 1 or n == 3 or (n == 7 and x['tot'] >= 5000):
            quando = 'domani' if n == 1 else f'tra {n} giorni'
            voci = ' · '.join(f"{v['l']} {'≈ ' if v['stima'] else ''}{eur(v['v'])} ({v['da']})" for v in x['voci'])
            righe.append(f"{quando.capitalize()}, {data_lunga(d)}: {eur(x['tot'])}\n{voci}")
            forte |= (n == 1 and x['tot'] >= 5000)
    fino = dt.date.fromisoformat(D['fino']); agg = dt.date.fromisoformat(D['aggiornato'])
    avviso = None
    if domani.weekday() == 0 and ((fino - oggi).days < 21 or (oggi - agg).days > 45):
        avviso = f'Le scadenze sono ferme al {agg.day}/{agg.month}: aggiorna Soldi di casa.'
    return righe, forte, avviso

# ------------------------------------------------------------------ invio
SITO = 'https://goffredodonofrio.github.io/personale/'

def manda(canale, titolo, testo, tag, priorita=3, apri=None):
    topic = os.environ.get(canale, '')
    corpo = {'topic': topic, 'title': titolo, 'message': testo, 'tags': [tag], 'priority': priorita}
    if apri: corpo['click'] = SITO + apri   # toccando la notifica si apre la pagina giusta
    if os.environ.get('PROVA') == 'true': corpo['title'] = '[prova] ' + titolo
    if SECCO:
        print(f'--- {canale}\n{corpo["title"]}\n{testo}\n'); return
    # il repo e' pubblico e i log di GitHub si leggono: qui non si stampa mai il testo dei messaggi
    if not topic:
        print(f'manca il segreto {canale}: niente inviato'); return
    req = urllib.request.Request('https://ntfy.sh/', data=json.dumps(corpo).encode(), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=20) as r: print(canale, r.status)

testa = 'Domani, ' + data_lunga(domani)
fuori, avviso_r = rifiuti()
righe, nota = calendario()
corpo = []
if fuori: corpo.append('🗑 Stasera fuori: ' + elenco(fuori))
if avviso_r: corpo.append('⚠️ ' + avviso_r)
if righe: corpo += ([''] if corpo else []) + righe
if nota: corpo.append('📝 ' + nota)
if corpo:
    manda('NTFY_CASA', ('🗑 ' if fuori else '') + testa, '\n'.join(corpo), 'wastebasket' if fuori else 'calendar',
          apri=f'calendario-famiglia.html?vista=giorno&giorno={domani.isoformat()}')

S = scadenze()
if S:
    R, forte, avviso = S
    if not R and not avviso and os.environ.get('PROVA') == 'true':
        # in prova il canale soldi parla comunque: dice la prossima scadenza
        D = json.loads(os.environ['SCADENZE']); pross = next((x for x in D['date'] if dt.date.fromisoformat(x['d']) > oggi), None)
        if pross:
            d = dt.date.fromisoformat(pross['d'])
            R = [f"Nessuna scadenza nei prossimi giorni. La prossima: {data_lunga(d)}, {eur(pross['tot'])}\n"
                 + ' · '.join(f"{v['l']} {eur(v['v'])} ({v['da']})" for v in pross['voci'])]
    if R or avviso:
        testo = '\n\n'.join(R + (['⚠️ ' + avviso] if avviso else []))
        manda('NTFY_SOLDI', 'Scadenze sopra 500 €' if R else 'Soldi di casa', testo, 'euro', 5 if forte else 4 if R else 3, apri='soldi-di-casa.html')
