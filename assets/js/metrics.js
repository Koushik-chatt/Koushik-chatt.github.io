(async () => {
  const charts = [...document.querySelectorAll('[data-metric-chart]')];
  if (!charts.length) return;
  const format = value => value.toLocaleString('en-US');
  try {
    const response = await fetch('./data/metrics.json?v=20261102-cv');
    if (!response.ok) throw new Error('Metrics snapshot unavailable');
    const data = await response.json();
    charts.forEach(container => {
      const key = container.dataset.metricChart;
      let total = 0;
      const points = data[key].filter(item => item.year >= 2015 && item.year <= 2026)
        .map(item => ({year: item.year, value: (total += item.value)}));
      if (points.length && Number.isFinite(data.totals?.[key])) {
        points[points.length - 1].value = data.totals[key];
        total = data.totals[key];
      }
      const counter = container.closest('.metric-chart-card').querySelector('.metric-chart-heading strong');
      const max = Math.max(...points.map(point => point.value), 1);
      const color = key === 'papers' ? '#3ed6c4' : '#7cc8ff';
      const step = 360 / points.length, barWidth = step * .65;
      container.innerHTML = `<svg viewBox="0 0 400 200" role="group" aria-label="Cumulative ${key} from 2015 through 2026">
        ${points.map((point, i) => {
          const height = point.value / max * 150;
          const label = `${point.year}: ${format(point.value)} cumulative ${key}`;
          return `<rect class="metric-bar" style="--delay:${i * 0.14}s" x="${20 + i * step + (step-barWidth)/2}" y="${160-height}" width="${barWidth}" height="${height}" rx="2" fill="${color}" tabindex="0" role="img" aria-label="${label}"><title>${label}</title></rect>`;
        }).join('')}
        ${points.filter((point,i) => i===0 || i===points.length-1 || point.year%3===0).map(point => `<text x="${20 + (points.indexOf(point)+.5)*step}" y="187" text-anchor="middle">${point.year}</text>`).join('')}
      </svg>`;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const start = () => {
        container.classList.add('metrics-visible');
        if (reduced) { counter.textContent = format(total); return; }
        counter.textContent = '0';
        points.forEach((point,i) => setTimeout(() => { counter.textContent = format(point.value); }, i * 140));
      };
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); start(); }
        }, {threshold: .2});
        observer.observe(container);
      } else start();
    });
  } catch (error) {
    charts.forEach(container => { container.textContent = 'Metrics could not load. View the full record on ADS.'; });
    console.error(error);
  }
})();
