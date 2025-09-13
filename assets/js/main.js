(function(){
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if(navToggle && mainNav){
    navToggle.addEventListener('click',()=>{
      const opened = mainNav.style.display === 'flex';
      mainNav.style.display = opened ? 'none' : 'flex';
    });
  }
  const y = document.getElementById('year'); if(y){ y.textContent = new Date().getFullYear(); }

  // Analytics helper (placeholder)
  window.trackEvent = function(name, payload){
    try{ if(window.gtag){ gtag('event', name, payload || {}); } }catch(e){}
  };

  // Reveal on Scroll: auto-annotate common elements
  function addRevealMarkers(){
    const selectors = [
      '.hero h1', '.hero .lead', '.hero .badges .badge',
      '.section-title', '.section-sub', '.price',
      '.packs .card', '.services-premium .feature', '.compare .card',
      '.card', '.feature', '.actions .btn', '.steps .step', '.summary'
    ];
    const nodes = selectors.flatMap(sel => Array.from(document.querySelectorAll(sel)));
    nodes.forEach((el,i)=>{
      if(!el.classList.contains('reveal')) el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i*40, 320) + 'ms';
    });
  }

  function setupObserver(){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
      })
    }, {threshold: .12});
    document.querySelectorAll('.reveal').forEach(el=> io.observe(el));
  }

  document.addEventListener('DOMContentLoaded',()=>{
    addRevealMarkers();
    setupObserver();
  });
})();