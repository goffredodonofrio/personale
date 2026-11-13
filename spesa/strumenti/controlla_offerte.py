# -*- coding: utf-8 -*-
"""Controlla spesa/offerte.json prima del push: forma dei dati, niente frutta e verdura, panoramica presente.

  python3 spesa/strumenti/controlla_offerte.py [spesa/offerte.json]

Esce con errore (codice 1) se qualcosa non va: in quel caso NON si fa il push.
"""
import sys, json, re, datetime as dt

REPARTI = {'pane', 'frigo', 'carne', 'dispensa', 'colazione', 'surgelati', 'bevande', 'pulizia', 'bucato', 'igiene', 'carta', 'bambini', 'farmacia', 'varie'}
NEGOZI = {'coop', 'ins'}
FRUTTA = re.compile(r'\b(arance|mele|pere|banane|kiwi|clementin|mandarin|uva|limoni|pomodor|insalat|lattug|carote|zucchin|patate|cipoll|zucca|radicchio|spinaci freschi|broccol|finocch|scalogno|prezzemolo|misticanza|songino|valeriana)\b', re.I)
DATA = re.compile(r'^\d{4}-\d{2}-\d{2}$')

f = sys.argv[1] if len(sys.argv) > 1 else 'spesa/offerte.json'
errori = []
try:
    D = json.load(open(f, encoding='utf-8'))
except Exception as e:
    sys.exit('JSON non valido: %s' % e)

oggi = dt.date.today().isoformat()
for k in ('aggiornato', 'volantini', 'offerte', 'marche', 'panoramica'):
    if k not in D: errori.append('manca il campo «%s»' % k)
for s, vs in (D.get('volantini') or {}).items():
    if s not in NEGOZI: errori.append('volantini: negozio sconosciuto %s' % s)
    for v in vs:
        if not (DATA.match(v.get('dal', '')) and DATA.match(v.get('al', ''))): errori.append('volantino %s senza date dal/al' % v.get('nome'))
n = {'coop': 0, 'ins': 0}
for i, o in enumerate(D.get('offerte', [])):
    dove = '#%d %s' % (i, o.get('n', '?'))
    if o.get('s') not in NEGOZI: errori.append(dove + ': negozio «s» non valido'); continue
    n[o['s']] += 1
    if o.get('cat') not in REPARTI: errori.append(dove + ': reparto «cat» non valido (%s)' % o.get('cat'))
    if not o.get('n'): errori.append(dove + ': manca il nome «n»')
    if o.get('v') is None and not o.get('linea'): errori.append(dove + ': manca il prezzo «v» (o «linea»: true per gli sconti su tutta la linea)')
    if o.get('v') is not None and not isinstance(o['v'], (int, float)): errori.append(dove + ': «v» deve essere un numero')
    if not DATA.match(o.get('al', '')): errori.append(dove + ': manca la data di fine «al»')
    if FRUTTA.search(o.get('n', '')) and o.get('cat') not in ('frigo', 'surgelati', 'dispensa'): errori.append(dove + ': sembra frutta o verdura (va esclusa)')
P = D.get('panoramica') or {}
if not P.get('punti') and not P.get('voci'): errori.append('panoramica: mancano le «voci» (o i «punti»)')
for v in P.get('voci', []):
    if v.get('vince') not in ('coop', 'ins', 'pari'): errori.append('panoramica: «vince» deve essere coop, ins o pari (%s)' % v.get('titolo'))
    if v.get('rep') not in REPARTI: errori.append('panoramica: reparto «rep» non valido (%s)' % v.get('titolo'))
    if not v.get('titolo'): errori.append('panoramica: voce senza «titolo»')
if P and not DATA.match(P.get('data', '')): errori.append('panoramica: manca la «data»')
if not n['coop']: errori.append('nessuna offerta Coop')
if not n['ins']: print('attenzione: nessuna offerta iN\'s (volantino scaduto o non trovato?)')

if errori:
    print('\n'.join('✗ ' + e for e in errori)); sys.exit(1)
print('✓ offerte.json a posto: %d Coop, %d iN\'s, %d voci nella panoramica' % (n['coop'], n['ins'], len(P.get('voci') or P.get('punti') or [])))
