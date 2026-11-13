# -*- coding: utf-8 -*-
"""Scarica i volantini in corso dei due supermercati della spesa e li trasforma in immagini da leggere.

  python3 spesa/strumenti/scarica_volantini.py [cartella]      (predefinita: /tmp/volantini)

- Coop di corso Belgio 151/D, Torino: i volantini del negozio su negozi.volantinopiu.com (codice 8001120004000).
- iN's Mercato di San Mauro Torinese, via Torino 181: l'edizione in corso dal sito insmercato.it.

Per ogni volantino crea <cartella>/<nome>/p-1.jpg, p-2.jpg… e scrive <cartella>/volantini.json con negozio, titolo, url del pdf e pagine.
Per le pagine usa pdftoppm se c'e', altrimenti PyMuPDF (pip install pymupdf).
"""
import os, re, sys, json, html, shutil, subprocess, urllib.request

UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15'}
COOP_NEGOZIO = 'https://negozi.volantinopiu.com/ccno-8001120004000.html'
INS_PAGINA = 'https://www.insmercato.it/volantino/'
INS_INDIRIZZO = 'via Torino 181'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/volantini'


def leggi(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.geturl(), r.read()


def pagine(pdf, cartella, larghezza=1300):
    os.makedirs(cartella, exist_ok=True)
    if shutil.which('pdftoppm'):
        subprocess.run(['pdftoppm', '-jpeg', '-r', '110', '-scale-to-x', str(larghezza), '-scale-to-y', '-1', pdf, os.path.join(cartella, 'p')], check=True)
        # pdftoppm scrive p-01.jpg o p-1.jpg a seconda del numero di pagine: si rinomina in p-1.jpg
        for f in os.listdir(cartella):
            m = re.match(r'p-0*(\d+)\.jpg$', f)
            if m: os.rename(os.path.join(cartella, f), os.path.join(cartella, 'p-%d.jpg' % int(m.group(1))))
    else:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf)
        for i, p in enumerate(doc):
            z = larghezza / p.rect.width
            p.get_pixmap(matrix=fitz.Matrix(z, z)).save(os.path.join(cartella, 'p-%d.jpg' % (i + 1)))
    return sorted((f for f in os.listdir(cartella) if f.endswith('.jpg')), key=lambda f: int(re.findall(r'\d+', f)[0]))


def coop():
    _, b = leggi(COOP_NEGOZIO)
    out = []
    for rid in sorted(set(re.findall(r'redirect(\d+)\.html\?id_pv=(\d+)', b.decode('utf-8', 'ignore')))):
        url, pg = leggi('https://negozi.volantinopiu.com/redirect%s.html?id_pv=%s' % rid)
        t = pg.decode('utf-8', 'ignore')
        pdf = re.search(r'https://resources\.volantinopiu\.it/flyer/[^"\' ]+?\.pdf', t)
        titolo = re.search(r'<title>([^<]*)</title>', t)
        if pdf:
            out.append({'negozio': 'coop', 'nome': 'coop-' + rid[0], 'titolo': html.unescape(titolo.group(1)).strip() if titolo else '', 'pdf': pdf.group(0), 'pagina': url})
    return out


def ins():
    _, b = leggi(INS_PAGINA)
    t = b.decode('utf-8', 'ignore')
    a = re.search(r'data-default-url="([^"]+)"\s+data-edition-one="([^"]*)"\s+data-edition-two="([^"]*)"\s+data-current-flyer="(\d)"', t)
    if not a: raise SystemExit("iN's: non trovo le edizioni nella pagina del volantino (il sito e' cambiato?)")
    base, ed1, ed2, cur = a.groups()
    s = re.search(r'data-address="' + re.escape(INS_INDIRIZZO) + r'"\s+data-location="[^"]*"\s+data-code-one="([^"]*)"\s+data-code-two="([^"]*)"', t, re.I)
    if not s: raise SystemExit("iN's: non trovo il negozio di " + INS_INDIRIZZO)
    out = []
    # l'edizione in corso per prima; l'altra si scarica solo se esiste (a volte e' gia' quella della settimana dopo)
    for n, ed, code in sorted([(1, ed1, s.group(1)), (2, ed2, s.group(2))], key=lambda x: x[0] != int(cur)):
        if not ed or not code: continue
        out.append({'negozio': 'ins', 'nome': 'ins-' + ed.replace('/', '-'), 'titolo': "iN's edizione " + ed + (' (in corso)' if n == int(cur) else ' (altra edizione)'),
                    'pdf': '%s/%s/pdf/volantino-%s.pdf' % (base, ed, code), 'in_corso': n == int(cur)})
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    tutti = []
    for v in coop() + ins():
        try:
            _, dati = leggi(v['pdf'])
        except Exception as e:
            print('salto', v['nome'], e); continue
        f = os.path.join(OUT, v['nome'] + '.pdf'); open(f, 'wb').write(dati)
        v['pagine'] = [os.path.join(OUT, v['nome'], p) for p in pagine(f, os.path.join(OUT, v['nome']))]
        tutti.append(v); print('%-28s %2d pagine  %s' % (v['nome'], len(v['pagine']), v['titolo']))
    json.dump(tutti, open(os.path.join(OUT, 'volantini.json'), 'w'), ensure_ascii=False, indent=1)
    print('elenco in', os.path.join(OUT, 'volantini.json'))


if __name__ == '__main__':
    main()
