# -*- coding: utf-8 -*-
"""Manda la panoramica della spesa sul canale ntfy Casa. La lancia l'azione GitHub spesa-panoramica.yml
quando arriva una spesa/offerte.json nuova con «[panoramica]» nel messaggio del commit.
Il nome del canale arriva dal segreto NTFY_CASA (mai scritto nel repo, mai stampato).

Prova a mano senza mandare niente:  python3 spesa/strumenti/notifica.py --secco
"""
import os, sys, json, urllib.request

SITO = 'https://goffredodonofrio.github.io/personale/spesa-famiglia.html'
D = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'offerte.json'), encoding='utf-8'))
P = D.get('panoramica') or {}
NEG = {'coop': 'Coop', 'ins': "iN's", 'pari': 'pari'}
punti = ([P['lista']] if P.get('lista') else []) + ['%s → %s: %s%s' % (v.get('titolo', ''), NEG.get(v.get('vince'), ''), v.get('prezzo', ''), (' · ' + v['testo']) if v.get('testo') else '') for v in (P.get('voci') or [])] or (P.get('punti') or [])
if not punti:
    print('panoramica vuota: niente da mandare'); sys.exit(0)
titolo = '🛒 ' + (P.get('titolo') or 'Spesa: cosa conviene questa settimana')
testo = '\n'.join('• ' + p for p in punti[:8])
if '--secco' in sys.argv:
    print(titolo + '\n' + testo); sys.exit(0)
topic = os.environ.get('NTFY_CASA', '')
if not topic:
    print('manca il segreto NTFY_CASA: niente inviato'); sys.exit(0)
corpo = {'topic': topic, 'title': titolo, 'message': testo, 'tags': ['shopping_cart'], 'priority': 3, 'click': SITO}
req = urllib.request.Request('https://ntfy.sh/', data=json.dumps(corpo).encode(), headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req, timeout=20) as r:
    print('ntfy', r.status)   # il repo e' pubblico: nei log solo lo stato, mai il testo
