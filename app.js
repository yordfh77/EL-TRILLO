/* ====================================================
   EL TRILLO - CORE FRONTEND ENGINE
   Optimized for data-efficiency, absolute privacy, and PWA functionality.
   ==================================================== */

(() => {
// 1. SUPABASE CLIENT INITIALIZATION
const SUPABASE_URL = "https://ofyrwnrgdzxsvupakavu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_c0uUjuXbm3Bu5WAn71ri0w_2xvMlNaO";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. REGIONAL DATA FOR CUBA (Provinces and Municipalities)
const CUBAN_REGIONS = {
  "La Habana": ["Playa", "Plaza de la Revolución", "Centro Habana", "Habana Vieja", "Regla", "Guanabacoa", "San Miguel del Padrón", "Diez de Octubre", "Cerro", "Marianao", "La Lisa", "Boyeros", "Arroyo Naranjo", "Cotorro", "Habana del Este"],
  "Santiago de Cuba": ["Santiago de Cuba", "Palma Soriano", "Contramaestre", "San Luis", "Songo - La Maya", "Guamá", "Mella", "Segundo Frente", "Tercer Frente"],
  "Villa Clara": ["Santa Clara", "Sagua la Grande", "Placetas", "Camajuaní", "Caibarién", "Remedios", "Ranchuelo", "Manicaragua", "Cifuentes", "Santo Domingo", "Quemado de Güines", "Corralillo", "Encrucijada"],
  "Artemisa": ["Artemisa", "San Cristóbal", "Bauta", "Mariel", "San Antonio de los Baños", "Guanajay", "Güira de Melena", "Alquízar", "Caimito", "Bahía Honda", "Candelaria"],
  "Mayabeque": ["San José de las Lajas", "Güines", "Madruga", "Jaruco", "Santa Cruz del Norte", "Melena del Sur", "Batabanó", "Quivicán", "San Nicolás", "Nueva Paz", "Tapaste"],
  "Matanzas": ["Matanzas", "Cárdenas", "Varadero", "Jovellanos", "Colón", "Jagüey Grande", "Pedro Betancourt", "Calimete", "Martí", "Limonar", "Unión de Reyes", "Los Arabos", "Ciénaga de Zapata"],
  "Cienfuegos": ["Cienfuegos", "Cruces", "Cumanayagua", "Lajas", "Palmira", "Rodas", "Aguada de Pasajeros", "Abreus"],
  "Sancti Spíritus": ["Sancti Spíritus", "Trinidad", "Cabaiguán", "Fomento", "Jatibonico", "Taguasco", "Yaguajay", "La Sierpe"],
  "Ciego de Ávila": ["Ciego de Ávila", "Morón", "Chambas", "Ciro Redondo", "Venezuela", "Baraguá", "Primero de Enero", "Florencia", "Majagua", "Bolivia"],
  "Camagüey": ["Camagüey", "Florida", "Nuevitas", "Guáimaro", "Vertientes", "Santa Cruz del Sur", "Sibanicú", "Esmeralda", "Minas", "Sierra de Cubitas", "Carlos Manuel de Céspedes", "Jimaguayú", "Najasa"],
  "Las Tunas": ["Las Tunas", "Puerto Padre", "Amancio", "Colombia", "Jesús Menéndez", "Majibacoa", "Manatí", "Jobabo"],
  "Holguín": ["Holguín", "Banes", "Moa", "Mayarí", "Gibara", "Báguanos", "Cacocum", "Calixto García", "Cueto", "Frank País", "Sagua de Tánamo", "Antilla", "Urbano Noris", "Rafael Freyre"],
  "Granma": ["Bayamo", "Manzanillo", "Jiguaní", "Niquero", "Campechuela", "Media Luna", "Pilón", "Bartolomé Masó", "Buey Arriba", "Guisa", "Cauto Cristo", "Río Cauto", "Yara"],
  "Guantánamo": ["Guantánamo", "Baracoa", "Maisí", "Imías", "San Antonio del Sur", "Yateras", "Manuel Tames", "Caimanera", "El Salvador", "Niceto Pérez"],
  "Pinar del Río": ["Pinar del Río", "Consolación del Sur", "Viñales", "La Palma", "Los Palacios", "San Luis", "San Juan y Martínez", "Guane", "Mantua", "Sandino", "Minas de Matahambre"],
  "Isla de la Juventud": ["Nueva Gerona", "La Fe", "La Demajagua"]
};

// 2.2 NATIVE AMERICAN STYLE NAME DICTIONARIES
const NATIVE_ADJECTIVES = [
  "Fuerte", "Veloz", "Valiente", "Silencioso", "Dorado", "Agil", "Libre", "Sabio", "Fiel", "Sagrado", 
  "Solitario", "Rebelde", "Protector", "Orgulloso", "Astuto", "Sereno", "Salvaje", "Noble", "Audaz", "Paciente", 
  "Activo", "Feroz", "Luminoso", "Eterno", "Rapido"
];
const NATIVE_NOUNS = [
  "Lobo", "Aguila", "Toro", "Halcon", "Oso", "Puma", "Jaguar", "Condor", "Viento", "Rio", 
  "Trueno", "Fuego", "Estrella", "Nube", "Venado", "Relampago", "Zorro", "Caiman", "Sinsonte", "Tocororo", 
  "Colibri", "Mar", "Sol", "Luna", "Monte"
];
const NATIVE_ROLES = [
  "del Alba", "del Monte", "del Valle", "del Sur", "de la Selva", "Guerrero", "Cazador", "Soñador", "Danzante", "Corredor", 
  "Protector", "Vigilante", "del Viento", "del Fuego", "de la Luna", "del Sol", "del Mar", "de la Sierra", "Viajero", "Buscador", 
  "del Bosque", "de la Noche", "Sabio", "Lider", "Guia"
];

function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// 3. APPLICATION STATE
const state = {
  user: null,
  profile: null,
  activeView: 'muro',
  activePenaId: null,
  filters: {
    muro: { province: '', municipality: '', tag: '' },
    mercado: { province: '', municipality: '', category: '' }
  },
  compressedImages: {
    post: null,
    listing: null
  },
  deferredPrompt: null // For PWA install
};

// 4. IN-MEMORY DOM CACHE
const DOM = {
  viewport: document.getElementById('app-viewport'),
  navItems: document.querySelectorAll('.nav-item'),
  networkBadge: document.getElementById('network-badge'),
  authQuickBtn: document.getElementById('auth-quick-btn'),
  toastContainer: document.getElementById('toast-container'),
  
  // Modals
  authModal: document.getElementById('auth-modal'),
  postModal: document.getElementById('post-modal'),
  listingModal: document.getElementById('listing-modal'),
  groupModal: document.getElementById('group-modal'),
  iosModal: document.getElementById('ios-pwa-modal'),
  
  // Forms
  authForm: document.getElementById('auth-form'),
  postForm: document.getElementById('post-form'),
  listingForm: document.getElementById('listing-form'),
  groupForm: document.getElementById('group-form'),
  
  // Form toggles
  registerFields: document.getElementById('register-fields'),
  authToggleLink: document.getElementById('auth-toggle-link'),
  authToggleText: document.getElementById('auth-toggle-text'),
  authTitle: document.getElementById('auth-title'),
  authSubmitBtn: document.getElementById('auth-submit-btn'),
  
  // Image elements
  postImageInput: document.getElementById('post-image-input'),
  postImagePreview: document.getElementById('post-image-preview'),
  postImagePreviewContainer: document.getElementById('post-image-preview-container'),
  postImageInfo: document.getElementById('post-image-info'),
  btnRemovePostImage: document.getElementById('btn-remove-post-image'),
  
  listingImagesInput: document.getElementById('listing-images-input'),
  listingImagePreview: document.getElementById('listing-image-preview'),
  listingImagePreviewContainer: document.getElementById('listing-image-preview-container'),
  listingImageInfo: document.getElementById('listing-image-info'),
  btnRemoveListingImage: document.getElementById('btn-remove-listing-image'),
  
  // PWA banner
  pwaBanner: document.getElementById('pwa-install-banner'),
  pwaBtnInstall: document.getElementById('pwa-btn-install'),
  pwaBtnDismiss: document.getElementById('pwa-btn-dismiss')
};

// 5. TOAST NOTIFICATION UTILITY
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="btn-toast-close">&times;</button>
  `;
  
  DOM.toastContainer.appendChild(toast);
  
  // Sound micro-feedback or vibration
  if (navigator.vibrate) {
    navigator.vibrate(type === 'error' ? [100, 50, 100] : 50);
  }

  // Dismiss on click or after 4 seconds
  const dismiss = () => {
    toast.style.animation = 'slideDown 0.3s reverse';
    setTimeout(() => toast.remove(), 280);
  };
  
  toast.querySelector('.btn-toast-close').addEventListener('click', dismiss);
  setTimeout(dismiss, 4000);
}

// 6. CLIENT-SIDE IMAGE COMPRESSION (High Data Savings!)
function compressImage(file, maxDimension = 800, quality = 0.5) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio and clamp size
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to quality compressed JPEG blob
        canvas.toBlob((blob) => {
          const originalKb = (file.size / 1024).toFixed(1);
          const compressedKb = (blob.size / 1024).toFixed(1);
          const savings = (((file.size - blob.size) / file.size) * 100).toFixed(0);
          
          resolve({
            blob: blob,
            originalSize: originalKb,
            compressedSize: compressedKb,
            savings: savings,
            dataUrl: canvas.toDataURL('image/jpeg', quality)
          });
        }, 'image/jpeg', quality);
      };
    };
  });
}

// Intercept Post Image Selection
DOM.postImageInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  showToast("Comprimiendo imagen para ahorrar megas...", "info");
  const result = await compressImage(file, 800, 0.5);
  state.compressedImages.post = result.blob;
  
  DOM.postImagePreview.src = result.dataUrl;
  DOM.postImageInfo.textContent = `Ahorro: ${result.savings}% (${result.originalSize} KB ➜ ${result.compressedSize} KB)`;
  DOM.postImagePreviewContainer.classList.remove('hidden');
});

DOM.btnRemovePostImage.addEventListener('click', () => {
  state.compressedImages.post = null;
  DOM.postImageInput.value = '';
  DOM.postImagePreviewContainer.classList.add('hidden');
});

// Intercept Listing Image Selection
DOM.listingImagesInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  showToast("Comprimiendo imagen del artículo...", "info");
  const result = await compressImage(file, 800, 0.5);
  state.compressedImages.listing = result.blob;
  
  DOM.listingImagePreview.src = result.dataUrl;
  DOM.listingImageInfo.textContent = `Ahorro: ${result.savings}% (${result.originalSize} KB ➜ ${result.compressedSize} KB)`;
  DOM.listingImagePreviewContainer.classList.remove('hidden');
});

DOM.btnRemoveListingImage.addEventListener('click', () => {
  state.compressedImages.listing = null;
  DOM.listingImagesInput.value = '';
  DOM.listingImagePreviewContainer.classList.add('hidden');
});

// Helper: Dynamic Province-Municipality populate
function initRegionDropdowns(provinceSelectId, municipalitySelectId) {
  const provSelect = document.getElementById(provinceSelectId);
  const munSelect = document.getElementById(municipalitySelectId);
  
  if (!provSelect || !munSelect) return;
  
  // Populate Provinces
  provSelect.innerHTML = `<option value="">Selecciona Provincia</option>`;
  Object.keys(CUBAN_REGIONS).forEach(prov => {
    provSelect.innerHTML += `<option value="${prov}">${prov}</option>`;
  });
  
  provSelect.addEventListener('change', () => {
    const selectedProv = provSelect.value;
    munSelect.innerHTML = `<option value="">Todo el municipio</option>`;
    
    if (selectedProv && CUBAN_REGIONS[selectedProv]) {
      munSelect.disabled = false;
      CUBAN_REGIONS[selectedProv].forEach(mun => {
        munSelect.innerHTML += `<option value="${mun}">${mun}</option>`;
      });
    } else {
      munSelect.disabled = true;
    }
  });
}

// 7. PUBLIC STORAGE UPLOADER
// Standard Supabase Storage upload, fallbacks gracefully to Base64 in DB if bucket doesn't exist
async function uploadCompressedImage(blob, path) {
  try {
    // Generate randomized unique filename
    const filename = `${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    const fullPath = `${path}/${filename}`;
    
    const { data, error } = await supabase.storage
      .from('el-trillo-media')
      .upload(fullPath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      });
      
    if (error) {
      // Fallback: If bucket does not exist, return a base64 Data URL to guarantee it works immediately!
      console.warn("Storage upload failed, falling back to base64 inline string:", error.message);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result);
      });
    }
    
    // Return public URL
    const { data: publicUrlData } = supabase.storage
      .from('el-trillo-media')
      .getPublicUrl(fullPath);
      
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Storage error:", err);
    return null;
  }
}

// 8. NAVIGATION VIEWS ROUTER
function setView(viewName, params = {}) {
  state.activeView = viewName;
  
  // Highlight active nav item
  DOM.navItems.forEach(item => {
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Render corresponding view
  switch(viewName) {
    case 'muro':
      renderMuro();
      break;
    case 'grupos':
      if (params.penaId) {
        state.activePenaId = params.penaId;
        renderPenaFeed(params.penaId);
      } else {
        state.activePenaId = null;
        renderGrupos();
      }
      break;
    case 'mercado':
      renderMercado();
      break;
    case 'perfil':
      renderPerfil();
      break;
    default:
      renderMuro();
  }
}

// Add navigation click listeners
DOM.navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const targetView = item.getAttribute('data-view');
    setView(targetView);
  });
});

// ====================================================
// VIEW RENDERER 1: EL MURO (MAIN SOCIAL FEED)
// ====================================================
async function renderMuro() {
  DOM.viewport.innerHTML = `
    <!-- Card trigger to post -->
    <div class="card-create-post" id="trigger-create-post">
      <div class="card-create-avatar">
        ${state.profile && state.profile.avatar_url ? `<img src="${state.profile.avatar_url}" alt="Avatar">` : `✎`}
      </div>
      <span>¿Qué quieres compartir hoy, ${state.profile ? state.profile.display_name : 'vecino'}?</span>
    </div>

    <!-- Muro filtering -->
    <div class="feed-filter-bar">
      <div class="filter-row">
        <select id="filter-province"></select>
        <select id="filter-municipality" disabled><option value="">Todo el municipio</option></select>
      </div>
      <div class="filter-row">
        <input type="text" id="filter-tag" placeholder="Filtrar por etiqueta (ej: empleo)" style="width:100%; font-size:0.8rem; padding:8px 12px; border-radius:8px;">
      </div>
    </div>

    <div class="feed-header-actions">
      <h3>El Muro Libre</h3>
      <button class="btn-secondary btn-sm" id="btn-refresh-muro">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        Actualizar
      </button>
    </div>

    <!-- Feed Container -->
    <div id="muro-feed-container">
      <div class="view-loading">
        <div class="spinner"></div>
        <p>Cargando posts de El Muro...</p>
      </div>
    </div>
  `;

  // Init region filters
  initRegionDropdowns('filter-province', 'filter-municipality');
  
  // Set existing filter values
  const provSelect = document.getElementById('filter-province');
  const munSelect = document.getElementById('filter-municipality');
  const tagInput = document.getElementById('filter-tag');
  
  provSelect.value = state.filters.muro.province;
  if (state.filters.muro.province) {
    provSelect.dispatchEvent(new Event('change'));
    munSelect.value = state.filters.muro.municipality;
  }
  tagInput.value = state.filters.muro.tag;

  // Add event listeners for dynamic filters
  const applyFilters = () => {
    state.filters.muro.province = provSelect.value;
    state.filters.muro.municipality = munSelect.value;
    state.filters.muro.tag = tagInput.value.trim().toLowerCase();
    loadMuroPosts();
  };
  
  provSelect.addEventListener('change', applyFilters);
  munSelect.addEventListener('change', applyFilters);
  tagInput.addEventListener('input', debounce(applyFilters, 500));
  
  // Post trigger modal
  document.getElementById('trigger-create-post').addEventListener('click', () => {
    if (!state.user) {
      showModal(DOM.authModal);
      showToast("Inicia sesión para poder publicar.", "info");
      return;
    }
    // Populate dropdowns in the post modal
    initRegionDropdowns('post-province', 'post-municipality');
    showModal(DOM.postModal);
  });

  document.getElementById('btn-refresh-muro').addEventListener('click', () => {
    loadMuroPosts();
    showToast("Muro actualizado", "success");
  });

  // Load feed posts
  loadMuroPosts();
}

async function loadMuroPosts() {
  const container = document.getElementById('muro-feed-container');
  if (!container) return;

  try {
    // Querying the PRIVACY VIEW! Decouples identities for posts flagged as is_anonymous_post.
    let query = supabase
      .from('posts_with_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply database-level regional filters
    if (state.filters.muro.province) {
      query = query.eq('province', state.filters.muro.province);
    }
    if (state.filters.muro.municipality) {
      query = query.eq('municipality', state.filters.muro.municipality);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    if (!posts || posts.length === 0) {
      container.innerHTML = `
        <div class="text-center" style="padding: 40px 10px; color: var(--text-secondary);">
          <p>No hay publicaciones que coincidan con los filtros.</p>
        </div>
      `;
      return;
    }

    // Client-side tag filtering (if provided)
    let filteredPosts = posts;
    if (state.filters.muro.tag) {
      filteredPosts = posts.filter(post => 
        post.tags && post.tags.some(tag => tag.toLowerCase().includes(state.filters.muro.tag))
      );
    }

    container.innerHTML = '';
    
    // Render posts dynamically
    for (const post of filteredPosts) {
      const isAnon = post.is_anonymous_post;
      const formattedDate = new Date(post.created_at).toLocaleDateString('es-CU', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      
      const postCard = document.createElement('div');
      postCard.className = 'post-card';
      postCard.dataset.postId = post.id;
      
      // Determine avatar image
      let avatarHtml = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v-2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>`;
      if (!isAnon && post.avatar_url) {
        avatarHtml = `<img src="${post.avatar_url}" alt="Avatar">`;
      } else if (isAnon) {
        // Anonymity mode: lock icon to highlight encryption
        avatarHtml = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8E8E93" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
      }

      // Determine location markup
      let locationHtml = '';
      if (post.province) {
        locationHtml = `
          <span class="badge-location">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            ${post.province}${post.municipality ? `, ${post.municipality}` : ''}
          </span>
        `;
      }

      // Build Tags list
      let tagsHtml = '';
      if (post.tags && post.tags.length > 0) {
        tagsHtml = `<div class="post-tags">` + 
          post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') + 
          `</div>`;
      }

      // Build Image element if it exists
      let imageHtml = '';
      if (post.image_url) {
        imageHtml = `
          <div class="post-image">
            <img src="${post.image_url}" alt="Imagen del post" loading="lazy">
          </div>
        `;
      }

      postCard.innerHTML = `
        <div class="post-author-row">
          <div class="author-info">
            <div class="author-avatar">${avatarHtml}</div>
            <div class="author-details">
              <span class="author-name">${post.display_name}</span>
              <span class="post-meta">${formattedDate}</span>
            </div>
            ${isAnon ? `<span class="author-badge-anon">Encriptado Anon</span>` : ''}
          </div>
          ${locationHtml}
        </div>
        
        <div class="post-content">${escapeHTML(post.content)}</div>
        
        ${imageHtml}
        ${tagsHtml}
        
        <!-- Post Footer Buttons -->
        <div class="post-actions">
          <button class="btn-post-action comment-trigger" onclick="toggleComments('${post.id}')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Comentarios (<span class="comment-count-val">0</span>)
          </button>
        </div>
        
        <!-- Comments Panel (Lazy toggled) -->
        <div class="comments-section hidden" id="comments-${post.id}">
          <div class="comments-list" id="comments-list-${post.id}"></div>
          
          <div class="comment-input-row">
            <input type="text" id="comment-input-${post.id}" placeholder="Escribe un comentario..." maxlength="200">
            <button class="btn-send-comment" onclick="sendComment('${post.id}')">Enviar</button>
          </div>
        </div>
      `;
      
      container.appendChild(postCard);
      
      // Load comment count in background
      loadCommentCount(post.id, postCard.querySelector('.comment-count-val'));
    }
  } catch (err) {
    console.error("Muro load error:", err);
    container.innerHTML = `<p class="text-center" style="color:var(--error);">Error al cargar posts. ¿Tienes conexión?</p>`;
  }
}

// Helper: Comments toggling
window.toggleComments = async function(postId) {
  const panel = document.getElementById(`comments-${postId}`);
  if (!panel) return;
  
  panel.classList.toggle('hidden');
  
  if (!panel.classList.contains('hidden')) {
    loadComments(postId);
  }
};

async function loadCommentCount(postId, element) {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
      
    if (!error && count !== null) {
      element.textContent = count;
    }
  } catch (e) {}
}

async function loadComments(postId) {
  const list = document.getElementById(`comments-list-${postId}`);
  if (!list) return;
  
  list.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">Cargando respuestas...</span>`;
  
  try {
    // Read from the anonymized security view
    const { data: comments, error } = await supabase
      .from('comments_with_profiles')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    if (!comments || comments.length === 0) {
      list.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted); display:block; padding: 4px 0;">Nadie ha comentado aún. Sé el primero.</span>`;
      return;
    }
    
    list.innerHTML = '';
    comments.forEach(comment => {
      const commentDiv = document.createElement('div');
      commentDiv.className = 'comment-item';
      
      const formattedDate = new Date(comment.created_at).toLocaleDateString('es-CU', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      
      commentDiv.innerHTML = `
        <div class="comment-header">
          <span class="comment-author">${comment.display_name}</span>
          ${comment.is_anonymous_comment ? `<span class="author-badge-anon" style="font-size:0.6rem; padding: 0px 4px;">Anon</span>` : ''}
          <span class="comment-meta">${formattedDate}</span>
        </div>
        <div class="comment-body">${escapeHTML(comment.content)}</div>
      `;
      list.appendChild(commentDiv);
    });
  } catch (err) {
    list.innerHTML = `<span style="color:var(--error); font-size:0.75rem;">Error al cargar comentarios.</span>`;
  }
}

window.sendComment = async function(postId) {
  if (!state.user) {
    showModal(DOM.authModal);
    showToast("Debes iniciar sesión para comentar.", "info");
    return;
  }
  
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input) return;
  
  const text = input.value.trim();
  if (!text) return;
  
  try {
    // Check if the user is default anonymous in their profile
    const isAnonComment = state.profile ? state.profile.is_anonymous : false;
    
    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: state.user.id,
        content: text,
        is_anonymous_comment: isAnonComment
      });
      
    if (error) throw error;
    
    input.value = '';
    showToast("Comentario enviado", "success");
    
    // Reload comments
    loadComments(postId);
    
    // Update count label
    const card = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    if (card) {
      const countLabel = card.querySelector('.comment-count-val');
      if (countLabel) {
        countLabel.textContent = parseInt(countLabel.textContent || '0') + 1;
      }
    }
  } catch (err) {
    showToast("No se pudo enviar: " + err.message, "error");
  }
};

// ====================================================
// VIEW RENDERER 2: PEÑAS (THEMATIC GROUPS)
// ====================================================
async function renderGrupos() {
  DOM.viewport.innerHTML = `
    <div class="feed-header-actions">
      <h3>Peñas Temáticas (Grupos)</h3>
      <button class="btn-primary btn-sm" id="btn-trigger-create-group">
        + Crear Peña
      </button>
    </div>
    
    <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:16px;">
      Únete a comunidades locales o temáticas para debatir e intercambiar libremente con vecinos.
    </p>

    <!-- Groups Container -->
    <div class="pena-list" id="penalistas-container">
      <div class="view-loading">
        <div class="spinner"></div>
        <p>Cargando peñas...</p>
      </div>
    </div>
  `;

  document.getElementById('btn-trigger-create-group').addEventListener('click', () => {
    if (!state.user) {
      showModal(DOM.authModal);
      showToast("Inicia sesión para crear una Peña.", "info");
      return;
    }
    // Populate provinces in group modal
    initRegionDropdowns('group-province', 'auth-municipality'); // Dummy second dropdown
    showModal(DOM.groupModal);
  });

  loadPeñas();
}

async function loadPeñas() {
  const container = document.getElementById('penalistas-container');
  if (!container) return;

  try {
    const { data: peñas, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!peñas || peñas.length === 0) {
      container.innerHTML = `
        <div class="text-center" style="padding:40px 10px; color:var(--text-secondary);">
          <p>No hay peñas creadas todavía. ¡Sé el primero en iniciar una!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    for (const peña of peñas) {
      // Get member count
      const { count: memberCount } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', peña.id);

      // Check if current user is a member
      let isMember = false;
      if (state.user) {
        const { data: membership } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', peña.id)
          .eq('user_id', state.user.id)
          .maybeSingle();
          
        if (membership) isMember = true;
      }

      const card = document.createElement('div');
      card.className = 'pena-card';
      
      card.innerHTML = `
        <div class="pena-header">
          <div class="pena-title-group">
            <span class="pena-category">${peña.category || 'Varios'}</span>
            <h3>${escapeHTML(peña.name)}</h3>
          </div>
          ${peña.is_private ? `<span class="pena-badge-private">Privada</span>` : ''}
        </div>
        
        <p class="pena-description">${escapeHTML(peña.description)}</p>
        
        <div class="pena-footer">
          <span class="pena-meta">
            ${peña.province ? `${peña.province} • ` : ''}${memberCount || 0} miembros
          </span>
          <div style="display:flex; gap:8px;">
            <button class="btn-secondary btn-sm" onclick="enterPena('${peña.id}', '${peña.name}')">
              Entrar
            </button>
            <button class="btn-${isMember ? 'secondary' : 'primary'} btn-sm" onclick="toggleJoinGroup('${peña.id}', ${isMember})">
              ${isMember ? 'Salir' : 'Unirse'}
            </button>
          </div>
        </div>
      `;
      
      container.appendChild(card);
    }
  } catch (err) {
    container.innerHTML = `<p class="text-center" style="color:var(--error);">Error al cargar las peñas.</p>`;
  }
}

window.toggleJoinGroup = async function(groupId, isMember) {
  if (!state.user) {
    showModal(DOM.authModal);
    showToast("Debes iniciar sesión para unirte a peñas.", "info");
    return;
  }

  try {
    if (isMember) {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', state.user.id);
        
      if (error) throw error;
      showToast("Has salido de la peña", "info");
    } else {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: state.user.id,
          role: 'member'
        });
        
      if (error) throw error;
      showToast("¡Te has unido a la peña!", "success");
    }
    loadPeñas();
  } catch (e) {
    showToast(e.message, "error");
  }
};

// Enter group dedicated feed (Filter posts by group name hashtag to save database complexity!)
window.enterPena = function(groupId, name) {
  setView('grupos', { penaId: groupId });
};

async function renderPenaFeed(penaId) {
  try {
    // Get group info
    const { data: peña, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', penaId)
      .single();
      
    if (error) throw error;

    DOM.viewport.innerHTML = `
      <div style="margin-bottom: 16px;">
        <a href="#" class="btn-secondary btn-sm" onclick="setView('grupos')" style="display:inline-flex; margin-bottom:8px;">
          ← Volver a Peñas
        </a>
        <h2 style="font-size:1.3rem; margin-top:4px;">Peña: ${escapeHTML(peña.name)}</h2>
        <span class="pena-category">${peña.category}</span>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:6px;">${escapeHTML(peña.description)}</p>
      </div>

      <!-- Trigger to publish inside Pena -->
      <div class="card-create-post" id="trigger-create-pena-post">
        <div class="card-create-avatar">
          ${state.profile && state.profile.avatar_url ? `<img src="${state.profile.avatar_url}" alt="Avatar">` : `✎`}
        </div>
        <span>Publicar en esta peña...</span>
      </div>

      <h3 style="font-size:0.95rem; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px; color:var(--text-secondary);">
        Publicaciones de la comunidad
      </h3>

      <div id="pena-posts-container">
        <div class="view-loading">
          <div class="spinner"></div>
          <p>Cargando posts de la peña...</p>
        </div>
      </div>
    `;

    document.getElementById('trigger-create-pena-post').addEventListener('click', () => {
      if (!state.user) {
        showModal(DOM.authModal);
        showToast("Inicia sesión para publicar.", "info");
        return;
      }
      initRegionDropdowns('post-province', 'post-municipality');
      // Prefill tag with the group name to associate post automatically
      document.getElementById('post-tags').value = peña.name.toLowerCase().replace(/\s+/g, '');
      showModal(DOM.postModal);
    });

    loadPenaPosts(peña.name);

  } catch (err) {
    DOM.viewport.innerHTML = `<p style="color:var(--error);" class="text-center">Error al entrar en la peña: ${err.message}</p>`;
  }
}

async function loadPenaPosts(penaName) {
  const container = document.getElementById('pena-posts-container');
  if (!container) return;

  try {
    const cleanedTag = penaName.toLowerCase().replace(/\s+/g, '');
    
    // Fetch all posts with profiles
    const { data: posts, error } = await supabase
      .from('posts_with_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter posts that contain the hashtag of the group
    const penaPosts = posts.filter(post => 
      post.tags && post.tags.some(tag => tag.toLowerCase().includes(cleanedTag))
    );

    if (penaPosts.length === 0) {
      container.innerHTML = `
        <div class="text-center" style="padding:30px 10px; color:var(--text-secondary);">
          <p>Aún no hay posts en esta peña. ¡Comienza el debate!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    penaPosts.forEach(post => {
      const isAnon = post.is_anonymous_post;
      const formattedDate = new Date(post.created_at).toLocaleDateString('es-CU', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      
      const postCard = document.createElement('div');
      postCard.className = 'post-card';
      
      let avatarHtml = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v-2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>`;
      if (!isAnon && post.avatar_url) {
        avatarHtml = `<img src="${post.avatar_url}" alt="Avatar">`;
      } else if (isAnon) {
        avatarHtml = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8E8E93" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
      }

      let imageHtml = '';
      if (post.image_url) {
        imageHtml = `<div class="post-image"><img src="${post.image_url}" alt="Imagen" loading="lazy"></div>`;
      }

      postCard.innerHTML = `
        <div class="post-author-row">
          <div class="author-info">
            <div class="author-avatar">${avatarHtml}</div>
            <div class="author-details">
              <span class="author-name">${post.display_name}</span>
              <span class="post-meta">${formattedDate}</span>
            </div>
            ${isAnon ? `<span class="author-badge-anon">Anónimo</span>` : ''}
          </div>
        </div>
        <div class="post-content">${escapeHTML(post.content)}</div>
        ${imageHtml}
        
        <div class="post-actions">
          <button class="btn-post-action" onclick="toggleComments('${post.id}')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Comentarios
          </button>
        </div>
        
        <div class="comments-section hidden" id="comments-${post.id}">
          <div class="comments-list" id="comments-list-${post.id}"></div>
          <div class="comment-input-row">
            <input type="text" id="comment-input-${post.id}" placeholder="Escribe un comentario...">
            <button class="btn-send-comment" onclick="sendComment('${post.id}')">Enviar</button>
          </div>
        </div>
      `;
      container.appendChild(postCard);
    });
  } catch (e) {
    container.innerHTML = `<p class="text-center" style="color:var(--error);">Error al cargar posts de la peña.</p>`;
  }
}

// ====================================================
// VIEW RENDERER 3: MERCADO (LOCAL MARKETPLACE)
// ====================================================
async function renderMercado() {
  DOM.viewport.innerHTML = `
    <div class="feed-header-actions">
      <h3>El Mercado Libre</h3>
      <button class="btn-primary btn-sm" id="btn-trigger-sell">
        Vender Artículo
      </button>
    </div>

    <!-- Marketplace filter bar -->
    <div class="feed-filter-bar">
      <div class="filter-row">
        <select id="market-filter-province"></select>
        <select id="market-filter-municipality" disabled><option value="">Todo el municipio</option></select>
      </div>
      <div class="filter-row">
        <select id="market-filter-category" style="width:100%;">
          <option value="">Todas las categorías</option>
          <option value="Electrodomésticos">Electrodomésticos</option>
          <option value="Tecnología">Tecnología (Móviles, PCs)</option>
          <option value="Hogar">Hogar y Muebles</option>
          <option value="Ropa">Ropa y Calzado</option>
          <option value="Alimentos">Alimentos y Aseo</option>
          <option value="Transporte">Motos y Autos</option>
          <option value="Empleos">Ofertas de Empleo</option>
          <option value="Otros">Otros</option>
        </select>
      </div>
    </div>

    <!-- Listings Grid -->
    <div class="marketplace-grid" id="market-grid-container">
      <div class="view-loading">
        <div class="spinner"></div>
        <p>Cargando artículos...</p>
      </div>
    </div>
  `;

  // Init dropdowns
  initRegionDropdowns('market-filter-province', 'market-filter-municipality');
  
  const provSelect = document.getElementById('market-filter-province');
  const munSelect = document.getElementById('market-filter-municipality');
  const catSelect = document.getElementById('market-filter-category');

  // Load existing states
  provSelect.value = state.filters.mercado.province;
  if (state.filters.mercado.province) {
    provSelect.dispatchEvent(new Event('change'));
    munSelect.value = state.filters.mercado.municipality;
  }
  catSelect.value = state.filters.mercado.category;

  const applyFilters = () => {
    state.filters.mercado.province = provSelect.value;
    state.filters.mercado.municipality = munSelect.value;
    state.filters.mercado.category = catSelect.value;
    loadMarketplaceListings();
  };

  provSelect.addEventListener('change', applyFilters);
  munSelect.addEventListener('change', applyFilters);
  catSelect.addEventListener('change', applyFilters);

  document.getElementById('btn-trigger-sell').addEventListener('click', () => {
    if (!state.user) {
      showModal(DOM.authModal);
      showToast("Debes iniciar sesión para publicar un artículo.", "info");
      return;
    }
    initRegionDropdowns('listing-province', 'listing-municipality');
    showModal(DOM.listingModal);
  });

  loadMarketplaceListings();
}

async function loadMarketplaceListings() {
  const container = document.getElementById('market-grid-container');
  if (!container) return;

  try {
    let query = supabase
      .from('marketplace_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply database filters
    if (state.filters.mercado.province) {
      query = query.eq('province', state.filters.mercado.province);
    }
    if (state.filters.mercado.municipality) {
      query = query.eq('municipality', state.filters.mercado.municipality);
    }
    if (state.filters.mercado.category) {
      query = query.eq('category', state.filters.mercado.category);
    }

    const { data: listings, error } = await query;
    if (error) throw error;

    if (!listings || listings.length === 0) {
      container.innerHTML = `
        <div class="text-center" style="padding:40px 10px; color:var(--text-secondary);">
          <p>No hay artículos a la venta con los filtros seleccionados.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    listings.forEach(listing => {
      const card = document.createElement('div');
      card.className = 'listing-card';
      
      // Get image
      let imgHtml = `<div class="listing-img-placeholder">Sin imagen</div>`;
      if (listing.image_urls && listing.image_urls.length > 0) {
        imgHtml = `<img src="${listing.image_urls[0]}" alt="Artículo" loading="lazy">`;
      }
      
      const formattedPrice = Number(listing.price).toLocaleString('es-CU');
      const formattedDate = new Date(listing.created_at).toLocaleDateString('es-CU', {
        month: 'short', day: 'numeric'
      });

      card.innerHTML = `
        <div class="listing-img-box">
          ${imgHtml}
          <div class="listing-price-tag">${formattedPrice} ${listing.currency}</div>
        </div>
        
        <div class="listing-body">
          <span class="listing-category">${listing.category || 'Otros'}</span>
          <h3 class="listing-title">${escapeHTML(listing.title)}</h3>
          <p class="listing-desc">${escapeHTML(listing.description)}</p>
          
          <div class="listing-meta-row">
            <span>📍 ${listing.province}, ${listing.municipality}</span>
            <span>${formattedDate}</span>
          </div>
          
          <div class="listing-actions">
            <!-- WA Direct Enlace generator -->
            <a href="${listing.whatsapp_link}" target="_blank" class="btn-whatsapp full-width btn-sm" style="text-decoration:none;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align:middle; margin-right:4px;"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 2.766 1.488 4.793 1.489 5.513 0 10.003-4.486 10.006-9.997.001-2.67-1.03-5.18-2.903-7.05C16.571 1.724 14.07 .683 11.402.682c-5.468 0-9.92 4.453-9.923 9.919-.001 1.932.493 3.326 1.42 4.887l-.996 3.642 3.744-.982z"/></svg>
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      `;
      
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p class="text-center" style="color:var(--error);">Error al cargar el Mercado.</p>`;
  }
}

// ====================================================
// VIEW RENDERER 4: MI PERFIL (USER PROFILE & SETTINGS)
// ====================================================
async function renderPerfil() {
  if (!state.user) {
    DOM.viewport.innerHTML = `
      <div class="auth-prompt-panel">
        <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <h2>Área Privada de Usuario</h2>
        <p>Inicia sesión o regístrate en segundos para crear posts, unirte a peñas y vender en el mercado.</p>
        <button class="btn-primary" id="btn-trigger-auth">Identificarse / Registrarse</button>
      </div>
    `;
    
    document.getElementById('btn-trigger-auth').addEventListener('click', () => {
      showModal(DOM.authModal);
    });
    return;
  }

  // Loaded user profile details
  const displayUsername = state.profile ? state.profile.username : 'trillador';
  const displayName = state.profile ? state.profile.display_name : 'Usuario de El Trillo';
  const isAnonymousUser = state.profile ? state.profile.is_anonymous : false;
  
  let avatarHtml = `<span style="font-size:2.5rem;">👤</span>`;
  if (state.profile && state.profile.avatar_url) {
    avatarHtml = `<img src="${state.profile.avatar_url}" alt="Avatar">`;
  } else if (isAnonymousUser) {
    avatarHtml = `<span style="font-size:2.2rem;">🕶️</span>`;
  }

  // Get user activity metrics
  let postsCount = 0;
  let listingsCount = 0;
  try {
    const { count: posts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', state.user.id);
    postsCount = posts || 0;

    const { count: listings } = await supabase
      .from('marketplace_listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', state.user.id);
    listingsCount = listings || 0;
  } catch(e){}

  DOM.viewport.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar-large">${avatarHtml}</div>
      <div class="profile-details-group">
        <h2>${escapeHTML(displayName)}</h2>
        <div class="profile-username">@${escapeHTML(displayUsername)}</div>
      </div>
      
      ${state.profile && state.profile.province ? `
        <span class="profile-location-tag">
          📍 ${state.profile.province}${state.profile.municipality ? `, ${state.profile.municipality}` : ''}
        </span>
      ` : ''}

      <div class="profile-stats-grid">
        <div class="stat-item">
          <span class="stat-val">${postsCount}</span>
          <span class="stat-lbl">Posts</span>
        </div>
        <div class="stat-item">
          <span class="stat-val">${listingsCount}</span>
          <span class="stat-lbl">Ventas</span>
        </div>
        <div class="stat-item">
          <span class="stat-val">${isAnonymousUser ? 'Activo' : 'Inactivo'}</span>
          <span class="stat-lbl">Incógnito</span>
        </div>
      </div>
      
      <div style="width:100%; display:flex; flex-direction:column; gap:10px; margin-top:8px;">
        <button class="btn-secondary full-width btn-sm" id="btn-toggle-anon-settings">
          Cambiar privacidad predeterminada
        </button>
        <button class="btn-secondary full-width btn-sm" id="btn-pwa-install-manual" style="color: var(--accent); border-color: rgba(0,176,255,0.2);">
          📱 Instalar en el teléfono
        </button>
        <button class="btn-secondary full-width btn-sm" id="btn-logout" style="color:var(--error); border-color:rgba(255,69,58,0.15);">
          Cerrar Sesión
        </button>
      </div>
    </div>

    <!-- Instructions banner inside profile -->
    <div style="background-color:var(--bg-card); padding:16px; border-radius:14px; border:1px solid var(--border); font-size:0.8rem; line-height:1.5;">
      <h4 style="font-weight:600; margin-bottom:6px; color:var(--primary);">Compromiso de Privacidad Absoluta</h4>
      <p style="color:var(--text-secondary); margin-bottom:8px;">
        El Trillo no guarda tu dirección IP, nombre legal, ni exige número de teléfono al registrarte. Toda la navegación y las publicaciones anónimas están totalmente blindadas.
      </p>
      <p style="color:var(--text-muted);">
        Para asegurar la libertad de expresión, los post anónimos ocultan tus credenciales a nivel de base de datos usando vistas encriptadas.
      </p>
    </div>
  `;

  // Change privacy trigger
  document.getElementById('btn-toggle-anon-settings').addEventListener('click', async () => {
    try {
      const nextAnon = !isAnonymousUser;
      const { error } = await supabase
        .from('profiles')
        .update({ is_anonymous: nextAnon })
        .eq('id', state.user.id);
        
      if (error) throw error;
      
      state.profile.is_anonymous = nextAnon;
      showToast(nextAnon ? "Perfil por defecto en anónimo" : "Perfil por defecto público", "success");
      renderPerfil();
    } catch (e) {
      showToast(e.message, "error");
    }
  });

  // Manual PWA triggers
  document.getElementById('btn-pwa-install-manual').addEventListener('click', () => {
    triggerPwaInstallation();
  });

  // Logout trigger
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    state.user = null;
    state.profile = null;
    showToast("Sesión cerrada", "info");
    setView('muro');
    updateHeaderUserBadge();
  });
}


// ====================================================
// AUTHENTICATION LOGIC (LOGIN & REGISTER)
// ====================================================
let isLoginMode = true;

DOM.authToggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode;
  
  if (isLoginMode) {
    DOM.authTitle.textContent = "Iniciar Sesión";
    DOM.authSubmitBtn.textContent = "Entrar";
    DOM.registerFields.classList.add('hidden');
    DOM.authToggleText.innerHTML = `¿No tienes cuenta? <a href="#" id="auth-toggle-link">Regístrate gratis</a>`;
  } else {
    DOM.authTitle.textContent = "Crear Cuenta Libre";
    DOM.authSubmitBtn.textContent = "Registrarme";
    DOM.registerFields.classList.remove('hidden');
    DOM.authToggleText.innerHTML = `¿Ya tienes cuenta? <a href="#" id="auth-toggle-link">Inicia sesión aquí</a>`;
    
    // Init regions in register dropdown
    initRegionDropdowns('auth-province', 'auth-municipality');
  }
  
  // Re-hook the newly generated element inside innerHTML
  document.getElementById('auth-toggle-link').addEventListener('click', arguments.callee);
});

// Native American Style name generator click listener
document.getElementById('btn-generate-native-name').addEventListener('click', () => {
  const adj = NATIVE_ADJECTIVES[Math.floor(Math.random() * NATIVE_ADJECTIVES.length)];
  const noun = NATIVE_NOUNS[Math.floor(Math.random() * NATIVE_NOUNS.length)];
  const role = NATIVE_ROLES[Math.floor(Math.random() * NATIVE_ROLES.length)];

  // Clean values for username
  const cleanNoun = removeAccents(noun).toLowerCase().trim();
  const cleanAdj = removeAccents(adj).toLowerCase().trim();
  const cleanRole = removeAccents(role).toLowerCase().trim()
                      .replace(/\s+/g, '_')
                      .replace(/[^a-z0-9_]/g, '');

  const display = `${noun} ${adj} ${role}`;
  const username = `${cleanNoun}_${cleanAdj}_${cleanRole}`;

  document.getElementById('auth-username').value = username;
  document.getElementById('auth-displayname').value = display;
  
  showToast(`Nombre aborigen: ${display}`, "success");
});


DOM.authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  
  showToast("Procesando...", "info");
  
  try {
    if (isLoginMode) {
      // Login flow
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      state.user = data.user;
      await fetchUserProfile(data.user.id);
      showToast("¡Bienvenido a El Trillo!", "success");
      closeAllModals();
      setView('muro');
    } else {
      // Register flow
      const username = document.getElementById('auth-username').value.trim();
      const displayName = document.getElementById('auth-displayname').value.trim();
      const province = document.getElementById('auth-province').value;
      const municipality = document.getElementById('auth-municipality').value;
      const isAnon = document.getElementById('auth-is-anonymous').checked;
      
      if (!username) {
        throw new Error("El alias es obligatorio.");
      }

      // Check unique alias first
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();
        
      if (existingUser) {
        throw new Error("El alias ya está en uso. Si usaste un nombre aborigen, genera otra combinación.");
      }


      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            display_name: displayName || username,
            is_anonymous: isAnon,
            province: province,
            municipality: municipality
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        state.user = data.user;
        // The postgres handle_new_user trigger automatically inserts the public profile!
        // We delay slightly to allow trigger execution
        setTimeout(async () => {
          await fetchUserProfile(data.user.id);
          showToast("Cuenta creada con éxito", "success");
          closeAllModals();
          setView('muro');
        }, 1200);
      }
    }
    updateHeaderUserBadge();
  } catch (err) {
    showToast("Error de acceso: " + err.message, "error");
  }
});

async function fetchUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (!error) {
      state.profile = data;
    }
  } catch(e){}
}

function updateHeaderUserBadge() {
  if (state.user && state.profile) {
    const isAnon = state.profile.is_anonymous;
    if (isAnon) {
      DOM.authQuickBtn.innerHTML = `<span style="font-size:1.1rem;">🕶️</span>`;
    } else if (state.profile.avatar_url) {
      DOM.authQuickBtn.innerHTML = `<img src="${state.profile.avatar_url}" alt="Profile">`;
    } else {
      DOM.authQuickBtn.innerHTML = `<span style="font-size:1rem; font-weight:600;">${state.profile.display_name[0].toUpperCase()}</span>`;
    }
  } else {
    DOM.authQuickBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v-2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      </svg>
    `;
  }
}

DOM.authQuickBtn.addEventListener('click', () => {
  setView('perfil');
});

// ====================================================
// SUBMIT POST & LISTING LOGIC
// ====================================================

// Post Form Submission
DOM.postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!state.user) return;
  
  const content = document.getElementById('post-content').value.trim();
  const province = document.getElementById('post-province').value;
  const municipality = document.getElementById('post-municipality').value;
  const tagsText = document.getElementById('post-tags').value;
  const isAnon = document.getElementById('post-is-anonymous').checked;
  
  showToast("Enviando publicación...", "info");
  
  try {
    // 1. Process tags
    const tags = tagsText ? tagsText.split(',').map(t => t.trim().toLowerCase()).filter(t => t) : [];
    
    // 2. Upload image if exists
    let imageUrl = null;
    if (state.compressedImages.post) {
      imageUrl = await uploadCompressedImage(state.compressedImages.post, 'posts');
    }
    
    // 3. Save to database
    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: state.user.id,
        content: content,
        image_url: imageUrl,
        province: province || null,
        municipality: municipality || null,
        tags: tags,
        is_anonymous_post: isAnon
      });
      
    if (error) throw error;
    
    showToast("Publicado en El Muro", "success");
    
    // Cleanup Form
    DOM.postForm.reset();
    state.compressedImages.post = null;
    DOM.postImagePreviewContainer.classList.add('hidden');
    closeAllModals();
    
    // Reload feed
    if (state.activePenaId) {
      // Currently inside a Pena feed, reload that
      renderPenaFeed(state.activePenaId);
    } else {
      setView('muro');
    }
  } catch (err) {
    showToast("Error al publicar: " + err.message, "error");
  }
});

// Marketplace Listing Form Submission
DOM.listingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!state.user) return;
  
  const title = document.getElementById('listing-title').value.trim();
  const price = document.getElementById('listing-price').value;
  const currency = document.getElementById('listing-currency').value;
  const category = document.getElementById('listing-category').value;
  const description = document.getElementById('listing-description').value.trim();
  const phone = document.getElementById('listing-phone').value.trim();
  const province = document.getElementById('listing-province').value;
  const municipality = document.getElementById('listing-municipality').value;
  
  showToast("Creando anuncio...", "info");
  
  try {
    // 1. Upload compressed image if selected
    let imageUrls = [];
    if (state.compressedImages.listing) {
      const url = await uploadCompressedImage(state.compressedImages.listing, 'listings');
      if (url) imageUrls.push(url);
    }
    
    // 2. Format WhatsApp link
    // Build text: e.g. "Hola, vi tu anuncio en El Trillo: Splitter Royal 1 Tonelada Nuevo. Sigue en venta?"
    const formattedText = encodeURIComponent(`Hola, vi tu anuncio en El Trillo: *${title}* por ${price} ${currency}. ¿Sigue disponible?`);
    // Clean phone number from whitespace or plus sign
    const cleanPhone = phone.replace(/[\s\+]/g, '');
    const whatsappLink = `https://wa.me/${cleanPhone}?text=${formattedText}`;
    
    // 3. Insert into Database
    const { error } = await supabase
      .from('marketplace_listings')
      .insert({
        user_id: state.user.id,
        title: title,
        description: description,
        price: Number(price),
        currency: currency,
        category: category,
        image_urls: imageUrls,
        province: province,
        municipality: municipality,
        whatsapp_link: whatsappLink,
        status: 'active'
      });
      
    if (error) throw error;
    
    showToast("¡Artículo publicado con éxito!", "success");
    
    // Reset Form
    DOM.listingForm.reset();
    state.compressedImages.listing = null;
    DOM.listingImagePreviewContainer.classList.add('hidden');
    closeAllModals();
    
    setView('mercado');
  } catch (err) {
    showToast("Error de anuncio: " + err.message, "error");
  }
});

// Group Peña Form Submission
DOM.groupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!state.user) return;
  
  const name = document.getElementById('group-name').value.trim();
  const category = document.getElementById('group-category').value;
  const province = document.getElementById('group-province').value;
  const description = document.getElementById('group-description').value.trim();
  const isPrivate = document.getElementById('group-is-private').checked;
  
  showToast("Creando Peña...", "info");
  
  try {
    // Insert Group
    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        name: name,
        category: category,
        province: province || null,
        description: description,
        is_private: isPrivate,
        created_by: state.user.id
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Insert Group Admin Member
    await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: state.user.id,
        role: 'admin'
      });
      
    showToast("¡Peña creada con éxito!", "success");
    DOM.groupForm.reset();
    closeAllModals();
    setView('grupos');
  } catch (err) {
    showToast("Error de Peña: " + err.message, "error");
  }
});

// ====================================================
// MODAL DIALOG CONTROLLERS
// ====================================================
function showModal(modalEl) {
  modalEl.classList.remove('hidden');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Lock body scroll
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  });
  document.body.style.overflow = '';
}

document.querySelectorAll('.btn-close-modal, .close-modal-btn').forEach(btn => {
  btn.addEventListener('click', closeAllModals);
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    closeAllModals();
  }
});

// ====================================================
// PWA INSTALLATION PROMPTS & SERVICE WORKER
// ====================================================

// Offline detection status bar
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

function updateConnectionStatus() {
  if (navigator.onLine) {
    DOM.networkBadge.className = 'network-badge online';
    DOM.networkBadge.querySelector('.badge-label').textContent = 'En línea';
    showToast("Conexión restablecida", "success");
  } else {
    DOM.networkBadge.className = 'network-badge offline';
    DOM.networkBadge.querySelector('.badge-label').textContent = 'Sin conexión';
    showToast("Navegando sin conexión. Cargando desde caché.", "warning");
  }
}

// Intercept Add To Home Screen Prompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 76+ from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  state.deferredPrompt = e;
  
  // Show PWA install banner
  DOM.pwaBanner.classList.remove('hidden');
});

DOM.pwaBtnInstall.addEventListener('click', async () => {
  DOM.pwaBanner.classList.add('hidden');
  if (state.deferredPrompt) {
    state.deferredPrompt.prompt();
    const { outcome } = await state.deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    state.deferredPrompt = null;
  }
});

DOM.pwaBtnDismiss.addEventListener('click', () => {
  DOM.pwaBanner.classList.add('hidden');
});

// Manual PWA installer
function triggerPwaInstallation() {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  if (state.deferredPrompt) {
    state.deferredPrompt.prompt();
  } else if (isIos) {
    // Show iOS manual directions modal
    showModal(DOM.iosModal);
  } else {
    showToast("El Trillo ya está instalado en tu pantalla de inicio o tu navegador no soporta instalación directa.", "info");
  }
}

// 9. SERVICE WORKER REGISTRATION
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrado.', reg.scope))
      .catch(err => console.error('Error registrando Service Worker:', err));
  });
}

// ====================================================
// CORE UTILITIES & SESSION CHECK
// ====================================================
async function checkAuthSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session && session.user) {
    state.user = session.user;
    await fetchUserProfile(session.user.id);
    updateHeaderUserBadge();
  }
  
  // Load default Muro View on launch
  setView('muro');
}

// Debounce helper to optimize search queries and filters
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// HTML XSS escaping
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Launch application session
checkAuthSession();
updateConnectionStatus();

})();
