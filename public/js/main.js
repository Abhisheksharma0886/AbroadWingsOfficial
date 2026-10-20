/**
 * main.js — AbroadWings
 * Handles: mobile nav, university directory (featured-8 default + search-driven full 50),
 * paginated carousel grid, personalized matching, FAQ accordion, enquiry form, modal, scroll reveal.
 */
'use strict';


/* ----------------------------------------------------------------
   NAVBAR
---------------------------------------------------------------- */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const menuBtn  = document.getElementById('menu-btn');
  const menuEl   = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const navLinks = document.querySelectorAll('#mobile-menu a');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (menuBtn && menuEl) {
    menuBtn.addEventListener('click', () => {
      const open = menuEl.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
      menuIcon.className = open ? 'fas fa-times text-lg' : 'fas fa-bars text-lg';
    });
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuEl.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuIcon.className = 'fas fa-bars text-lg';
      });
    });
  }
})();


/* ----------------------------------------------------------------
   SCROLL REVEAL
---------------------------------------------------------------- */
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
})();


/* ----------------------------------------------------------------
   TOAST
---------------------------------------------------------------- */
let toastTimer = null;
function showToast(msg, type = 'info', duration = 4500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.className = type;
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => { toast.classList.remove('show'); }, duration);
}


/* ----------------------------------------------------------------
   UNIVERSITY DIRECTORY
   Default: 8 featured universities. Search/filter: all 50.
---------------------------------------------------------------- */
(function initUniversities() {
  const grid        = document.getElementById('uni-grid');
  const noResults   = document.getElementById('uni-no-results');
  const searchInput = document.getElementById('uni-search');
  const clearBtn    = document.getElementById('clear-filters');
  const statusEl    = document.getElementById('uni-search-status');

  if (!grid || !window.UNIVERSITIES) return;

  const FEATURED_IDS = ['ntu', 'nthu', 'nycu', 'ncku', 'ntust', 'ntut', 'nsysu', 'ncu'];
  const filters = { type: 'all', field: 'all', degree: 'all' };
  let searchQuery = '';

  function isFiltered() {
    return !!(searchQuery || filters.type !== 'all' || filters.field !== 'all' || filters.degree !== 'all');
  }

  function makeCard(uni) {
    const card = document.createElement('div');
    card.className = 'uni-card';
    card.style.setProperty('--accent-color', uni.color || 'var(--color-teal)');
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', uni.name + '. Click to view programs.');
    card.innerHTML =
      '<div class="flex items-start justify-between mb-3">' +
        '<div class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style="background:' + (uni.color || 'var(--color-teal)') + '">' + uni.abbr.slice(0, 4) + '</div>' +
        '<span class="uni-badge ' + uni.type + '">' + uni.type + '</span>' +
      '</div>' +
      '<h3 class="font-bold text-slate-800 text-sm mb-1 leading-tight">' + uni.name + '</h3>' +
      '<p class="text-xs text-slate-500 mb-3"><i class="fas fa-map-marker-alt text-teal mr-1"></i>' + uni.location + '</p>' +
      '<div class="flex flex-wrap gap-1 mb-4">' +
        uni.fields.slice(0, 3).map(function(f) { return '<span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">' + f + '</span>'; }).join('') +
        (uni.fields.length > 3 ? '<span class="text-xs text-slate-400">+' + (uni.fields.length - 3) + ' more</span>' : '') +
      '</div>' +
      '<button class="btn-primary w-full justify-center text-xs py-2 explore-btn" data-id="' + uni.id + '" aria-label="Explore programs at ' + uni.name + '"><i class="fas fa-search"></i> Explore Programs</button>';
    return card;
  }

  function renderCards(unis) {
    grid.innerHTML = '';
    if (!unis.length) { noResults.classList.remove('hidden'); return; }
    noResults.classList.add('hidden');
    unis.forEach(function(uni) { grid.appendChild(makeCard(uni)); });

    grid.querySelectorAll('.uni-card').forEach(function(card) {
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.querySelector('.explore-btn') && card.querySelector('.explore-btn').click(); }
      });
    });

    grid.querySelectorAll('.explore-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var uni = window.UNIVERSITIES.find(function(u) { return u.id === btn.dataset.id; });
        if (uni) openModal(uni);
      });
    });
  }

  function applyFilters() {
    var pool = isFiltered()
      ? window.UNIVERSITIES
      : window.UNIVERSITIES.filter(function(u) { return FEATURED_IDS.indexOf(u.id) !== -1; });

    var result = pool;

    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      result = result.filter(function(u) {
        return u.name.toLowerCase().indexOf(q) !== -1 ||
               u.abbr.toLowerCase().indexOf(q) !== -1 ||
               u.location.toLowerCase().indexOf(q) !== -1 ||
               u.type.toLowerCase().indexOf(q) !== -1 ||
               u.fields.some(function(f) { return f.toLowerCase().indexOf(q) !== -1; });
      });
    }

    if (filters.type  !== 'all') result = result.filter(function(u) { return u.type === filters.type; });
    if (filters.field !== 'all') result = result.filter(function(u) { return u.fields.some(function(f) { return f.toLowerCase().indexOf(filters.field.toLowerCase()) !== -1; }); });
    if (filters.degree !== 'all') result = result.filter(function(u) { return u.degrees.indexOf(filters.degree) !== -1; });

    if (statusEl) {
      if (!isFiltered()) {
        statusEl.textContent = 'Showing top featured universities. Search by name, city, or field to explore all 50 universities.';
        statusEl.style.opacity = '1';
      } else {
        statusEl.textContent = 'Showing ' + result.length + ' of ' + window.UNIVERSITIES.length + ' universities matching your search.';
        statusEl.style.opacity = result.length > 0 ? '1' : '0';
      }
    }

    renderCards(result);
  }

  document.querySelectorAll('.filter-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      var ft = chip.dataset.filter, val = chip.dataset.value;
      filters[ft] = val;
      document.querySelectorAll('.filter-chip[data-filter="' + ft + '"]').forEach(function(c) {
        c.classList.toggle('active', c.dataset.value === val);
      });
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', function() { searchQuery = searchInput.value.trim(); applyFilters(); });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      filters.type = 'all'; filters.field = 'all'; filters.degree = 'all'; searchQuery = '';
      if (searchInput) searchInput.value = '';
      document.querySelectorAll('.filter-chip').forEach(function(chip) {
        chip.classList.toggle('active', chip.dataset.value === 'all');
      });
      applyFilters();
    });
  }

  applyFilters();
})();


/* ----------------------------------------------------------------
   PAGINATED GRID — 8 per page (2 rows x 4 cols)
---------------------------------------------------------------- */
(function initCarousel() {
  var track       = document.getElementById('uni-carousel-track');
  var btnPrev     = document.getElementById('carousel-prev');
  var btnNext     = document.getElementById('carousel-next');
  var progressTxt = document.getElementById('carousel-progress-text');
  var dotsEl      = document.getElementById('carousel-page-dots');

  if (!track || !window.UNIVERSITIES) return;

  var PAGE_SIZE   = 8;
  var total       = window.UNIVERSITIES.length;
  var pageCount   = Math.ceil(total / PAGE_SIZE);
  var currentPage = 0;

  function makeCard(uni) {
    var card = document.createElement('div');
    card.className = 'carousel-card';
    card.style.setProperty('--accent-color', uni.color || 'var(--color-teal)');
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', uni.name + '. Click to explore programs.');
    card.innerHTML =
      '<div class="flex items-start justify-between mb-3">' +
        '<div class="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style="background:' + (uni.color || 'var(--color-teal)') + '">' + uni.abbr.slice(0, 6) + '</div>' +
        '<span class="uni-badge ' + uni.type + '">' + uni.type + '</span>' +
      '</div>' +
      '<h3 class="font-bold text-slate-800 text-sm mb-1 leading-tight">' + uni.name + '</h3>' +
      '<p class="text-xs text-slate-500 mb-3"><i class="fas fa-map-marker-alt text-teal mr-1"></i>' + uni.location + '</p>' +
      '<div class="flex flex-wrap gap-1 mb-3">' +
        uni.fields.slice(0, 2).map(function(f) { return '<span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">' + f + '</span>'; }).join('') +
        (uni.fields.length > 2 ? '<span class="text-xs text-slate-400">+' + (uni.fields.length - 2) + ' more</span>' : '') +
      '</div>' +
      '<button class="btn-primary w-full justify-center text-xs py-2 carousel-explore-btn" data-id="' + uni.id + '" aria-label="Explore programs at ' + uni.name + '"><i class="fas fa-search"></i> Explore Programs</button>';

    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var b = card.querySelector('.carousel-explore-btn');
        if (b) b.click();
      }
    });
    return card;
  }

  function renderPage(page, direction) {
    var start = page * PAGE_SIZE;
    var slice = window.UNIVERSITIES.slice(start, start + PAGE_SIZE);

    var exitClass  = direction === 'next' ? 'page-exit' : 'page-enter';
    var enterClass = direction === 'next' ? 'page-enter' : 'page-exit';

    track.classList.add(exitClass);

    setTimeout(function() {
      track.innerHTML = '';
      slice.forEach(function(uni) { track.appendChild(makeCard(uni)); });

      track.querySelectorAll('.carousel-explore-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var uni = window.UNIVERSITIES.find(function(u) { return u.id === btn.dataset.id; });
          if (uni) openModal(uni);
        });
      });

      track.classList.remove('page-exit', 'page-enter');
      track.classList.add(enterClass);
      void track.offsetHeight; // force reflow
      track.classList.remove('page-exit', 'page-enter');

      updateControls();
    }, 270);
  }

  function updateControls() {
    if (btnPrev) btnPrev.disabled = currentPage <= 0;
    if (btnNext) btnNext.disabled = currentPage >= pageCount - 1;

    var start = currentPage * PAGE_SIZE + 1;
    var end   = Math.min(start + PAGE_SIZE - 1, total);
    if (progressTxt) {
      progressTxt.textContent = 'Showing ' + start + '\u2013' + end + ' of ' + total + ' Universities \u00b7 Page ' + (currentPage + 1) + ' of ' + pageCount;
    }

    if (dotsEl) {
      dotsEl.innerHTML = '';
      for (var i = 0; i < pageCount; i++) {
        (function(idx) {
          var dot = document.createElement('button');
          dot.className = 'carousel-page-dot' + (idx === currentPage ? ' active' : '');
          dot.setAttribute('aria-label', 'Go to page ' + (idx + 1));
          dot.addEventListener('click', function() {
            var dir = idx > currentPage ? 'next' : 'prev';
            currentPage = idx;
            renderPage(currentPage, dir);
          });
          dotsEl.appendChild(dot);
        })(i);
      }
    }
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', function() {
      if (currentPage > 0) { currentPage--; renderPage(currentPage, 'prev'); }
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', function() {
      if (currentPage < pageCount - 1) { currentPage++; renderPage(currentPage, 'next'); }
    });
  }

  renderPage(0, 'next');
})();


/* ----------------------------------------------------------------
   MODAL — dark navy design, high-contrast text
---------------------------------------------------------------- */
var modalOverlay = document.getElementById('modal-overlay');
var modalClose   = document.getElementById('modal-close');

function openModal(uni) {
  if (!modalOverlay) return;

  document.getElementById('modal-badge').textContent = uni.type === 'public' ? '\uD83C\uDFDB Public' : '\uD83C\uDFEB Private';
  document.getElementById('modal-badge').className   = 'uni-badge ' + uni.type + ' mb-2';
  document.getElementById('modal-title').textContent = uni.name + ' (' + uni.abbr + ')';
  document.getElementById('modal-location').innerHTML = '<i class="fas fa-map-marker-alt mr-2" style="color:#00bcd4"></i>' + uni.location;
  document.getElementById('modal-description').textContent = uni.description;

  var fieldsEl = document.getElementById('modal-fields');
  fieldsEl.innerHTML = uni.fields.map(function(f) {
    return '<span class="modal-field-tag">' + f + '</span>';
  }).join('');

  var programsEl = document.getElementById('modal-programs');
  programsEl.innerHTML = uni.programs.map(function(p) {
    return '<div class="modal-program-card">' +
      '<div class="program-title">' + p.name + '</div>' +
      '<div class="program-meta grid grid-cols-2 gap-2 mb-2">' +
        '<div><span>Degree: </span><strong>' + p.degree + '</strong></div>' +
        '<div><span>Language: </span><strong>' + p.language + '</strong></div>' +
      '</div>' +
      '<p class="program-note">' + p.note + '</p>' +
      '<a href="' + p.link + '" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-xs font-medium hover:underline mt-2" style="color:#00bcd4">View Program Details <i class="fas fa-external-link-alt"></i></a>' +
    '</div>';
  }).join('');

  document.getElementById('modal-website').href = uni.website;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  var firstFocusable = modalOverlay.querySelector('button, a, [tabindex]');
  if (firstFocusable) firstFocusable.focus();

  document.getElementById('modal-enquire').addEventListener('click', function() { closeModal(); }, { once: true });
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalOverlay) {
  modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal(); });
}


/* ----------------------------------------------------------------
   PERSONALIZED MATCHING
---------------------------------------------------------------- */
(function initMatching() {
  var btn       = document.getElementById('match-btn');
  var results   = document.getElementById('match-results');
  var matchGrid = document.getElementById('match-grid');
  var matchNone = document.getElementById('match-none');
  var countText = document.getElementById('match-count-text');

  if (!btn || !window.UNIVERSITIES) return;

  btn.addEventListener('click', function() {
    var degree = document.getElementById('match-degree').value;
    var field  = document.getElementById('match-field').value;
    var type   = document.getElementById('match-type').value;
    var intake = document.getElementById('match-intake').value;

    var matched = window.UNIVERSITIES;
    if (degree) matched = matched.filter(function(u) { return u.degrees.indexOf(degree) !== -1; });
    if (field)  matched = matched.filter(function(u) { return u.fields.some(function(f) { return f.toLowerCase().indexOf(field.toLowerCase()) !== -1; }); });
    if (type)   matched = matched.filter(function(u) { return u.type === type; });
    if (intake) matched = matched.filter(function(u) { return u.intakes.indexOf(intake) !== -1; });

    results.classList.remove('hidden');

    if (matched.length === 0) {
      matchGrid.innerHTML = '';
      matchNone.classList.remove('hidden');
      countText.textContent = 'No matching universities found';
      return;
    }

    matchNone.classList.add('hidden');
    countText.textContent = matched.length + ' universit' + (matched.length !== 1 ? 'ies' : 'y') + ' match your criteria:';

    matchGrid.innerHTML = matched.map(function(u) {
      return '<div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">' +
        '<div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style="background:' + u.color + '">' + u.abbr.slice(0, 4) + '</div>' +
        '<div><div class="font-semibold text-slate-800 text-sm">' + u.name + '</div>' +
        '<div class="text-xs text-slate-500 mb-2">' + u.location + ' \u00b7 <span class="capitalize">' + u.type + '</span></div>' +
        '<button class="text-xs font-medium hover:underline match-explore-btn" style="color:#00bcd4" data-id="' + u.id + '">Explore Programs \u2192</button></div></div>';
    }).join('');

    matchGrid.querySelectorAll('.match-explore-btn').forEach(function(b) {
      b.addEventListener('click', function() {
        var uni = window.UNIVERSITIES.find(function(u) { return u.id === b.dataset.id; });
        if (uni) openModal(uni);
      });
    });
  });
})();


/* ----------------------------------------------------------------
   FAQ ACCORDION
---------------------------------------------------------------- */
(function initFAQ() {
  document.querySelectorAll('.faq-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var expanded  = btn.getAttribute('aria-expanded') === 'true';
      var contentId = btn.getAttribute('aria-controls');
      var content   = document.getElementById(contentId);

      document.querySelectorAll('.faq-btn').forEach(function(other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          var oc = document.getElementById(other.getAttribute('aria-controls'));
          if (oc) oc.hidden = true;
        }
      });

      btn.setAttribute('aria-expanded', !expanded);
      if (content) content.hidden = expanded;
    });
  });
})();


/* ----------------------------------------------------------------
   ENQUIRY FORM
---------------------------------------------------------------- */
(function initForm() {
  var form        = document.getElementById('counselling-form');
  var submitBtn   = document.getElementById('submit-btn');
  var submitText  = document.getElementById('submit-text');
  var submitIcon  = document.getElementById('submit-icon');
  var successEl   = document.getElementById('form-success');
  var successMsg  = document.getElementById('success-message');
  var errorBanner = document.getElementById('form-error-banner');
  var errorText   = document.getElementById('error-banner-text');

  if (!form) return;

  var syncAriaInvalid = function(input) {
    input.setAttribute('aria-invalid', input.checkValidity() ? 'false' : 'true');
  };

  form.addEventListener('blur', function(e) {
    if (e.target.matches('input[required], select[required], textarea[required]')) syncAriaInvalid(e.target);
  }, true);

  form.addEventListener('input', function(e) {
    if (e.target.hasAttribute('aria-invalid')) syncAriaInvalid(e.target);
  });

  var isSubmitting = false;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (isSubmitting) return;

    var requiredInputs = form.querySelectorAll('[required]');
    var firstInvalid = null;
    requiredInputs.forEach(function(input) {
      if (!input.checkValidity()) { syncAriaInvalid(input); if (!firstInvalid) firstInvalid = input; }
    });

    if (firstInvalid) { firstInvalid.focus(); showToast('Please complete all required fields.', 'error'); return; }

    var data = Object.fromEntries(new FormData(form).entries());
    data.consent = form.querySelector('#f-consent').checked;

    isSubmitting = true;
    submitBtn.disabled = true;
    submitIcon.className = 'fas fa-spinner fa-spin';
    submitText.textContent = 'Submitting\u2026';
    errorBanner.classList.add('hidden');

    try {
      var res  = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      var json = await res.json();

      if (res.ok && json.success) {
        form.classList.add('hidden');
        successEl.classList.remove('hidden');
        successMsg.textContent = json.message;
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Enquiry submitted! We will contact you soon.', 'success', 6000);
      } else if (res.status === 400 && json.errors) {
        var msgs = Object.values(json.errors).join(' ');
        errorText.textContent = msgs;
        errorBanner.classList.remove('hidden');
        errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        showToast('Please check the highlighted fields.', 'error');
      } else if (res.status === 429) {
        errorText.textContent = json.message || 'Too many submissions. Please wait.';
        errorBanner.classList.remove('hidden');
        showToast('Too many submissions. Please wait.', 'error');
      } else {
        errorText.textContent = json.message || 'Something went wrong. Please try again.';
        errorBanner.classList.remove('hidden');
        showToast('Submission failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('[Form] Network error:', err);
      errorText.textContent = 'A network error occurred. Check your connection and try again.';
      errorBanner.classList.remove('hidden');
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      isSubmitting = false;
      submitBtn.disabled = false;
      submitIcon.className = 'fas fa-calendar-check';
      submitText.textContent = 'Book My Free Counselling';
    }
  });
})();


/* ----------------------------------------------------------------
   SMOOTH SCROLL
---------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    var target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });
});


/* ----------------------------------------------------------------
   ACTIVE NAV LINK
---------------------------------------------------------------- */
(function initActiveNav() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link');

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function(link) {
          var href = link.getAttribute('href').replace('#', '');
          link.classList.toggle('text-teal', href === entry.target.id);
          link.classList.toggle('text-slate-900', href !== entry.target.id);
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(function(s) { observer.observe(s); });
})();
