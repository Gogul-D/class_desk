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
    // Icon buttons don't need text updates, just update the title
    compactBtn.title = dashboard.classList.contains('compact') ? 'Exit compact view' : 'Enter compact view';
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
    if(isDark){
      themeBtn.innerHTML = '<i class=\"fas fa-sun\"></i>';
      themeBtn.title = 'Switch to light mode';
    } else {
      themeBtn.innerHTML = '<i class=\"fas fa-moon\"></i>';
      themeBtn.title = 'Switch to dark mode';
    }
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

/* Authentication Management */
(function(){
  const AUTH_KEY = 'classdesk.user';
  
  // Check if current page requires authentication
  const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
  const isDashboardPage = !isAuthPage && !window.location.pathname.endsWith('index.html') ? true : (window.location.pathname.includes('index.html') || window.location.pathname.includes('students.html') || window.location.pathname.includes('grades.html') || window.location.pathname.includes('assignments.html') || window.location.pathname.includes('settings.html'));
  
  // Redirect unauthenticated users trying to access dashboard
  if(isDashboardPage && !isAuthPage){
    const user = localStorage.getItem(AUTH_KEY);
    if(!user){
      window.location.href = 'login.html';
      return;
    }
  }
  
  // Redirect authenticated users away from login/signup
  if(isAuthPage){
    const user = localStorage.getItem(AUTH_KEY);
    if(user){
      window.location.href = 'index.html';
      return;
    }
  }
  
  // Password visibility toggle handler
  function setupPasswordToggles(){
    document.querySelectorAll('.toggle-password').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        const wrapper = btn.closest('.password-input-wrapper');
        if(!wrapper) return;
        const input = wrapper.querySelector('input[type="password"], input[type="text"]');
        if(!input) return;
        
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
      });
    });
  }

  // Password strength indicator
  function setupPasswordStrength(){
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('strengthIndicator');
    
    if(passwordInput && strengthIndicator){
      passwordInput.addEventListener('input', ()=>{
        const strength = calculatePasswordStrength(passwordInput.value);
        const bar = strengthIndicator.querySelector('.strength-bar');
        if(bar){
          bar.style.width = strength.percent + '%';
          bar.style.background = strength.color;
        }
      });
    }
  }

  function calculatePasswordStrength(password){
    let strength = 0;
    
    if(password.length >= 8) strength += 25;
    if(password.length >= 12) strength += 25;
    if(/[a-z]/.test(password)) strength += 12.5;
    if(/[A-Z]/.test(password)) strength += 12.5;
    if(/[0-9]/.test(password)) strength += 12.5;
    if(/[^a-zA-Z0-9]/.test(password)) strength += 12.5;
    
    strength = Math.min(100, strength);
    
    let color = '#e74c3c'; // weak
    if(strength >= 50) color = '#f39c12'; // medium
    if(strength >= 75) color = '#27ae60'; // strong
    
    return { percent: strength, color };
  }

  // Form validation helper
  function validateEmail(email){
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function clearError(fieldId){
    const errorEl = document.getElementById(fieldId);
    if(errorEl) errorEl.textContent = '';
  }

  function setError(fieldId, message){
    const errorEl = document.getElementById(fieldId);
    if(errorEl) errorEl.textContent = message;
  }
  
  // Handle login form
  const loginForm = document.querySelector('form');
  if(loginForm && window.location.pathname.includes('login.html')){
    setupPasswordToggles();

    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = document.getElementById('email')?.value;
      const password = document.getElementById('password')?.value;
      
      clearError('emailError');
      clearError('passwordError');
      
      let isValid = true;
      
      if(!email){
        setError('emailError', 'Email is required');
        isValid = false;
      } else if(!validateEmail(email)){
        setError('emailError', 'Please enter a valid email');
        isValid = false;
      }
      
      if(!password){
        setError('passwordError', 'Password is required');
        isValid = false;
      } else if(password.length < 6){
        setError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
      }
      
      if(isValid && email && password){
        const user = { email, name: email.split('@')[0] };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        window.location.href = 'index.html';
      }
    });
  }
  
  // Handle signup form
  if(loginForm && window.location.pathname.includes('signup.html')){
    setupPasswordToggles();
    setupPasswordStrength();

    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fullname = document.getElementById('fullname')?.value;
      const email = document.getElementById('email')?.value;
      const password = document.getElementById('password')?.value;
      const confirmPassword = document.getElementById('confirm-password')?.value;
      const terms = document.querySelector('input[name="terms"]')?.checked;
      
      clearError('nameError');
      clearError('emailError');
      clearError('passwordError');
      clearError('confirmError');
      
      let isValid = true;
      
      if(!fullname){
        setError('nameError', 'Full name is required');
        isValid = false;
      } else if(fullname.length < 2){
        setError('nameError', 'Name must be at least 2 characters');
        isValid = false;
      }
      
      if(!email){
        setError('emailError', 'Email is required');
        isValid = false;
      } else if(!validateEmail(email)){
        setError('emailError', 'Please enter a valid email');
        isValid = false;
      }
      
      if(!password){
        setError('passwordError', 'Password is required');
        isValid = false;
      } else if(password.length < 8){
        setError('passwordError', 'Password must be at least 8 characters');
        isValid = false;
      }
      
      if(!confirmPassword){
        setError('confirmError', 'Please confirm your password');
        isValid = false;
      } else if(password !== confirmPassword){
        setError('confirmError', 'Passwords do not match');
        isValid = false;
      }
      
      if(!terms){
        alert('Please agree to the Terms of Service');
        isValid = false;
      }
      
      if(isValid && fullname && email && password){
        const user = { name: fullname, email };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        window.location.href = 'index.html';
      }
    });
  }
  
  // Add logout functionality
  function addLogoutBtn(){
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    if(!sidebar && !mainContent) return; // not a dashboard page
    
    // Add user info and logout to header if it exists
    const header = document.querySelector('.header');
    if(header){
      const user = localStorage.getItem(AUTH_KEY);
      if(user){
        try{
          const userData = JSON.parse(user);
          const userStr = `<span style="margin-right:12px;color:var(--text);">Welcome, <strong>${userData.name}</strong></span>`;
          const logoutBtn = `<button id="logoutBtn" style="padding:8px 12px;background:var(--accent);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 200ms ease;" class="auth-btn">Logout</button>`;
          
          // Find or create user controls area
          let controls = header.querySelector('.user-controls');
          if(!controls){
            controls = document.createElement('div');
            controls.className = 'user-controls';
            controls.style.cssText = 'display:flex;align-items:center;gap:12px;margin-top:12px;';
            header.appendChild(controls);
          }
          controls.innerHTML = userStr + logoutBtn;
          
          document.getElementById('logoutBtn')?.addEventListener('click', ()=>{
            localStorage.removeItem(AUTH_KEY);
            window.location.href = 'login.html';
          });
        }catch(e){}
      }
    }
  }
  
  addLogoutBtn();
})();
