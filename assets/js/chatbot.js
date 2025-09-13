(function(){
  // Elise WebBoost Chatbot - Floating widget bottom-right
  const STYLES = `
  :root{
    --elise-gold:#f5c542;--elise-gold-2:#eab308;--elise-bg:#0d0f14;--elise-panel:#12141a;--elise-border:#22242d;--elise-text:#eef2f7;--elise-muted:#97a0b1
  }
  .elise-chat-launcher{position:fixed;right:18px;bottom:18px;z-index:9998;display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;border:1px solid var(--elise-border);background:linear-gradient(135deg,var(--elise-gold),var(--elise-gold-2));color:#111;box-shadow:0 14px 40px -16px rgba(245,197,66,.6);cursor:pointer}
  .elise-chat-launcher:hover{filter:brightness(1.06)}
  .elise-chat-icon{width:26px;height:26px;display:block}
  .elise-chat-wrap{position:fixed;right:18px;bottom:86px;z-index:9999;width:340px;max-width:92vw;border-radius:16px;overflow:hidden;border:1px solid var(--elise-border);background:var(--elise-panel);box-shadow:0 24px 70px -24px rgba(0,0,0,.6);display:none}
  .elise-chat-header{background:linear-gradient(135deg,rgba(245,197,66,.12),rgba(234,179,8,.08));color:var(--elise-text);padding:10px 12px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--elise-border)}
  .elise-dot{width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,var(--elise-gold),var(--elise-gold-2));box-shadow:0 0 16px rgba(245,197,66,.5)}
  .elise-title{font-weight:700}
  .elise-close{margin-left:auto;background:transparent;border:0;color:var(--elise-muted);font-size:18px;cursor:pointer}
  .elise-chat-body{height:340px;background:var(--elise-bg);color:var(--elise-text);padding:12px;overflow:auto}
  .elise-msg{display:flex;gap:8px;margin:8px 0}
  .elise-msg.you{justify-content:flex-end}
  .elise-bubble{max-width:78%;padding:10px 12px;border-radius:14px;border:1px solid var(--elise-border);background:#0f1116}
  .elise-msg.you .elise-bubble{background:linear-gradient(135deg,rgba(245,197,66,.16),rgba(234,179,8,.12));color:#fff}
  .elise-chat-input{display:flex;gap:8px;padding:10px;border-top:1px solid var(--elise-border);background:var(--elise-panel)}
  .elise-input{flex:1;background:#0f1116;border:1px solid var(--elise-border);border-radius:10px;padding:10px;color:#fff}
  .elise-send{background:linear-gradient(135deg,var(--elise-gold),var(--elise-gold-2));border:1px solid rgba(245,197,66,.5);border-radius:10px;color:#111;padding:10px 12px;font-weight:700;cursor:pointer}
  .elise-send:hover{filter:brightness(1.06)}
  .elise-typing{font-size:12px;color:var(--elise-muted);padding:0 12px 10px}
  `;

  if(!document.getElementById('elise-chatbot-style')){
    const s=document.createElement('style'); s.id='elise-chatbot-style'; s.textContent=STYLES; document.head.appendChild(s);
  }

  function createEl(tag, attrs, children){ const el=document.createElement(tag); if(attrs){ Object.entries(attrs).forEach(([k,v])=>{ if(k==='class') el.className=v; else if(k==='html') el.innerHTML=v; else el.setAttribute(k,v); }); } (children||[]).forEach(c=> el.appendChild(c)); return el; }

  function EliseWebBoostChatbot(){
    const sessionId = getOrCreateSession();
    const launcher = createEl('button', {class:'elise-chat-launcher', 'aria-label':'Ouvrir le chat'}, [svgIcon()]);
    const wrap = createEl('div', {class:'elise-chat-wrap'});

    const header = createEl('div', {class:'elise-chat-header'}, [
      createEl('span',{class:'elise-dot'}),
      createEl('div',{class:'elise-title', html:'Élise – WEBOOSTMARTINIQUE'}),
      createEl('button',{class:'elise-close', 'aria-label':'Fermer'}, [document.createTextNode('×')])
    ]);

    const body = createEl('div', {class:'elise-chat-body'});
    const typing = createEl('div', {class:'elise-typing', style:'display:none'}, [document.createTextNode('Élise rédige…')]);
    const input = createEl('div', {class:'elise-chat-input'}, [
      createEl('input', {class:'elise-input', type:'text', placeholder:'Écrivez votre message…'}),
      createEl('button', {class:'elise-send'}, [document.createTextNode('Envoyer')])
    ]);

    wrap.appendChild(header); wrap.appendChild(body); wrap.appendChild(typing); wrap.appendChild(input);
    document.body.appendChild(launcher); document.body.appendChild(wrap);

    function open(){ wrap.style.display='block'; setTimeout(()=> input.querySelector('input').focus(), 50); }
    function close(){ wrap.style.display='none'; }

    launcher.addEventListener('click', open);
    header.querySelector('.elise-close').addEventListener('click', close);

    input.querySelector('input').addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); send(); } });
    input.querySelector('.elise-send').addEventListener('click', send);

    // Greeting
    addMsg('bot', "Bonjour 👋 Je suis Élise. Comment puis-je vous aider ? (packs, délais, devis…)");

    function addMsg(who, text){
      const msg = createEl('div',{class:'elise-msg ' + (who==='you'?'you':'')}, [
        createEl('div',{class:'elise-bubble', html:escapeHtml(text).replace(/\n/g,'<br>')})
      ]);
      body.appendChild(msg); body.scrollTop = body.scrollHeight;
    }

    async function send(){
      const $in = input.querySelector('input');
      const text = ($in.value||'').trim(); if(!text) return;
      $in.value=''; addMsg('you', text);
      typing.style.display='block';
      try{
        const res = await fetch('/api/chat.php', {
          method:'POST', headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ message: text, sessionId, source: window.location.pathname })
        });
        const data = await res.json().catch(()=>({ ok:false, reply:'Désolé, réponse illisible.' }));
        typing.style.display='none';
        if(data && data.reply){ addMsg('bot', data.reply); }
        else if(data && data.error){ addMsg('bot', 'Erreur: ' + data.error); }
        else { addMsg('bot', "Je n'ai pas compris, pouvez-vous reformuler ?"); }
      }catch(err){ typing.style.display='none'; addMsg('bot', 'Réseau indisponible, réessayez.'); }
    }

    function svgIcon(){
      const span=document.createElement('span'); span.className='elise-chat-icon';
      span.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2 5.5A3.5 3.5 0 0 1 5.5 2h13A3.5 3.5 0 0 1 22 5.5v7A3.5 3.5 0 0 1 18.5 16H9.914l-3.707 3.707A1 1 0 0 1 5 19.293V16H5.5A3.5 3.5 0 0 1 2 12.5v-7Z"/></svg>';
      return span;
    }

    function getOrCreateSession(){
      try{ const k='elise_chat_sid'; let v=localStorage.getItem(k); if(!v){ v=String(Date.now())+'-'+Math.random().toString(36).slice(2,8); localStorage.setItem(k,v); } return v; }catch(_){ return String(Date.now()); }
    }

    function escapeHtml(t){ const d=document.createElement('div'); d.innerText=t; return d.innerHTML; }
  }

  // Export & auto-init
  window.EliseWebBoostChatbot = EliseWebBoostChatbot;
  if(!window.eliseChatbot){
    if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', ()=>{ window.eliseChatbot = new EliseWebBoostChatbot(); }); }
    else { window.eliseChatbot = new EliseWebBoostChatbot(); }
  }
})();