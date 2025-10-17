// NeuroFit — Body Diagram binder (hash-route safe, no MutationObserver)

(() => {
  const ROUTE_PREFIX = '#/workouts/diagram';

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

  function isDiagramRoute() {
    return (location.hash || '').startsWith(ROUTE_PREFIX);
  }

  function showTemplate(tplId) {
    const t = document.getElementById(tplId);
    const app = document.getElementById('app');
    if (!t || !app) return;
    app.innerHTML = '';
    app.appendChild(t.content.cloneNode(true));
    // reflect state in URL
    window.location.hash = `${ROUTE_PREFIX}/${tplId.replace('-template','')}`;
  }

  function bindDiagram(root) {
    if (!root || root.dataset.bound === '1') return false;

    const front = root.querySelector('#frontView');
    const back  = root.querySelector('#backView');
    const toggleBtn = root.querySelector('#toggleViewBtn');
    if (!front || !back || !toggleBtn) return false;

    // default state
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

    root.dataset.bound = '1';
    return true;
  }

  // Try to bind when route is correct; retry briefly to allow your router to render the template
  function tryBindWithRetries(maxTries = 40, delayMs = 50) {
    if (!isDiagramRoute()) return;
    let tries = 0;

    const tick = () => {
      const app = document.getElementById('app');
      const section = app?.querySelector('section.card');
      const hasDiagram = section && (section.querySelector('#frontView') || section.querySelector('#backView'));

      if (hasDiagram && bindDiagram(section)) return; // bound successfully
      if (++tries >= maxTries) return;               // give up quietly after ~2s
      setTimeout(tick, delayMs);
    };

    tick();
  }

  window.addEventListener('hashchange', () => {
    if (isDiagramRoute()) tryBindWithRetries();
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (isDiagramRoute()) tryBindWithRetries();
  });
})();
