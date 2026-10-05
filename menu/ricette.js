/* Menù della settimana · ricette e piano (5/10/2026). Lo usano menu-settimana.html e la tessera della home.
   Si cucina una volta: la cena di stasera per tutti e, con quello che avanza, le schiscette di domani per Goffredo e Carolina.
   Il piano ruota da solo settimana dopo settimana; le scelte fatte in pagina (chi cucina, cena cambiata) stanno in menu/dati.json. */
(function(){
  const CENE = [
    {id:'pollo-patate', nome:'Pollo al forno con patate', note:'Cosce o petto di pollo e patate a spicchi con rosmarino e un filo d’olio: 40 minuti di forno, nessuna fatica. Se ne fa un po’ di più.', ing:['pollo','patate','olio-extravergine','aglio'], domani:'wrap-pollo'},
    {id:'pesce-zucchine', nome:'Pesce al forno con zucchine', note:'Orata o merluzzo con zucchine a rondelle, limone e prezzemolo: 20 minuti a 200°. Per Edo e Bianca filetti senza spine.', ing:['pesce','zucchine','limoni'], domani:'riso-tonno'},
    {id:'frittata', nome:'Frittata di verdure e insalata', note:'Uova, zucchine o spinaci e parmigiano, in padella o al forno. Con insalata e pane: 20 minuti.', ing:['uova','spinaci','parmigiano','insalata','pane'], domani:'frittata-box'},
    {id:'pasta-ceci', nome:'Pasta e ceci', note:'Ceci in scatola, passata, rosmarino e pasta corta: piatto unico che piace ai bambini, pronto in 25 minuti.', ing:['pasta','legumi-in-scatola','passata-di-pomodoro','cipolle'], domani:'insalata-ceci'},
    {id:'polpette', nome:'Polpette al sugo con piselli', note:'Macinato, uovo, pane e parmigiano; si cuociono nella passata con i piselli. Se ne fa il doppio e metà va in freezer.', ing:['carne-macinata','uova','pane','parmigiano','passata-di-pomodoro','piselli-surgelati'], domani:'farro-tonno'},
    {id:'salmone-riso', nome:'Salmone al forno con riso e carote', note:'Filetti di salmone 15 minuti a 200°, riso basmati e carote al vapore. Si cuoce riso anche per domani.', ing:['salmone','riso','carote','limoni'], domani:'bowl-salmone'},
    {id:'minestrone', nome:'Minestrone con crostini', note:'Verdure (anche surgelate), legumi e un pugno di pasta piccola. Parmigiano e crostini a tavola.', ing:['verdure-surgelate','legumi-in-scatola','pasta','parmigiano','pane'], domani:'lenticchie-feta'},
    {id:'pizza', nome:'Pizza fatta in casa', note:'Impasto la mattina (farina, lievito, acqua, olio); la sera si condisce tutti insieme: pomodoro, mozzarella e verdure.', ing:['farina','lievito','passata-di-pomodoro','mozzarella','zucchine'], domani:'pasta-fredda'},
  ];
  const PRANZI = {
    'wrap-pollo':{nome:'Wrap integrale con pollo, hummus e insalata', note:'Con il pollo avanzato: piadina integrale, due cucchiai di hummus, insalata e pomodoro. Si arrotola la sera.', ing:['piadine-integrali','hummus','insalata','pomodori']},
    'riso-tonno':{nome:'Insalata di riso, tonno e zucchine', note:'Riso, tonno al naturale, le zucchine avanzate e pomodorini. Olio e limone a parte.', ing:['riso','tonno','pomodori']},
    'frittata-box':{nome:'Frittata in schiscetta con pomodorini', note:'Due fette di frittata avanzata, pomodorini e una fetta di pane integrale. Buona anche fredda.', ing:['pomodori','pane']},
    'insalata-ceci':{nome:'Insalata di ceci, carote e feta', note:'Ceci, carote a julienne, feta e prezzemolo. Olio e limone: si condisce a pranzo.', ing:['legumi-in-scatola','carote','feta','limoni']},
    'farro-tonno':{nome:'Bowl di farro, tonno e pomodorini', note:'Farro precotto, tonno al naturale, pomodorini e rucola. Dieci minuti, si monta la sera.', ing:['farro','tonno','pomodori','rucola']},
    'bowl-salmone':{nome:'Bowl di riso, salmone e cetrioli', note:'Il riso e il salmone di ieri sera, cetrioli e un filo di limone. Si mangia anche freddo.', ing:['cetrioli','limoni']},
    'lenticchie-feta':{nome:'Lenticchie con feta, cetrioli e pomodori', note:'Lenticchie in scatola sciacquate, feta, cetrioli e pomodori. Ricca di proteine, sazia fino a sera.', ing:['legumi-in-scatola','feta','cetrioli','pomodori']},
    'pasta-fredda':{nome:'Pasta fredda con verdure e mozzarella', note:'Pasta corta, zucchine grigliate, pomodorini e mozzarella a cubetti. Si cuoce la pasta mentre lievita la pizza.', ing:['pasta','zucchine','pomodori','mozzarella']},
  };
  const CASA = [ // pranzo del weekend, a casa tutti insieme
    {id:'pasta-pomodoro', nome:'Pasta al pomodoro e mozzarella, verdure al forno', note:'Il pranzo che mette d’accordo tutti. Verdure al forno come contorno.', ing:['pasta','passata-di-pomodoro','mozzarella','verdure-surgelate']},
    {id:'risotto-zucca', nome:'Risotto alla zucca', note:'Zucca a cubetti, cipolla, riso e parmigiano: 25 minuti. Si può fare anche con i piselli.', ing:['riso','zucca','cipolle','parmigiano']},
    {id:'orecchiette', nome:'Orecchiette con broccoli e parmigiano', note:'Broccoli lessati nella stessa acqua della pasta, aglio e olio. Pronto in 20 minuti.', ing:['pasta','broccoli','aglio','parmigiano']},
  ];
  // ingredienti -> articoli della Spesa (stessi id e reparti della pagina della spesa)
  const ING = {
    'pollo':['Pollo','carne'], 'patate':['Patate','frutta'], 'olio-extravergine':['Olio extravergine','dispensa'], 'aglio':['Aglio','frutta'],
    'pesce':['Pesce','carne'], 'zucchine':['Zucchine','frutta'], 'limoni':['Limoni','frutta'], 'uova':['Uova','frigo'], 'spinaci':['Spinaci','frutta'],
    'parmigiano':['Parmigiano','frigo'], 'insalata':['Insalata','frutta'], 'pane':['Pane','pane'], 'pasta':['Pasta','dispensa'],
    'legumi-in-scatola':['Legumi in scatola','dispensa'], 'passata-di-pomodoro':['Passata di pomodoro','dispensa'], 'cipolle':['Cipolle','frutta'],
    'carne-macinata':['Carne macinata','carne'], 'piselli-surgelati':['Piselli surgelati','surgelati'], 'salmone':['Salmone','carne'], 'riso':['Riso','dispensa'],
    'carote':['Carote','frutta'], 'verdure-surgelate':['Verdure surgelate','surgelati'], 'farina':['Farina','dispensa'], 'lievito':['Lievito di birra','dispensa'],
    'mozzarella':['Mozzarella','frigo'], 'piadine-integrali':['Piadine integrali','pane'], 'hummus':['Hummus','frigo'], 'pomodori':['Pomodori','frutta'],
    'tonno':['Tonno','dispensa'], 'feta':['Feta','frigo'], 'farro':['Farro','dispensa'], 'rucola':['Rucola','frutta'], 'cetrioli':['Cetrioli','frutta'],
    'zucca':['Zucca','frutta'], 'broccoli':['Broccoli','frutta'],
  };
  const REPARTI = [['frutta','Frutta e verdura','🥦'],['pane','Pane e forno','🥖'],['frigo','Latte, uova e frigo','🧀'],['carne','Carne e pesce','🍗'],['dispensa','Dispensa','🥫'],['surgelati','Surgelati','🧊']];
  const PERSONE = {gof:{nome:'Goffredo', av:'goffredo', c:'#5FA57A'}, caro:{nome:'Carolina', av:'carolina', c:'#8D5BB8'}};
  const GIORNI = ['lunedì','martedì','mercoledì','giovedì','venerdì','sabato','domenica'];
  const MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
  const INIZIO = '2026-10-05'; // la settimana zero della rotazione
  function parse(s){ const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); }
  function iso(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function addDays(d,n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
  function lunedi(d){ const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -((x.getDay()+6)%7)); }
  function nSett(k){ return Math.round((parse(k) - parse(INIZIO)) / (7*864e5)); }
  function mod(a, n){ return ((a % n) + n) % n; }
  function scelta(dati, k, d){ const w = dati && dati.weeks && dati.weeks[k]; return (w && w[d]) || null; }
  function cenaDi(dati, k, i){
    const g = scelta(dati, k, iso(addDays(parse(k), i)));
    if(g && g.c){ const x = CENE.find(c => c.id === g.c); if(x) return x; }
    if(i === 5) return CENE.find(c => c.id === 'pizza');
    const resto = CENE.filter(c => c.id !== 'pizza'), j = i === 6 ? 5 : i;
    return resto[mod(j*3 + nSett(k)*4, resto.length)]; // passo 4: la cena della domenica non torna mai nella settimana dopo
  }
  function chiDi(dati, k, i){ const g = scelta(dati, k, iso(addDays(parse(k), i))); if(g && g.chi) return g.chi; return mod(i + nSett(k), 2) === 0 ? 'gof' : 'caro'; }
  function pranzoDi(dati, k, i){
    if(i >= 5) return Object.assign({casa:true}, CASA[mod(nSett(k) + i - 5, CASA.length)]);
    const pk = i === 0 ? iso(addDays(parse(k), -7)) : k, pi = i === 0 ? 6 : i - 1, prima = cenaDi(dati, pk, pi);
    return Object.assign({id:prima.domani, chi:chiDi(dati, pk, pi), da:prima.nome}, PRANZI[prima.domani]);
  }
  function piano(dati, k){ const out = []; for(let i=0;i<7;i++) out.push({i, d:iso(addDays(parse(k), i)), pranzo:pranzoDi(dati, k, i), cena:cenaDi(dati, k, i), chi:chiDi(dati, k, i)}); return out; }
  window.MENU = {CENE, PRANZI, CASA, ING, REPARTI, PERSONE, GIORNI, MESI, parse, iso, addDays, lunedi, piano, cenaDi, chiDi, pranzoDi};
})();
