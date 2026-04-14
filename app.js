// App core for TRAfrs PRO - localStorage, UI interactions, theme, validation, charts
(function(){
  // Theme toggle (topbar + sidebar)
  const applyTheme = (theme) => {
    if(theme === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    localStorage.setItem('tr_theme', theme);
    const tbtn = document.getElementById('theme-toggle');
    if(tbtn) tbtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  };
  const storedTheme = localStorage.getItem('tr_theme') || 'light';
  applyTheme(storedTheme);
  const btn = document.getElementById('theme-toggle');
  if(btn) btn.addEventListener('click', ()=> applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));
  const btn2 = document.getElementById('theme-toggle-sidebar');
  if(btn2) btn2.addEventListener('click', ()=> applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));

  // Product storage helpers
  function getProducts(){ try{ return JSON.parse(localStorage.getItem('tr_products')||'[]'); }catch(e){ return []; } }
  function saveProducts(list){ localStorage.setItem('tr_products', JSON.stringify(list)); }

  // Render products in any page with #prod-list
  function renderProducts(){
    const list = document.getElementById('prod-list');
    if(!list) return;
    const prods = getProducts();
    list.innerHTML = '';
    if(prods.length === 0){
      list.innerHTML = '<p class="muted">No hay productos. Ve a "Agregar Producto" para crear uno.</p>';
    } else {
      prods.forEach((p, idx) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = '<div><strong>'+escapeHtml(p.nombre)+'</strong><div class="muted">'+escapeHtml(p.tipo)+' • '+escapeHtml(p.descripcion)+'</div></div><div><button class="btn small" data-idx="'+idx+'" onclick="window.app.removeProduct('+idx+')">Eliminar</button></div>';
        list.appendChild(item);
      });
    }
    // update counters if present
    const statProd = document.getElementById('stat-prod');
    if(statProd) statProd.textContent = prods.length;
  }

  // Remove product (exposed)
  function removeProduct(i){
    const prods = getProducts();
    if(i<0 || i>=prods.length) return;
    prods.splice(i,1);
    saveProducts(prods);
    renderProducts();
  }

  // Escape helper
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; }); }

  // Add product form
  document.addEventListener('DOMContentLoaded', ()=>{
    window.app = { removeProduct };

    renderProducts();

    const form = document.getElementById('add-form');
    if(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const tipo = document.getElementById('tipo').value;
        // Validation
        if(!nombre || !descripcion){
          alert('Por favor completa todos los campos.');
          return;
        }
        const prods = getProducts();
        prods.push({ nombre, descripcion, tipo, created: new Date().toISOString() });
        saveProducts(prods);
        // nice animation feedback
        alert('Producto agregado correctamente');
        form.reset();
        renderProducts();
      });
    }

    // Simple login/register simulation (local only for demo)
    const lform = document.getElementById('login-form');
    if(lform){
      lform.addEventListener('submit',(e)=>{
        e.preventDefault();
        const u = document.getElementById('login-user').value.trim();
        const p = document.getElementById('login-pass').value;
        if(!u || !p) return alert('Ingrese credenciales.');
        // fake success
        alert('Inicio de sesión correcto (simulado). Redirigiendo al dashboard...');
        window.location.href = 'dashboard.html';
      });
    }
    const rform = document.getElementById('register-form');
    if(rform){
      rform.addEventListener('submit',(e)=>{
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const pass = document.getElementById('reg-pass').value;
        if(!name || !email || pass.length < 6) return alert('Complete todos los datos correctamente. Contraseña mínimo 6 caracteres.');
        alert('Registro exitoso (simulado). Puedes iniciar sesión.');
        window.location.href = 'login.html';
      });
    }

    // Dashboard chart
    const chartCanvas = document.getElementById('txChart');
    if(chartCanvas && typeof Chart !== 'undefined'){
      const prods = getProducts();
      // Create demo data from product count per type
      const counts = { metodo:0, servicio:0, transaccion:0, comercio:0 };
      prods.forEach(p=> { counts[p.tipo] = (counts[p.tipo]||0)+1 });
      const data = {
        labels: ['Método','Servicio','Transacción','Comercio'],
        datasets: [{
          label: 'Productos por tipo',
          data: [counts.metodo, counts.servicio, counts.transaccion, counts.comercio],
          backgroundColor: ['rgba(30,136,229,0.9)','rgba(3,169,244,0.85)','rgba(0,150,136,0.85)','rgba(153,102,255,0.85)'],
          borderRadius: 6
        }]
      };
      new Chart(chartCanvas.getContext('2d'), { type: 'bar', data, options: { responsive:true, plugins:{legend:{display:false}} } });
      // update stat
      const statTrans = document.getElementById('stat-trans');
      if(statTrans) statTrans.textContent = prods.length * 3; // demo: transactions ~= 3x products
    }

  });

})();
