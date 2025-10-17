// NeuroFit — Body Diagram autowire (front/back toggle + region routing)
// This works without changing app.js by observing when the template is mounted.
(() => {
  const muscleToTemplate = {
    // FRONT
    chest:  'chest-template',
    biceps: 'biceps-template',
    biceps2:'biceps2-template',
    abs:    'abs-template',
    quadsL: 'quadsL-template',
    quadsR: 'quadsR-template',
    // BACK
    traps:  'traps-template',
    deltsL: 'deltsL-template',
    deltsR: 'deltsR-template',
    lats:   'lats-template',
    glutes: 'glutes-template',
    hamsL:  'hamsL-template',
    hamsR:  'hamsR-template',
  };

  function showTemplate(tplId) {
    const t = document.getElementById(tplId);
    const app = document.getElementById('app');
    if (!t || !app) return;
    app.innerHTML = '';
    app.appendChild(t.content.cloneNode(true));
    // reflect state in URL for SPA feel
    window.location.hash = `#/workouts/diagram/${tplId.replace('-template','')}`;
  }

  function initBodyDiagram(root) {
    const front = root.querySelector('#frontView');
    const back  = root.querySelector('#backView');
    const toggleBtn = root.querySelector('#toggleViewBtn');
    if (!front || !back || !toggleBtn) return false;

    // default to front view
    let isFront = true;
    front.style.display = 'block';
    back.style.display  = 'none';
    toggleBtn.textContent = 'Show Back View';

    toggleBtn.addEventListener('click', () => {
      isFront = !isFront;
      front.style.display = isFront ? 'block' : 'none';
      back.style.display  = isFront ? 'none'  : 'block';
      toggleBtn.textContent = isFront ? 'Show Back View' : 'Show Front View';
    });

    const clickable = [...front.querySelectorAll('[id]'), ...back.querySelectorAll('[id]')];
    clickable.forEach(el => {
      // accessibility
      el.setAttribute('role', 'button');
      el.tabIndex = 0;
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
      });

      el.addEventListener('click', () => {
        const tpl = muscleToTemplate[el.id];
        if (tpl) showTemplate(tpl);
        else console.warn('No template mapped for', el.id);
      });
    });

    return true;
  }

  function tryInit() {
    const app = document.getElementById('app');
    if (!app) return;
    // look for the body-diagram section currently rendered
    const card = app.querySelector('section.card');
    if (card && (card.querySelector('#frontView') || card.querySelector('#backView'))) {
      initBodyDiagram(card);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    tryInit();
    const app = document.getElementById('app');
    if (!app) return;
    // Re-init whenever router swaps templates
    const mo = new MutationObserver(() => tryInit());
    mo.observe(app, { childList: true, subtree: true });
  });
})();
