/* Budget Victor Patin — PWA 2026 */
'use strict';
const {useState, useMemo, useCallback, useEffect} = React;

// ── STORAGE (localStorage pour persistence) ──────────────────────────────
const STORE_KEY = 'budget-vp-data-v1';
function loadStore(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function saveStore(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── CONSTANTES ────────────────────────────────────────────────────────────
const SALAIRE_NET = 2608;
const SOLDE_DEBUT = 2610;
const AVION_PRIX  = 350;
const MOIS_LABELS = ["Mar 2026","Avr 2026","Mai 2026","Jun 2026","Juil 2026","Aout 2026","Sep 2026","Oct 2026","Nov 2026","Déc 2026","Jan 2027","Fév 2027","Mar 2027"];

const INIT_DEPENSES = [
  {cat:"🏠 Logement",  label:"Loyer Kalt",          actif:"🔒", montant:661.14, remarque:"h&l hub-1 GmbH · Hauptstr.44",    ref:"Bail §2"},
  {cat:"🏠 Logement",  label:"Charges NK",           actif:"🔒", montant:170,    remarque:"Chauf.30+Divers90+Cuisine50",      ref:"Bail §2"},
  {cat:"🏠 Logement",  label:"EWE Électricité",      actif:"✓",  montant:70,     remarque:"Grünstrom 12",                    ref:"n°1004294267"},
  {cat:"🍽️ Alim.",    label:"Repas midi ×21",       actif:"✓",  montant:188.16, remarque:"21 × 8,96€"},
  {cat:"🍽️ Alim.",    label:"Repas soir / courses", actif:"✓",  montant:150,    remarque:"30 × 5€ moyen"},
  {cat:"🍽️ Alim.",    label:"Sorties / extras",     actif:"✗",  montant:0,      remarque:"Budget indicatif"},
  {cat:"📱 Essentiels",label:"Bouygues Telecom",     actif:"✓",  montant:15.99,  remarque:"Forfait mobile FR"},
  {cat:"📱 Essentiels",label:"Telekom Internet DE",  actif:"✗",  montant:57.95,  remarque:"À confirmer"},
  {cat:"📱 Essentiels",label:"N26 Metal",            actif:"✓",  montant:15.21,  remarque:"Compte principal DE"},
  {cat:"📱 Essentiels",label:"Crédit Mutuel",        actif:"✓",  montant:3.5,    remarque:"Compte FR"},
  {cat:"🎬 Streaming", label:"Netflix",              actif:"✗",  montant:7.99,   remarque:"Vidéo"},
  {cat:"🎬 Streaming", label:"Deezer",               actif:"✓",  montant:11.99,  remarque:"Musique"},
  {cat:"🎬 Streaming", label:"Canal+",               actif:"✓",  montant:19.99,  remarque:"Séries & sport"},
  {cat:"🎬 Streaming", label:"Ligue 1+",             actif:"✓",  montant:14.99,  remarque:"Foot FR"},
  {cat:"🎬 Streaming", label:"Prime Video",          actif:"✓",  montant:2,      remarque:"Amazon"},
  {cat:"🎬 Streaming", label:"L'Équipe",             actif:"✓",  montant:4.99,   remarque:"Actu sport"},
  {cat:"🎬 Streaming", label:"Samsung TV+",          actif:"✗",  montant:1.99,   remarque:"Streaming"},
  {cat:"🎬 Streaming", label:"YouTube Premium",      actif:"✗",  montant:12.99,  remarque:"Sans pub"},
  {cat:"💼 Pro",        label:"Adobe CC",             actif:"✓",  montant:17.59,  remarque:"Suite créative"},
  {cat:"💼 Pro",        label:"Claude",               actif:"✓",  montant:22.99,  remarque:"IA"},
  {cat:"💼 Pro",        label:"Google One",           actif:"✓",  montant:1.99,   remarque:"2 To stockage"},
  {cat:"🚗 Transport", label:"Essence travail",       actif:"✓",  montant:115.92, remarque:"46km/j × ~22j"},
  {cat:"✈️ Voyages",   label:"A/R Vechta↔St-Nazaire",actif:"✗",  montant:350,    remarque:"Avion — qté variable", ref:"Voir Projection"},
  {cat:"🎮 Loisirs",   label:"Padel ×10/mois",       actif:"✓",  montant:60,     remarque:"10 sessions × 6€"},
  {cat:"🎮 Loisirs",   label:"Sorties / divers",      actif:"✗",  montant:50,     remarque:"Budget indicatif"},
  {cat:"📈 Invest.",   label:"Épargne Équilibre",     actif:"✗",  montant:100,    remarque:"Objectif mensuel"},
  {cat:"📈 Invest.",   label:"Actions Air Liquide",   actif:"✗",  montant:200,    remarque:"Investissement"},
];

const INIT_MOBILIER = [
  {piece:"Chambre",        article:"Lit",                 fournisseur:"IKEA",      prix:103.2,  paye:"✓", mois:"Avr 2026"},
  {piece:"Chambre",        article:"Table de chevet",     fournisseur:"IKEA",      prix:28,     paye:"✓", mois:"Avr 2026"},
  {piece:"Chambre",        article:"Commode",             fournisseur:"IKEA",      prix:159,    paye:"✓", mois:"Avr 2026"},
  {piece:"Chambre",        article:"Armoire",             fournisseur:"IKEA",      prix:159,    paye:"✓", mois:"Avr 2026"},
  {piece:"Salon",          article:"Meuble TV",           fournisseur:"IKEA",      prix:109.98, paye:"✓", mois:"Avr 2026"},
  {piece:"Salon",          article:"Aquarium",            fournisseur:"Stand by",  prix:0,      paye:"✗", mois:""},
  {piece:"Salon",          article:"Canapé",              fournisseur:"IKEA",      prix:494.1,  paye:"✓", mois:"Avr 2026"},
  {piece:"Salon",          article:"Table basse",         fournisseur:"IKEA",      prix:79.99,  paye:"✓", mois:"Avr 2026"},
  {piece:"Cuisine",        article:"Rangement bouteilles",fournisseur:"Stand by",  prix:88.99,  paye:"✗", mois:""},
  {piece:"Cuisine",        article:"Divers IKEA",         fournisseur:"IKEA",      prix:49.99,  paye:"✓", mois:"Avr 2026"},
  {piece:"Salle de bain",  article:"Servante",            fournisseur:"IKEA",      prix:68.99,  paye:"✓", mois:"Avr 2026"},
  {piece:"Salle de bain",  article:"Meuble lavabo",       fournisseur:"IKEA",      prix:54.99,  paye:"✓", mois:"Avr 2026"},
  {piece:"Électroménager", article:"Aspirateur",          fournisseur:"Stand by",  prix:250,    paye:"✗", mois:"Juin 2026"},
  {piece:"Divers",         article:"Petit meuble couloir",fournisseur:"Don",       prix:0,      paye:"✗", mois:""},
];

const INIT_CAUTION = [
  {label:"Caution 1/3", mois:"Avr 2026",  montant:443.33, paye:"✗"},
  {label:"Caution 2/3", mois:"Mai 2026",  montant:443.33, paye:"✗"},
  {label:"Caution 3/3", mois:"Juin 2026", montant:443.34, paye:"✗"},
];

const INIT_PROJETS = [
  {nom:"WE entre potes Lyon",  cat:"Week-end", desc:"Logement + activités + transport", m1:"Mar 2026",v1:75,  m2:"Mai 2026",v2:170,m3:"Jun 2026",v3:630},
  {nom:"WE Strasbourg",        cat:"Week-end", desc:"Logement + activités + transport", m1:"—",       v1:360, m2:"—",       v2:170,m3:"—",       v3:355},
  {nom:"Montre",               cat:"Achat",    desc:"Montre",                           m1:"—",       v1:575, m2:"—",       v2:0,  m3:"—",       v3:0},
  {nom:"TV + Barre de son",    cat:"Achat",    desc:"TV + Barre de son",                m1:"—",       v1:730, m2:"—",       v2:0,  m3:"—",       v3:0},
  {nom:"Aquarium",             cat:"Loisir",   desc:"Aquarium (Stand by)",              m1:"—",       v1:0,   m2:"—",       v2:0,  m3:"—",       v3:0},
];

// ── HELPERS ───────────────────────────────────────────────────────────────
const eur = v => {
  if (v == null || isNaN(v)) return "–";
  return Math.abs(v).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2}) + " €";
};
const pct = v => (v*100).toFixed(1)+"%";
const isActif = d => d.actif === "✓" || d.actif === "🔒";

function calcDepenses(depenses) {
  const total = depenses.filter(isActif).reduce((s,d)=>s+d.montant,0);
  const cats = [...new Set(depenses.map(d=>d.cat))];
  const byCat = {};
  cats.forEach(c => { byCat[c] = depenses.filter(d=>d.cat===c && isActif(d)).reduce((s,d)=>s+d.montant,0); });
  return {total, byCat, dispo: SALAIRE_NET - total, cats};
}

function calcProjection(depenses, mobilierByMois, cautionByMois, projetsTotal, avions, extras) {
  const depTotal = calcDepenses(depenses).total;
  const logement = depenses.slice(0,3).filter(isActif).reduce((s,d)=>s+d.montant,0);
  let solde = SOLDE_DEBUT;
  return MOIS_LABELS.map((label, i) => {
    const soldeDebut = solde;
    const dep = i===0 ? depTotal - logement : depTotal;
    const avion = (avions[i]||0)*AVION_PRIX;
    const meuble = mobilierByMois[label]||0;
    const caution = cautionByMois[label]||0;
    const projet = projetsTotal[label]||0;
    const extra = extras[i]||0;
    const totalCharges = dep + avion + meuble + caution + projet;
    const avantSalaire = soldeDebut - totalCharges + extra;
    const finMois = avantSalaire + SALAIRE_NET;
    const eco = finMois - soldeDebut;
    solde = finMois;
    return {label, soldeDebut, dep, avion, meuble, caution, projet, extra, totalCharges, avantSalaire, finMois, eco};
  });
}

// ── STYLES ────────────────────────────────────────────────────────────────
const S = {
  // Layout
  page:   {flex:1, overflowY:'auto', overflowX:'hidden', WebkitOverflowScrolling:'touch', padding:'12px 12px 80px'},
  card:   {background:'#0f172a', border:'1px solid #1e3a5f', borderRadius:12, overflow:'hidden', marginBottom:12},
  sectHdr:{background:'#0c1628', borderBottom:'1px solid #1e3a5f', padding:'8px 12px', fontSize:11, fontWeight:600, color:'#3b82f6', textTransform:'uppercase', letterSpacing:'.06em'},
  infoBox:{background:'#0c1a2e', border:'1px solid #1e3a5f', borderLeft:'3px solid #3b82f6', borderRadius:6, padding:'10px 12px', fontSize:11, color:'#94a3b8', lineHeight:1.6, marginBottom:12},
  // Text
  pos:    {color:'#22c55e'}, neg: {color:'#ef4444'}, warn: {color:'#f59e0b'}, muted: {color:'#475569'},
  mono:   {fontFamily:"'SF Mono','Courier New',monospace"},
  // KPI
  kpiGrid:{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12},
  kpiBox: {background:'#0f172a', border:'1px solid #1e3a5f', borderRadius:10, padding:12},
  kpiLbl: {fontSize:10, color:'#475569', marginBottom:5},
  kpiVal: {fontSize:20, fontWeight:700, fontFamily:"'SF Mono','Courier New',monospace"},
};

// ── COMPOSANTS UI ─────────────────────────────────────────────────────────
function Toggle({val, onChange}) {
  const on = val==="✓"||val==="🔒";
  const locked = val==="🔒";
  return React.createElement('label', {
    style:{position:'relative',width:38,height:22,cursor:locked?'not-allowed':'pointer',display:'inline-block',flexShrink:0}
  },
    React.createElement('input', {
      type:'checkbox', checked:on, disabled:locked,
      onChange: e => !locked && onChange(e.target.checked?"✓":"✗"),
      style:{opacity:0,width:0,height:0,position:'absolute'}
    }),
    React.createElement('span', {style:{
      position:'absolute', inset:0, background:on?(locked?'#1d4ed8':'#22c55e'):'#334155',
      borderRadius:22, transition:'.2s',
      display:'flex', alignItems:'center', padding:'3px',
      justifyContent: on ? 'flex-end' : 'flex-start'
    }},
      React.createElement('span', {style:{width:16,height:16,background:'#fff',borderRadius:'50%',display:'block'}})
    )
  );
}

function Bar({val, max, color='#3b82f6'}) {
  const p = max>0 ? Math.min(val/max*100,100) : 0;
  return React.createElement('div', {style:{background:'#1e293b',borderRadius:3,height:4,overflow:'hidden',marginTop:4}},
    React.createElement('div', {style:{width:p+'%',height:'100%',background:color,borderRadius:3,transition:'width .4s'}})
  );
}

function Tag({children, color='gray'}) {
  const colors = {
    green:{background:'#052e16',color:'#4ade80',border:'1px solid #166534'},
    amber:{background:'#2d1f00',color:'#fbbf24',border:'1px solid #78350f'},
    blue: {background:'#0c1a3a',color:'#60a5fa',border:'1px solid #1d4ed8'},
    gray: {background:'#1e293b',color:'#94a3b8',border:'1px solid #334155'},
    red:  {background:'#2d0d0d',color:'#f87171',border:'1px solid #7f1d1d'},
  };
  return React.createElement('span', {
    style:{...colors[color], display:'inline-block', padding:'1px 7px', borderRadius:12, fontSize:10, fontWeight:600}
  }, children);
}

function NumInput({value, onChange, style={}}) {
  return React.createElement('input', {
    type:'number', value, min:0, step:0.01,
    onChange: e => onChange(parseFloat(e.target.value)||0),
    style:{
      background:'#1e293b', border:'1px solid #334155', color:'#e2e8f0',
      padding:'4px 6px', borderRadius:6, fontFamily:"'SF Mono','Courier New',monospace",
      fontSize:12, width:80, textAlign:'right', ...style
    }
  });
}

// ── TAB: TABLEAU DE BORD ──────────────────────────────────────────────────
function TabBord({depenses, proj}) {
  const {total, byCat, dispo, cats} = calcDepenses(depenses);
  const CAT_COL = {"🏠 Logement":"#6366f1","🍽️ Alim.":"#f59e0b","📱 Essentiels":"#06b6d4","🎬 Streaming":"#a855f7","💼 Pro":"#3b82f6","🚗 Transport":"#10b981","✈️ Voyages":"#f97316","🎮 Loisirs":"#ec4899","📈 Invest.":"#22c55e"};

  const e = (v, cls) => React.createElement('span', {style:{...S.mono, ...(cls?S[cls]:{})}}, eur(v));

  return React.createElement('div', {style:S.page},

    // KPIs
    React.createElement('div', {style:S.kpiGrid},
      ...[
        {lbl:"💼 Salaire net", val:eur(SALAIRE_NET), cls:'pos'},
        {lbl:"💰 Solde Mars 2026", val:eur(SOLDE_DEBUT), cls:'pos'},
        {lbl:"💸 Dépenses/mois", val:eur(total), cls:'warn'},
        {lbl:"✅ Budget dispo", val:eur(dispo), cls:dispo>=0?'pos':'neg'},
      ].map((k,i)=>React.createElement('div',{key:i,style:S.kpiBox},
        React.createElement('div',{style:S.kpiLbl},k.lbl),
        React.createElement('div',{style:{...S.kpiVal,...S[k.cls]}},k.val)
      ))
    ),

    // Catégories
    React.createElement('div', {style:S.card},
      React.createElement('div',{style:S.sectHdr},"📋 Dépenses par catégorie"),
      React.createElement('div', {style:{padding:'0 0 4px'}},
        cats.map((cat,i) => {
          const v = byCat[cat]||0;
          return React.createElement('div', {key:i, style:{padding:'10px 12px', borderBottom:'1px solid #111827'}},
            React.createElement('div', {style:{display:'flex', justifyContent:'space-between', marginBottom:2}},
              React.createElement('span', {style:{fontSize:12}}, cat),
              React.createElement('span', {style:{...S.mono, fontSize:12, color:v>0?'#e2e8f0':'#475569'}},
                v>0 ? eur(v) : '–'
              )
            ),
            v>0 && React.createElement('div', {style:{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}},
              React.createElement(Bar, {val:v, max:SALAIRE_NET, color:CAT_COL[cat]||'#3b82f6'}),
              React.createElement('span', {style:{...S.mono, fontSize:10, ...S.muted, flexShrink:0}}, pct(v/SALAIRE_NET))
            )
          );
        }),
        React.createElement('div', {style:{padding:'10px 12px', background:'#0c1628', display:'flex', justifyContent:'space-between'}},
          React.createElement('span', {style:{fontWeight:700}},"TOTAL"),
          React.createElement('div', {style:{textAlign:'right'}},
            React.createElement('div', {style:{...S.mono, ...S.warn, fontWeight:700}}, eur(total)),
            React.createElement('div', {style:{...S.mono, fontSize:10, ...S.muted}}, pct(total/SALAIRE_NET)+" du salaire")
          )
        )
      )
    ),

    // Projection résumé
    React.createElement('div', {style:S.card},
      React.createElement('div',{style:S.sectHdr},"📅 Projection mars→déc 2026"),
      React.createElement('div', {style:{overflowX:'auto'}},
        React.createElement('table', {style:{borderCollapse:'collapse', minWidth:600}},
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', {style:{padding:'7px 8px', fontSize:10, color:'#475569', textAlign:'left', whiteSpace:'nowrap', background:'#0c1628', borderBottom:'1px solid #1e3a5f'}}, "Ligne"),
              ...proj.slice(0,10).map((m,i)=>React.createElement('th',{key:i,style:{padding:'7px 6px',fontSize:10,color:'#475569',textAlign:'right',background:'#0c1628',borderBottom:'1px solid #1e3a5f',whiteSpace:'nowrap'}},m.label.split(" ")[0]))
            )
          ),
          React.createElement('tbody', null,
            ...[
              {lbl:"Solde fin",    key:"finMois",      cls:"pos"},
              {lbl:"Avant salaire",key:"avantSalaire", cls:"warn"},
              {lbl:"Économie",     key:"eco",          cls:""},
            ].map((row,ri)=>React.createElement('tr',{key:ri,style:{borderBottom:'1px solid #111827'}},
              React.createElement('td',{style:{padding:'6px 8px',fontSize:11,color:'#94a3b8',whiteSpace:'nowrap'}},row.lbl),
              ...proj.slice(0,10).map((m,i)=>{
                const v = m[row.key];
                const color = row.cls?S[row.cls]:(v>=0?S.pos:S.neg);
                return React.createElement('td',{key:i,style:{padding:'6px 6px',textAlign:'right',...S.mono,fontSize:11,...color}},eur(v));
              })
            ))
          )
        )
      )
    ),

    // Infos contrat
    React.createElement('div', {style:S.card},
      React.createElement('div',{style:S.sectHdr},"📄 Infos contrat"),
      React.createElement('div', null,
        ...[
          ["🏢","Big Dutchman Service GmbH · Auf der Lage 2, 49377 Vechta"],
          ["💼","Logistics Planner · CDI · Depuis 15/01/2026"],
          ["💰","3 850 + 150 BD-E = 4 000 € brut → ~2 544 € net"],
          ["🏠","Hauptstr. 44 App.11 · 49457 Drebber · dès 01/04/2026"],
          ["⚡","EWE Grünstrom 12 · n°1004294267 · 70 €/mois"],
          ["🔑","Caution 1 330 € (3 × ~443 €) · h&l hub-1 GmbH"],
          ["📅","Probezeit 6 mois → jusqu'au 14/07/2026"],
          ["🏖️","30 jours congés/an (20 légaux + 10 contractuels)"],
        ].map(([ico,txt],i)=>React.createElement('div',{key:i,style:{display:'flex',gap:10,padding:'9px 12px',borderBottom:'1px solid #111827',alignItems:'flex-start'}},
          React.createElement('span',{style:{fontSize:16,flexShrink:0}},ico),
          React.createElement('span',{style:{fontSize:12,color:'#cbd5e1',lineHeight:1.4}},txt)
        ))
      )
    )
  );
}

// ── TAB: DÉPENSES ─────────────────────────────────────────────────────────
function TabDepenses({depenses, setDepenses}) {
  const {total, byCat, dispo, cats} = calcDepenses(depenses);
  const [expanded, setExpanded] = useState({});

  const toggle = (i, val) => { const n=[...depenses]; n[i]={...n[i],actif:val}; setDepenses(n); };
  const setMontant = (i, val) => { const n=[...depenses]; n[i]={...n[i],montant:val}; setDepenses(n); };

  return React.createElement('div', {style:S.page},

    // KPIs
    React.createElement('div', {style:S.kpiGrid},
      ...[
        {lbl:"💸 Dépenses actives", val:eur(total), cls:'warn'},
        {lbl:"✅ Budget dispo", val:eur(dispo), cls:dispo>=0?'pos':'neg'},
      ].map((k,i)=>React.createElement('div',{key:i,style:S.kpiBox},
        React.createElement('div',{style:S.kpiLbl},k.lbl),
        React.createElement('div',{style:{...S.kpiVal,...S[k.cls]}},k.val),
        React.createElement('div',{style:{...S.mono,fontSize:10,...S.muted,marginTop:4}},eur(k.cls==='warn'?total*12:dispo*12)+" / an")
      ))
    ),

    // Par catégorie
    cats.map(cat => {
      const rows = depenses.map((d,i)=>({...d,i})).filter(d=>d.cat===cat);
      const catTotal = byCat[cat]||0;
      const isExp = expanded[cat] !== false;

      return React.createElement('div', {key:cat, style:S.card},
        React.createElement('div', {
          style:{...S.sectHdr, display:'flex', justifyContent:'space-between', cursor:'pointer'},
          onClick:()=>setExpanded(e=>({...e,[cat]:!isExp}))
        },
          React.createElement('span', null, cat),
          React.createElement('span', {style:{...S.mono, color:'#f59e0b', fontSize:12}},
            catTotal>0?eur(catTotal):'–', ' ', isExp?'▲':'▼'
          )
        ),
        isExp && rows.map(d => {
          const on = isActif(d);
          return React.createElement('div', {key:d.i, style:{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
            borderBottom:'1px solid #111827', opacity:on?1:0.5, transition:'opacity .2s'
          }},
            React.createElement(Toggle, {val:d.actif, onChange:v=>toggle(d.i,v)}),
            React.createElement('div', {style:{flex:1, minWidth:0}},
              React.createElement('div', {style:{fontSize:12, fontWeight:500, color:on?'#e2e8f0':'#475569', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}},
                d.actif==="🔒" ? React.createElement('span',null, React.createElement(Tag,{color:'blue'},'🔒'), ' ', d.label) : d.label
              ),
              d.remarque && React.createElement('div', {style:{fontSize:10,...S.muted}}, d.remarque)
            ),
            d.actif==="🔒"
              ? React.createElement('span',{style:{...S.mono,fontSize:13,color:'#e2e8f0',flexShrink:0}},eur(d.montant))
              : React.createElement(NumInput,{value:d.montant, onChange:v=>setMontant(d.i,v)})
          );
        })
      );
    }),

    // Total
    React.createElement('div', {style:{...S.card, background:'#052e16', border:'1px solid #166534'}},
      React.createElement('div', {style:{display:'flex', justifyContent:'space-between', padding:'14px 16px', alignItems:'center'}},
        React.createElement('div',null,
          React.createElement('div',{style:{fontWeight:700,color:'#4ade80',fontSize:14}},"✅ Budget disponible"),
          React.createElement('div',{style:{...S.mono,fontSize:10,...S.muted,marginTop:2}},eur(dispo*12)+" / an")
        ),
        React.createElement('div',{style:{...S.kpiVal,...S.pos,fontSize:22}},eur(dispo))
      )
    )
  );
}

// ── TAB: PROJECTION ───────────────────────────────────────────────────────
function TabProjection({depenses, mobilierByMois, cautionByMois, projetsTotal}) {
  const [avions, setAvions] = useState(()=>loadStore('avions-v1', Array(13).fill(0).map((_,i)=>i===0?1:0)));
  const [extras, setExtras] = useState(()=>loadStore('extras-v1', Array(13).fill(0)));

  useEffect(()=>saveStore('avions-v1',avions),[avions]);
  useEffect(()=>saveStore('extras-v1',extras),[extras]);

  const proj = useMemo(()=>calcProjection(depenses,mobilierByMois,cautionByMois,projetsTotal,avions,extras),
    [depenses,mobilierByMois,cautionByMois,projetsTotal,avions,extras]);

  const ecoCumul = useMemo(()=>{ let c=0; return proj.map(m=>{c+=m.eco;return c;}); },[proj]);

  return React.createElement('div', {style:S.page},
    React.createElement('div', {style:S.infoBox},
      "📅 Solde début Mars 2026 : ", React.createElement('strong',null,eur(SOLDE_DEBUT)),
      " · Salaire net : ", React.createElement('strong',null,eur(SALAIRE_NET)+"/mois"), " (versé fin de mois)"
    ),

    React.createElement('div', {style:S.card},
      React.createElement('div',{style:S.sectHdr},"🔧 Ajustements par mois"),
      proj.map((m,i)=>{
        const hasExtra = m.avion>0||m.meuble>0||m.caution>0||m.projet>0||m.extra>0;
        return React.createElement('div', {key:i, style:{padding:'10px 12px', borderBottom:'1px solid #111827'}},
          // Header mois
          React.createElement('div', {style:{display:'flex', justifyContent:'space-between', marginBottom:8}},
            React.createElement('span', {style:{fontWeight:600, fontSize:13}}, m.label),
            React.createElement('span', {style:{...S.mono, fontSize:11, color:m.avantSalaire<0?'#ef4444':'#475569'}},
              "Avant salaire : ", React.createElement('span',{style:{fontWeight:600}},eur(m.avantSalaire))
            )
          ),
          // A/R avion
          React.createElement('div', {style:{display:'flex', alignItems:'center', gap:8, marginBottom:6}},
            React.createElement('span',{style:{fontSize:11,...S.muted,flex:1}},"✈️ A/R avion (×350€)"),
            React.createElement('button',{onClick:()=>{const n=[...avions];n[i]=Math.max(0,n[i]-1);setAvions(n)},
              style:{background:'#1e293b',border:'1px solid #334155',color:'#e2e8f0',width:28,height:28,borderRadius:6,cursor:'pointer',fontSize:16}},"-"),
            React.createElement('span',{style:{...S.mono,fontSize:13,width:20,textAlign:'center'}},avions[i]),
            React.createElement('button',{onClick:()=>{const n=[...avions];n[i]=(n[i]||0)+1;setAvions(n)},
              style:{background:'#1e293b',border:'1px solid #334155',color:'#e2e8f0',width:28,height:28,borderRadius:6,cursor:'pointer',fontSize:16}},"+"),
            avions[i]>0 && React.createElement('span',{style:{...S.mono,fontSize:11,...S.neg}},"-"+eur(m.avion))
          ),
          // Extra recette
          React.createElement('div', {style:{display:'flex', alignItems:'center', gap:8}},
            React.createElement('span',{style:{fontSize:11,...S.muted,flex:1}},"💚 Extra recette"),
            React.createElement(NumInput,{value:extras[i], onChange:v=>{const n=[...extras];n[i]=v;setExtras(n)}, style:{width:90}})
          ),
          // Charges auto
          hasExtra && React.createElement('div', {style:{marginTop:8, background:'#0c1628', borderRadius:6, padding:'6px 8px', fontSize:11, ...S.muted}},
            m.meuble>0 && React.createElement('div',null,"🛋️ Ameublement : -"+eur(m.meuble)),
            m.caution>0 && React.createElement('div',null,"🔑 Caution : -"+eur(m.caution)),
            m.projet>0 && React.createElement('div',null,"🎯 Projets : -"+eur(m.projet)),
          ),
          // Résultats
          React.createElement('div', {style:{marginTop:8, display:'grid', gridTemplateColumns:'1fr 1fr', gap:4}},
            ...[
              ["Avant salaire", m.avantSalaire, m.avantSalaire<0],
              ["Solde fin mois", m.finMois, false],
              ["Économie mois", m.eco, m.eco<0],
              ["Éco. cumulée", ecoCumul[i], ecoCumul[i]<0],
            ].map(([lbl,v,isNeg],j)=>React.createElement('div',{key:j,style:{background:'#0c1628',borderRadius:6,padding:'6px 8px'}},
              React.createElement('div',{style:{fontSize:9,...S.muted}},lbl),
              React.createElement('div',{style:{...S.mono,fontSize:12,color:isNeg?'#ef4444':(v>0?'#22c55e':'#94a3b8'),fontWeight:600}},eur(v))
            ))
          )
        );
      })
    )
  );
}

// ── TAB: AMEUBLEMENT ──────────────────────────────────────────────────────
function TabAmeublement({mobilier, setMobilier, caution, setCaution}) {
  const total   = mobilier.reduce((s,m)=>s+m.prix,0);
  const paye    = mobilier.filter(m=>m.paye==="✓").reduce((s,m)=>s+m.prix,0);
  const cautionTotal = caution.reduce((s,c)=>s+c.montant,0);

  const toggleMob = i => { const n=[...mobilier]; n[i]={...n[i],paye:n[i].paye==="✓"?"✗":"✓"}; setMobilier(n); };
  const toggleCaution = i => { const n=[...caution]; n[i]={...n[i],paye:n[i].paye==="✓"?"✗":"✓"}; setCaution(n); };

  const pieces = [...new Set(mobilier.map(m=>m.piece))];

  return React.createElement('div', {style:S.page},

    React.createElement('div', {style:S.kpiGrid},
      ...[
        {lbl:"🛋️ Total mobilier",    val:eur(total),         cls:'warn'},
        {lbl:"✅ Déjà réglé",        val:eur(paye),          cls:'pos'},
        {lbl:"⏳ Reste à régler",    val:eur(total-paye),    cls:'neg'},
        {lbl:"🔑 Caution (récup.)", val:eur(cautionTotal),  cls:''},
      ].map((k,i)=>React.createElement('div',{key:i,style:S.kpiBox},
        React.createElement('div',{style:S.kpiLbl},k.lbl),
        React.createElement('div',{style:{...S.kpiVal,...(k.cls?S[k.cls]:{color:'#a78bfa'}),fontSize:18}},k.val)
      ))
    ),

    React.createElement('div', {style:S.card},
      React.createElement('div',{style:S.sectHdr},"🛋️ Mobilier"),
      pieces.map(piece => {
        const items = mobilier.map((m,i)=>({...m,i})).filter(m=>m.piece===piece);
        return React.createElement('div', {key:piece},
          React.createElement('div',{style:{padding:'6px 12px',background:'#0a0f1e',fontSize:10,color:'#334155',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em'}},piece),
          items.map(m => React.createElement('div', {key:m.i, style:{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
            borderBottom:'1px solid #111827', opacity:m.paye==="✓"?1:0.6
          }},
            React.createElement(Toggle, {val:m.paye, onChange:()=>toggleMob(m.i)}),
            React.createElement('div', {style:{flex:1, minWidth:0}},
              React.createElement('div',{style:{fontSize:12,fontWeight:500,color:'#e2e8f0'}},m.article),
              React.createElement('div',{style:{fontSize:10,...S.muted}},m.fournisseur+(m.mois?" · "+m.mois:""))
            ),
            React.createElement('div', {style:{textAlign:'right', flexShrink:0}},
              m.prix>0
                ? React.createElement('span',{style:{...S.mono,fontSize:13,color:'#e2e8f0'}},eur(m.prix))
                : React.createElement('span',{style:{...S.mono,fontSize:11,...S.muted}},"–"),
              React.createElement('div',null, m.paye==="✓" ? React.createElement(Tag,{color:'green'},"✅") : React.createElement(Tag,{color:'amber'},"⏳"))
            )
          ))
        );
      })
    ),

    React.createElement('div', {style:S.card},
      React.createElement('div',{style:S.sectHdr},"🔑 Caution — 1 330 € en 3 versements"),
      caution.map((c,i) => React.createElement('div', {key:i, style:{
        display:'flex', alignItems:'center', gap:10, padding:'12px', borderBottom:'1px solid #111827'
      }},
        React.createElement(Toggle, {val:c.paye, onChange:()=>toggleCaution(i)}),
        React.createElement('div', {style:{flex:1}},
          React.createElement('div',{style:{fontSize:12,fontWeight:500}},c.label),
          React.createElement('div',{style:{fontSize:11,...S.muted}},c.mois)
        ),
        React.createElement('div', {style:{textAlign:'right'}},
          React.createElement('div',{style:{...S.mono,fontSize:13,color:'#a78bfa'}},eur(c.montant)),
          React.createElement('div',null, c.paye==="✓"?React.createElement(Tag,{color:'green'},"✅ Payé"):React.createElement(Tag,{color:'amber'},"⏳ À payer"))
        )
      )),
      React.createElement('div',{style:{padding:'10px 12px'}},
        React.createElement('div',{style:S.infoBox},
          "ℹ️ La caution est restituée à la fin du bail dans les 3 mois suivant le départ (§4 du contrat). Elle sera récupérée."
        )
      )
    )
  );
}

// ── TAB: PROJETS ──────────────────────────────────────────────────────────
function TabProjets({projets, setProjets}) {
  const MOIS_OPTS = ["—",...MOIS_LABELS];

  const update = (i,k,v) => { const n=[...projets]; n[i]={...n[i],[k]:v}; setProjets(n); };
  const add = () => setProjets([...projets,{nom:"Nouveau projet",cat:"Week-end",desc:"",m1:"—",v1:0,m2:"—",v2:0,m3:"—",v3:0}]);
  const remove = i => { const n=[...projets]; n.splice(i,1); setProjets(n); };

  const totals = useMemo(()=>{
    const t={};
    MOIS_LABELS.forEach(m=>{t[m]=projets.reduce((s,p)=>{
      if(p.m1===m)s+=p.v1||0; if(p.m2===m)s+=p.v2||0; if(p.m3===m)s+=p.v3||0; return s;
    },0);});
    return t;
  },[projets]);

  return React.createElement('div', {style:S.page},
    React.createElement('div',{style:S.infoBox},"🎯 Planifie tes projets · les montants s'intègrent automatiquement dans la Projection"),

    React.createElement('button', {
      onClick:add,
      style:{width:'100%',background:'#1d4ed8',border:'none',borderRadius:10,padding:'12px',color:'#fff',fontSize:14,fontWeight:600,marginBottom:12,cursor:'pointer'}
    },"+ Ajouter un projet"),

    projets.map((p,i) => {
      const tot = (p.v1||0)+(p.v2||0)+(p.v3||0);
      return React.createElement('div', {key:i, style:S.card},
        React.createElement('div', {style:{...S.sectHdr,display:'flex',justifyContent:'space-between',alignItems:'center'}},
          React.createElement('input',{
            value:p.nom,
            onChange:e=>update(i,'nom',e.target.value),
            style:{background:'transparent',border:'none',color:'#60a5fa',fontSize:11,fontWeight:600,fontFamily:'inherit',flex:1}
          }),
          React.createElement('div',{style:{display:'flex',gap:6,alignItems:'center'}},
            tot>0&&React.createElement('span',{style:{...S.mono,...S.warn,fontSize:12}},eur(tot)),
            React.createElement('button',{onClick:()=>remove(i),
              style:{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:18,lineHeight:1,padding:'0 4px'}},"×")
          )
        ),
        React.createElement('div',{style:{padding:'10px 12px'}},
          // Ligne 1
          React.createElement('div',{style:{display:'flex',gap:8,marginBottom:8,alignItems:'center'}},
            React.createElement('span',{style:{fontSize:11,...S.muted,width:40}},"Mois 1"),
            React.createElement('select',{
              value:p.m1, onChange:e=>update(i,'m1',e.target.value),
              style:{background:'#1e293b',border:'1px solid #334155',color:'#e2e8f0',padding:'5px 6px',borderRadius:6,fontSize:11,flex:1,fontFamily:'inherit'}
            }, MOIS_OPTS.map(m=>React.createElement('option',{key:m,value:m},m))),
            React.createElement(NumInput,{value:p.v1,onChange:v=>update(i,'v1',v)})
          ),
          // Ligne 2
          React.createElement('div',{style:{display:'flex',gap:8,marginBottom:8,alignItems:'center'}},
            React.createElement('span',{style:{fontSize:11,...S.muted,width:40}},"Mois 2"),
            React.createElement('select',{
              value:p.m2, onChange:e=>update(i,'m2',e.target.value),
              style:{background:'#1e293b',border:'1px solid #334155',color:'#e2e8f0',padding:'5px 6px',borderRadius:6,fontSize:11,flex:1,fontFamily:'inherit'}
            }, MOIS_OPTS.map(m=>React.createElement('option',{key:m,value:m},m))),
            React.createElement(NumInput,{value:p.v2,onChange:v=>update(i,'v2',v)})
          ),
          // Ligne 3
          React.createElement('div',{style:{display:'flex',gap:8,alignItems:'center'}},
            React.createElement('span',{style:{fontSize:11,...S.muted,width:40}},"Mois 3"),
            React.createElement('select',{
              value:p.m3, onChange:e=>update(i,'m3',e.target.value),
              style:{background:'#1e293b',border:'1px solid #334155',color:'#e2e8f0',padding:'5px 6px',borderRadius:6,fontSize:11,flex:1,fontFamily:'inherit'}
            }, MOIS_OPTS.map(m=>React.createElement('option',{key:m,value:m},m))),
            React.createElement(NumInput,{value:p.v3,onChange:v=>update(i,'v3',v)})
          )
        )
      );
    }),

    React.createElement('div',{style:S.card},
      React.createElement('div',{style:S.sectHdr},"📅 Total par mois → impact projection"),
      React.createElement('div',{style:{overflowX:'auto'}},
        React.createElement('table',{style:{borderCollapse:'collapse',minWidth:480}},
          React.createElement('tbody',null,
            React.createElement('tr',null,
              MOIS_LABELS.map((m,i)=>React.createElement('td',{key:i,style:{padding:'8px 6px',textAlign:'center',borderBottom:'1px solid #111827',fontSize:10,...S.muted,whiteSpace:'nowrap'}},m))
            ),
            React.createElement('tr',null,
              MOIS_LABELS.map((m,i)=>React.createElement('td',{key:i,style:{padding:'6px',textAlign:'center',fontSize:11,...S.mono}},
                totals[m]>0?React.createElement('span',{style:S.neg},eur(totals[m])):React.createElement('span',{style:S.muted},'–')
              ))
            )
          )
        )
      )
    )
  );
}

// ── APP PRINCIPALE ────────────────────────────────────────────────────────
const TABS = [
  {id:0, icon:"📊", label:"Bord"},
  {id:1, icon:"✅", label:"Dépenses"},
  {id:2, icon:"📅", label:"Projection"},
  {id:3, icon:"🏠", label:"Meubles"},
  {id:4, icon:"🎯", label:"Projets"},
];

function App() {
  const [tab,       setTab]       = useState(0);
  const [depenses,  setDepensesRaw]  = useState(()=>loadStore('depenses-v1',  INIT_DEPENSES));
  const [mobilier,  setMobilierRaw]  = useState(()=>loadStore('mobilier-v1',  INIT_MOBILIER));
  const [caution,   setCautionRaw]   = useState(()=>loadStore('caution-v1',   INIT_CAUTION));
  const [projets,   setProjetsRaw]   = useState(()=>loadStore('projets-v1',   INIT_PROJETS));

  const setDepenses = v => { setDepensesRaw(v); saveStore('depenses-v1', v); };
  const setMobilier = v => { setMobilierRaw(v); saveStore('mobilier-v1', v); };
  const setCaution  = v => { setCautionRaw(v);  saveStore('caution-v1',  v); };
  const setProjets  = v => { setProjetsRaw(v);  saveStore('projets-v1',  v); };

  const mobilierByMois = useMemo(()=>{
    const t={};
    mobilier.forEach(m=>{ if(m.paye==="✓"&&m.mois&&m.prix>0) t[m.mois]=(t[m.mois]||0)+m.prix; });
    return t;
  },[mobilier]);

  const cautionByMois = useMemo(()=>{
    const t={};
    caution.forEach(c=>{ if(c.paye!=="✓") t[c.mois]=(t[c.mois]||0)+c.montant; });
    return t;
  },[caution]);

  const projetsTotal = useMemo(()=>{
    const t={};
    projets.forEach(p=>{
      if(p.m1&&p.m1!=="—"&&p.v1) t[p.m1]=(t[p.m1]||0)+(p.v1||0);
      if(p.m2&&p.m2!=="—"&&p.v2) t[p.m2]=(t[p.m2]||0)+(p.v2||0);
      if(p.m3&&p.m3!=="—"&&p.v3) t[p.m3]=(t[p.m3]||0)+(p.v3||0);
    });
    return t;
  },[projets]);

  const proj = useMemo(()=>
    calcProjection(depenses,mobilierByMois,cautionByMois,projetsTotal,Array(13).fill(0).map((_,i)=>i===0?1:0),Array(13).fill(0)),
    [depenses,mobilierByMois,cautionByMois,projetsTotal]);

  const {dispo} = calcDepenses(depenses);

  return React.createElement('div', {id:'root'},
    // Status bar spacer
    React.createElement('div', {style:{height:'env(safe-area-inset-top)',background:'#080d1a'}}),

    // Header
    React.createElement('div', {style:{
      background:'#080d1a', borderBottom:'1px solid #1e3a5f',
      padding:'10px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0
    }},
      React.createElement('div', null,
        React.createElement('div',{style:{fontWeight:700,fontSize:15,color:'#e2e8f0'}},"💰 Budget Victor"),
        React.createElement('div',{style:{fontSize:10,color:'#334155',marginTop:1}},"Big Dutchman · 2026")
      ),
      React.createElement('div',{style:{textAlign:'right'}},
        React.createElement('div',{style:{fontSize:9,color:'#475569'}},"Budget dispo"),
        React.createElement('div',{style:{...S.mono,fontWeight:700,fontSize:16,color:dispo>=0?'#22c55e':'#ef4444'}},eur(dispo))
      )
    ),

    // Content
    React.createElement('div', {style:{flex:1,overflow:'hidden',position:'relative'}},
      tab===0 && React.createElement(TabBord,       {depenses, proj}),
      tab===1 && React.createElement(TabDepenses,   {depenses, setDepenses}),
      tab===2 && React.createElement(TabProjection, {depenses, mobilierByMois, cautionByMois, projetsTotal}),
      tab===3 && React.createElement(TabAmeublement,{mobilier, setMobilier, caution, setCaution}),
      tab===4 && React.createElement(TabProjets,    {projets, setProjets}),
    ),

    // Bottom Nav
    React.createElement('div', {style:{
      flexShrink:0, background:'#080d1a', borderTop:'1px solid #1e3a5f',
      display:'flex', paddingBottom:'env(safe-area-inset-bottom)'
    }},
      TABS.map(t => React.createElement('button', {
        key:t.id, onClick:()=>setTab(t.id),
        style:{
          flex:1, background:'none', border:'none', padding:'10px 4px',
          display:'flex', flexDirection:'column', alignItems:'center', gap:3,
          cursor:'pointer', borderTop: tab===t.id ? '2px solid #3b82f6':'2px solid transparent',
          transition:'border-color .15s'
        }
      },
        React.createElement('span',{style:{fontSize:18}},t.icon),
        React.createElement('span',{style:{fontSize:9,color:tab===t.id?'#60a5fa':'#475569',fontWeight:tab===t.id?600:400}},t.label)
      ))
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
