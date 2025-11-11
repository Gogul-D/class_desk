// Toggle compact dashboard view and persist preference in localStorage
(function(){
  const dashboard = document.querySelector('.dashboard');
  if(!dashboard) return; // nothing to do without dashboard

  /* Compact toggle */
  const compactBtn = document.getElementById('toggleCompact');
  const COMPACT_KEY = 'dashboard.compact';

  function applyCompactFromStorage(){
    const val = localStorage.getItem(COMPACT_KEY);
    if(val === 'true') dashboard.classList.add('compact');
    else dashboard.classList.remove('compact');
    updateCompactButton();
  }

  function updateCompactButton(){
    if(!compactBtn) return;
    compactBtn.textContent = dashboard.classList.contains('compact') ? 'Exit compact' : 'Toggle compact';
  }

  if(compactBtn){
    compactBtn.addEventListener('click', ()=>{
      dashboard.classList.toggle('compact');
      const isCompact = dashboard.classList.contains('compact');
      localStorage.setItem(COMPACT_KEY, isCompact ? 'true' : 'false');
      updateCompactButton();
    });
  }

  /* Theme toggle (light/dark) */
  const themeBtn = document.getElementById('toggleTheme');
  const THEME_KEY = 'dashboard.theme'; // values: 'light' or 'dark'

  function applyThemeFromStorage(){
    const val = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(val);
    updateThemeButton();
  }

  function setTheme(name){
    if(name === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }

  function updateThemeButton(){
    if(!themeBtn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeBtn.textContent = isDark ? 'Light mode' : 'Dark mode';
  }

  if(themeBtn){
    themeBtn.addEventListener('click', ()=>{
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      setTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
      updateThemeButton();
    });
  }

  // initialise both
  applyCompactFromStorage();
  applyThemeFromStorage();

})();
