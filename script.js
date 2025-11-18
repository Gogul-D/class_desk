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

/* Student Management System */
(function(){
  // Only run on students.html page
  if(!window.location.pathname.includes('students.html')) return;

  const STUDENTS_KEY = 'classdesk.students';
  const modal = document.getElementById('studentModal');
  const studentForm = document.getElementById('studentForm');
  const addStudentBtn = document.getElementById('addStudentBtn');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const studentTableBody = document.getElementById('studentTableBody');
  const searchInput = document.getElementById('searchInput');
  const noStudentsMsg = document.getElementById('noStudentsMsg');
  
  // Verify all elements exist
  if(!modal || !studentForm || !addStudentBtn) return;
  
  let editingId = null;
  let allStudents = [];
  let filteredStudents = [];

  // Initialize student data
  function initializeStudents(){
    const stored = localStorage.getItem(STUDENTS_KEY);
    if(stored){
      try{
        allStudents = JSON.parse(stored);
      } catch(e){
        allStudents = getDefaultStudents();
      }
    } else {
      allStudents = getDefaultStudents();
      saveStudents();
    }
    filteredStudents = [...allStudents];
    renderStudentTable();
  }

  // Default students data
  function getDefaultStudents(){
    return [
      { id: '001', name: 'Jeeva', email: 'jeeva@example.com', attendance: 95 },
      { id: '002', name: 'Ram', email: 'ram@example.com', attendance: 88 },
      { id: '003', name: 'Jeevanraj', email: 'jeevanraj@example.com', attendance: 92 },
      { id: '004', name: 'Jeevanatham', email: 'jeevanatham@example.com', attendance: 98 }
    ];
  }

  // Save students to localStorage
  function saveStudents(){
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(allStudents));
  }

  // Generate unique ID
  function generateId(){
    const maxId = allStudents.length > 0 ? Math.max(...allStudents.map(s => parseInt(s.id))) : 0;
    return String(maxId + 1).padStart(3, '0');
  }

  // Render student table
  function renderStudentTable(){
    if(filteredStudents.length === 0){
      studentTableBody.innerHTML = '';
      noStudentsMsg.style.display = 'block';
      return;
    }

    noStudentsMsg.style.display = 'none';
    studentTableBody.innerHTML = filteredStudents.map(student => `
      <tr>
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.attendance}%</td>
        <td>
          <button class="action-btn edit-btn" data-id="${student.id}" style="background:#3498db;color:white;padding:6px 12px;border:none;border-radius:4px;cursor:pointer;font-size:12px;margin-right:4px;transition:all 200ms ease;">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="action-btn delete-btn" data-id="${student.id}" style="background:#e74c3c;color:white;padding:6px 12px;border:none;border-radius:4px;cursor:pointer;font-size:12px;transition:all 200ms ease;">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');

    // Attach event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        editStudent(id);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        deleteStudent(id);
      });
    });
  }

  // Open modal to add student
  function openAddModal(){
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Add New Student';
    studentForm.reset();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  // Open modal to edit student
  function editStudent(id){
    const student = allStudents.find(s => s.id === id);
    if(!student) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Student';
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentEmail').value = student.email;
    document.getElementById('studentAttendance').value = student.attendance;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  // Delete student with confirmation
  function deleteStudent(id){
    const student = allStudents.find(s => s.id === id);
    if(!student) return;

    if(confirm(`Are you sure you want to delete ${student.name}?`)){
      allStudents = allStudents.filter(s => s.id !== id);
      saveStudents();
      filterStudents(searchInput.value);
    }
  }

  // Close modal
  function closeStudentModal(){
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    editingId = null;
    studentForm.reset();
  }

  // Save student (add or edit)
  function saveStudent(e){
    e.preventDefault();

    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const attendance = parseInt(document.getElementById('studentAttendance').value);

    if(!name || !email || isNaN(attendance)){
      alert('Please fill in all fields correctly');
      return;
    }

    if(editingId){
      // Edit existing student
      const student = allStudents.find(s => s.id === editingId);
      if(student){
        student.name = name;
        student.email = email;
        student.attendance = attendance;
      }
    } else {
      // Add new student
      const newStudent = {
        id: generateId(),
        name: name,
        email: email,
        attendance: attendance
      };
      allStudents.push(newStudent);
    }

    saveStudents();
    closeStudentModal();
    filterStudents(searchInput.value);
  }

  // Filter students by search
  function filterStudents(searchTerm){
    const term = searchTerm.toLowerCase();
    filteredStudents = allStudents.filter(student =>
      student.name.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      student.id.includes(term)
    );
    renderStudentTable();
  }

  // Event listeners
  addStudentBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openAddModal();
  });

  if(closeModal){
    closeModal.addEventListener('click', (e) => {
      e.preventDefault();
      closeStudentModal();
    });
  }

  if(cancelBtn){
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeStudentModal();
    });
  }

  studentForm.addEventListener('submit', saveStudent);

  if(searchInput){
    searchInput.addEventListener('input', (e) => {
      filterStudents(e.target.value);
    });
  }

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if(e.target === modal){
      closeStudentModal();
    }
  });

  // Initialize on page load
  initializeStudents();

})();
