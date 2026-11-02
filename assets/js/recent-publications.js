(async () => {
  const target = document.getElementById('recent-publications-list');
  if (!target) return;
  try {
    const response = await fetch('./data/recent-publications.json?v=20261030-trimmed');
    if (!response.ok) throw new Error('Publication data unavailable');
    const papers = await response.json();
    const element = (tag, text, className) => {
      const node = document.createElement(tag);
      if (text) node.textContent = text;
      if (className) node.className = className;
      return node;
    };
    papers.sort((a, b) => Number(b.category === "First author") - Number(a.category === "First author"));
    papers.forEach((paper,index) => {
      const card = element('article', '', 'recent-publication');
      const copy = element('div', '', 'recent-publication-copy');
      const badge = element('span', paper.category === 'Group' ? 'Co-author' : paper.category, 'recent-publication-badge');
      const heading = element('h3');
      const title = element('a', paper.title);
      title.href = paper.url; title.target = '_blank'; title.rel = 'noopener noreferrer';
      heading.append(title);
      const actions = element('div', '', 'recent-publication-actions');
      const paperLink = element('a', 'Paper ↗', 'recent-publication-paper');
      paperLink.href = paper.url; paperLink.target = '_blank'; paperLink.rel = 'noopener noreferrer';
      actions.append(badge, paperLink);
      copy.append(heading, element('p', paper.authors, 'recent-publication-authors'), element('p', paper.description, 'recent-publication-description'), actions);
      const figure = element('figure', '', 'recent-publication-figure');
      const image = document.createElement('img');
      image.src = paper.figure; image.alt = paper.figure_alt; image.loading = 'lazy'; image.decoding = 'async';
      figure.append(image);
      if (index % 2) card.classList.add('figure-left');
      card.append(copy,figure); target.append(card);
    });
  } catch (error) {
    target.textContent = 'Selected publications could not be loaded.';
    console.error(error);
  }
})();
