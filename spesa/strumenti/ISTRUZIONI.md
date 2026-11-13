# Spesa: volantini della settimana e panoramica

Istruzioni per la routine settimanale di Claude (giovedì mattina) e per chiunque aggiorni le offerte a mano.
La pagina che le mostra è `spesa-famiglia.html`; i dati stanno in `spesa/offerte.json`.

## I due supermercati

| Negozio | Dove | Chiave `s` | Note |
|---|---|---|---|
| **Coop** corso Belgio 151/D, Torino | volantini del negozio su negozi.volantinopiu.com | `coop` | Ci si fa la spesa alimentare: si paga con i **buoni pasto**. «soci» = con la carta SocioCoop. |
| **iN's Mercato** via Torino 181, San Mauro Torinese | insmercato.it, edizione in corso | `ins` | Tutto il resto (casa, igiene). Prodotti quasi tutti a marchio iN's. |

## Passi

1. **Scarica i volantini e le pagine**
   ```bash
   pip install pymupdf 2>/dev/null || true      # solo se manca pdftoppm
   python3 spesa/strumenti/scarica_volantini.py /tmp/volantini
   ```
   Crea `/tmp/volantini/volantini.json` e le pagine `p-1.jpg, p-2.jpg…` di ogni volantino.

2. **Leggi TUTTE le pagine** di ogni volantino (con il tool Read sulle immagini). Dalla copertina prendi le date.
   - Scarta i volantini **già scaduti** o che **non sono di spesa**: per esempio «Black Friday» di elettronica, cataloghi di arredo, abbigliamento.
   - Dell'iN's tieni l'edizione in corso. Tieni anche l'altra solo se le sue date sono valide adesso o iniziano entro 7 giorni: in quel caso usa le sue date `dal`.

3. **Ricostruisci `spesa/offerte.json`**. Mantieni i campi `marche` e `note`, aggiorna gli altri. Forma di ogni offerta:
   ```json
   {"s":"coop","cat":"dispensa","n":"Passata di pomodoro Mutti","f":"700 g","v":0.99,"u":1.41,"era":1.99,"sc":"-50%","al":"2026-11-25","marca":"Mutti"}
   ```
   - `s`: `coop` o `ins`.
   - `cat`: un reparto tra `pane frigo carne dispensa colazione surgelati bevande pulizia bucato igiene carta bambini farmacia varie`. Salumi, formaggi, latte, yogurt, uova e piatti pronti da banco frigo vanno in `frigo`.
   - `n`: prodotto e marca. `f`: formato.
   - `v`: prezzo, numero con il punto decimale. Se il prezzo è al kg o all'etto, aggiungi `"um":"kg"` o `"um":"etto"`.
   - `u`: prezzo al kg. Per i liquidi aggiungi `"uu":"l"`.
   - `era` / `sc`: prezzo prima e sconto, **solo se stampati** (si possono calcolare dal prezzo barrato).
   - `soci: true` per le offerte con carta socio.
   - Sconti su tutta una linea senza prezzo: `"linea": true` e `"sc":"-40%"`, senza `v`.
   - `al` (e `dal` se diversa dall'inizio): date `AAAA-MM-GG`. Se un'offerta vale solo in alcuni giorni, usa quei giorni.
   - `marca`: solo se è una chiave di `marche`, così compare il logo. Alle offerte iN's metti `"marca":"IN's"`; a «Origine» e «Gli Spesotti» metti `Coop`.
   - **Escludi sempre frutta e verdura fresche** (decisione di Goffredo). Restano frutta secca, conserve, surgelati e piatti pronti.
   - **Non inventare**: se un prezzo non si legge, salta l'offerta.
   - `volantini`: `{"coop":[{"nome":"RisparMIO","dal":"…","al":"…"}], "ins":[{"nome":"…","dal":"…","al":"…","negozio":"San Mauro, via Torino 181"}]}`.
   - `aggiornato`: la data di oggi.

4. **Scrivi la panoramica** in `panoramica`:
   ```json
   {"data":"AAAA-MM-GG","titolo":"Spesa: cosa conviene questa settimana","punti":["…","…"]}
   ```
   Da 5 a 8 punti brevi, in italiano semplice, **solo con prezzi presi dai volantini**:
   - Primo punto: le voci della **lista di casa** (`spesa/dati.json`, voci con `"buy": true`) e dove conviene prenderle. Ricorda che gli alimentari si prendono alla Coop con i buoni pasto, a meno che all'iN's costino nettamente meno.
   - Poi per reparto (carne, salumi, dispensa, colazione, surgelati, bevande, casa): **chi conviene** e perché. Confronta i prezzi al kg o al litro di prodotti simili tra i due negozi.
   - Casa e igiene: alla Coop **non** si pagano con i buoni pasto.
   - Ultimo punto: le scadenze dei volantini.

5. **Controlla** e solo se va tutto bene pubblica:
   ```bash
   python3 spesa/strumenti/controlla_offerte.py spesa/offerte.json
   git add spesa/offerte.json
   git commit -m "Spesa: volantini della settimana [panoramica]"
   git push origin HEAD:main
   ```
   Il testo `[panoramica]` nel commit fa partire l'azione `spesa-panoramica.yml`, che manda la notifica sul canale Casa. **Non toccare altri file**, in particolare `spesa/dati.json` (la lista di casa) e `calendario/`.

## Se qualcosa non va

- **Un sito è cambiato** e lo script non trova i volantini: non pubblicare niente. Nel resoconto finale scrivi cosa è fallito.
- **Il controllo dà errori:** correggi. Se non riesci, non fare il push.
