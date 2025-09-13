(function(){
  const state = {
    step: 1,
    pack: null,
    options: {},
    pages: 0,
    activity: '',
    customer: { name:'', email:'', phone:'', company:'' },
    notes: '',
    payment: '50_40_10',
  };

  const PACKS = {
    essentiel: { label:'Essentiel', price: 890, includedPages: 3, deposit: 445 },
    pro: { label:'Pro', price: 1290, includedPages: 6, deposit: 645 },
    premium: { label:'Premium', price: 1790, includedPages: 8, deposit: 895 }
  };

  const OPTIONS = {
    marketing: [
      { id:'gmb', label:'Google My Business optimisé', price:89 },
      { id:'audit_seo', label:'Audit SEO technique complet', price:149 },
      { id:'social', label:'Stratégie réseaux sociaux', price:99 },
      { id:'ga4', label:'Configuration GA4 avancée', price:79 },
    ],
    features: [
      { id:'rdv', label:'Système de prise de RDV automatisé', price:199 },
      { id:'ecom', label:'Module e-commerce (≤20 produits)', price:299 },
      { id:'devis_forms', label:'Formulaires de devis personnalisés', price:119 },
      { id:'chat', label:'Chat en direct automatisé', price:149 },
    ],
    perfsec: [
      { id:'lcp', label:'Optimisation LCP < 1,5s', price:99 },
      { id:'ssl', label:'Certificat SSL + sécurisation avancée', price:69 },
      { id:'backup', label:'Sauvegarde automatique mensuelle', price:39, unit:'/mois' },
      { id:'monitor', label:'Monitoring 24/7 + alertes', price:59, unit:'/mois' },
    ]
  };

  function qs(id){return document.querySelector(id)}
  function qsa(sel){return Array.from(document.querySelectorAll(sel))}
  function money(v){return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v)}

  function loadFromQuery(){
    const params = new URLSearchParams(window.location.search);
    const pack = params.get('pack');
    if(pack && PACKS[pack]){ state.pack = pack; }
  }

  function renderStep(){
    qsa('.step').forEach(el=>el.classList.remove('active'));
    const active = qs(`[data-step="${state.step}"]`); if(active){ active.classList.add('active'); }
    qsa('[data-step-pane]').forEach(p=>p.style.display='none');
    const pane = qs(`[data-step-pane="${state.step}"]`); if(pane){ pane.style.display='grid'; }
    renderSummary();
  }

  function computeTotal(){
    const base = state.pack ? PACKS[state.pack].price : 0;
    let extras = 0;
    Object.values(OPTIONS).flat().forEach(o=>{
      if(state.options[o.id]) extras += o.price;
    });
    return { base, extras, total: base + extras };
  }

  function estimateDelay(){
    // Simple heuristic: base by pack + options count influence
    const base = state.pack==='pro' ? 9 : state.pack==='premium' ? 11 : 10;
    const extra = Math.min(2, Math.floor(Object.values(state.options).filter(Boolean).length/3));
    const min = Math.max(7, base-2+extra);
    const max = Math.min(12, base+extra);
    return {min,max};
  }

  function renderSummary(){
    const s = computeTotal();
    const delay = estimateDelay();
    qs('#sum-pack').textContent = state.pack ? `Pack ${PACKS[state.pack].label}` : '—';
    qs('#sum-pack-price').textContent = state.pack ? money(s.base) : '—';
    qs('#sum-options').textContent = money(s.extras);
    qs('#sum-total').textContent = money(s.total);
    qs('#sum-delay').textContent = `${delay.min}–${delay.max} jours`;
    qs('#sum-deposit').textContent = state.pack ? money(PACKS[state.pack].deposit) : '—';
  }

  function next(){ state.step = Math.min(6, state.step+1); renderStep(); save(); }
  function prev(){ state.step = Math.max(1, state.step-1); renderStep(); save(); }

  function bind(){
    // Step navigation
    qsa('[data-next]').forEach(b=>b.addEventListener('click',next));
    qsa('[data-prev]').forEach(b=>b.addEventListener('click',prev));

    // Pack selection
    qsa('input[name="pack"]').forEach(r=>{
      r.addEventListener('change',()=>{ state.pack = r.value; renderSummary(); save(); })
    });

    // Options
    qsa('input[data-option]').forEach(cb=>{
      cb.addEventListener('change',()=>{ state.options[cb.dataset.option] = cb.checked; renderSummary(); save(); })
    });

    // Activity / pages (no price change for MVP)
    const pages = qs('#pages'); if(pages){ pages.addEventListener('input',()=>{ state.pages = parseInt(pages.value||'0',10); save(); }) }
    const activity = qs('#activity'); if(activity){ activity.addEventListener('input',()=>{ state.activity = activity.value; save(); }) }

    // Customer info
    ['name','email','phone','company'].forEach(k=>{
      const el = qs(`#c_${k}`); if(!el) return; el.addEventListener('input',()=>{ state.customer[k]=el.value; save(); })
    })
    const notes = qs('#notes'); if(notes){ notes.addEventListener('input',()=>{ state.notes = notes.value; save(); }) }

    qsa('input[name="pay"]').forEach(r=>r.addEventListener('change',()=>{ state.payment=r.value; save(); }))

    // Submit
    const form = qs('#finalize'); if(form){
      form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const btn = qs('#submitBtn'); if(btn){ btn.disabled = true; btn.textContent = 'Envoi…'; }
        const payload = { pack: state.pack, options: state.options, pages: state.pages, activity: state.activity, totals: computeTotal(), delay: estimateDelay(), customer: state.customer, notes: state.notes, payment: state.payment };
        try{
          const res = await fetch('/api/send-quote.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload), credentials:'same-origin' });
          const data = await res.json();
          if(data.ok){ showAlert('success', `Devis envoyé ✔️\nRéférence: ${data.quoteId}`); localStorage.setItem('lastQuoteId', data.quoteId); }
          else{ showAlert('error', data.error||'Erreur lors de l\'envoi'); }
        }catch(err){ showAlert('error', 'Réseau indisponible, réessayez.'); }
        finally{ if(btn){ btn.disabled=false; btn.textContent='Finaliser ma commande'; } }
      })
    }
  }

  function showAlert(type,msg){
    const box = qs('#alertBox'); if(!box) return; box.innerHTML = `<div class="alert alert-${type}">${msg.replace(/\n/g,'<br>')}</div>`; window.scrollTo({top:0,behavior:'smooth'});
  }

  function save(){ localStorage.setItem('devisState', JSON.stringify(state)); }
  function load(){ try{ const s = JSON.parse(localStorage.getItem('devisState')||'{}'); Object.assign(state,s||{}); }catch(_){} }

  function initPrefill(){
    // Prefill pack from query
    if(state.pack){ const el = qs(`input[name="pack"][value="${state.pack}"]`); if(el){ el.checked = true; } }
    // Prefill options
    Object.keys(state.options||{}).forEach(id=>{ const el = qs(`input[data-option="${id}"]`); if(el) el.checked = !!state.options[id]; })
    // Customer
    Object.entries(state.customer||{}).forEach(([k,v])=>{ const el = qs(`#c_${k}`); if(el) el.value = v||''; })
    const pages = qs('#pages'); if(pages) pages.value = state.pages||0;
    const activity = qs('#activity'); if(activity) activity.value = state.activity||'';
    const pay = qs(`input[name="pay"][value="${state.payment}"]`); if(pay) pay.checked = true;
  }

  window.__DEVIS__ = { PACKS, OPTIONS, state, computeTotal };

  document.addEventListener('DOMContentLoaded',()=>{
    if(!document.body.classList.contains('page-devis')) return;
    loadFromQuery(); load(); bind(); initPrefill(); renderStep();
  });
})();