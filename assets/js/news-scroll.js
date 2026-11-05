(() => {
  const news = document.querySelector('[data-auto-scroll]');
  if (!news || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const originals = [...news.children];
  if (originals.length < 2) return;

  originals.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a, button, [tabindex]').forEach(control => {
      control.setAttribute('tabindex', '-1');
    });
    news.append(clone);
  });

  let paused = false;
  let previousTime = 0;
  let offset = news.scrollTop;
  const speed = 7;

  const setPaused = value => { paused = value; };
  news.addEventListener('pointerenter', () => setPaused(true));
  news.addEventListener('pointerleave', () => setPaused(false));
  news.addEventListener('focusin', () => setPaused(true));
  news.addEventListener('focusout', event => {
    if (!news.contains(event.relatedTarget)) setPaused(false);
  });
  news.addEventListener('touchstart', () => setPaused(true), { passive: true });
  news.addEventListener('touchend', () => setPaused(false), { passive: true });
  news.addEventListener('scroll', () => {
    if (paused && Math.abs(news.scrollTop - offset) > 1) offset = news.scrollTop;
  }, { passive: true });

  const animate = time => {
    if (!previousTime) previousTime = time;
    const elapsed = Math.min(time - previousTime, 50);
    previousTime = time;

    if (!paused && !document.hidden) {
      offset += speed * elapsed / 1000;
      const firstClone = news.children[originals.length];
      const resetPoint = firstClone.offsetTop - news.children[0].offsetTop;
      if (offset >= resetPoint) offset -= resetPoint;
      news.scrollTop = offset;
    }

    window.requestAnimationFrame(animate);
  };

  window.requestAnimationFrame(animate);
})();
