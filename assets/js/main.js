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

  // Simple pack CTA tracking placeholder
  window.trackEvent = function(name, payload){
    if(window.gtag){ gtag('event', name, payload || {}); }
  };
})();