// ============================================================
// Tabs (static — swaps the active state only in this prototype)
// ============================================================
document.querySelectorAll('.perf-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.perf-tab').forEach(t => {
      t.classList.remove('perf-tab--active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('perf-tab--active');
    tab.setAttribute('aria-selected', 'true');
  });
});

// ============================================================
// Toggle switches
// ============================================================
document.querySelectorAll('.toggle-switch').forEach(sw => {
  sw.addEventListener('click', () => sw.classList.toggle('on'));
});
