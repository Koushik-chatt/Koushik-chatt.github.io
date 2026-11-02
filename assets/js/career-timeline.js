(() => {
  const list = document.querySelector('.career-milestones');
  if (!list) return;
  const items = [...list.querySelectorAll('li')];
  const setActive = selected => items.forEach(item => {
    const active = item === selected;
    item.classList.toggle('is-active', active);
    item.querySelector('button').setAttribute('aria-expanded', String(active));
  });
  items.forEach(item => {
    const button = item.querySelector('button');
    button.addEventListener('click', () => setActive(item));
    button.addEventListener('focus', () => setActive(item));
    item.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') setActive(item); });
    item.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse' && !item.contains(document.activeElement)) setActive(null); });
    item.addEventListener('focusout', event => { if (!item.contains(event.relatedTarget)) setActive(null); });
  });
})();
