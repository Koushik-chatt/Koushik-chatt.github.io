const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const currentYear = new Date().getFullYear();

document.querySelectorAll('#year').forEach((node) => {
  node.textContent = String(currentYear);
});

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('[data-animate]').forEach((element) => {
  observer.observe(element);
});

const timelineRoles = document.querySelectorAll('[data-timeline-role]');
if (timelineRoles.length > 0) {
  const setFocusedRole = () => {
    const viewportCenter = window.innerHeight * 0.48;
    let closestRole = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    timelineRoles.forEach((role) => {
      const rect = role.getBoundingClientRect();
      const roleCenter = rect.top + rect.height / 2;
      const distance = Math.abs(roleCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestRole = role;
      }
    });

    if (closestRole) {
      timelineRoles.forEach((role) => role.classList.remove('is-focused'));
      closestRole.classList.add('is-focused');
    }
  };

  setFocusedRole();
  window.addEventListener('scroll', setFocusedRole, { passive: true });
  window.addEventListener('resize', setFocusedRole);
}

const highlightsTrack = document.querySelector('[data-highlights-track]');
const highlightsPrev = document.querySelector('[data-highlights-prev]');
const highlightsNext = document.querySelector('[data-highlights-next]');

if (highlightsTrack && highlightsPrev && highlightsNext) {
  const updateHighlightsArrows = () => {
    const epsilon = 12;
    const atStart = highlightsTrack.scrollLeft <= epsilon;
    const atEnd =
      highlightsTrack.scrollLeft + highlightsTrack.clientWidth >=
      highlightsTrack.scrollWidth - epsilon;
    highlightsPrev.disabled = atStart;
    highlightsNext.disabled = atEnd;
    highlightsPrev.classList.toggle('is-disabled', atStart);
    highlightsNext.classList.toggle('is-disabled', atEnd);
  };

  const moveHighlights = (direction) => {
    const amount = highlightsTrack.clientWidth * 0.86 * direction;
    highlightsTrack.scrollBy({ left: amount, behavior: 'smooth' });
  };

  highlightsPrev.addEventListener('click', () => moveHighlights(-1));
  highlightsNext.addEventListener('click', () => moveHighlights(1));
  highlightsTrack.addEventListener('scroll', updateHighlightsArrows, { passive: true });
  window.addEventListener('resize', updateHighlightsArrows);
  window.addEventListener('load', updateHighlightsArrows);
  updateHighlightsArrows();
  requestAnimationFrame(updateHighlightsArrows);
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href');
    const target = document.querySelector(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const cosmosCarousel = document.querySelector('[data-cosmos-carousel]');
if (cosmosCarousel) {
  const cosmosTrack = cosmosCarousel.querySelector('[data-cosmos-track]');
  const slides = Array.from(cosmosTrack?.querySelectorAll('.cosmos-slide') || []);
  const controls = document.querySelector('[data-cosmos-controls]');
  const previousButton = controls?.querySelector('[data-cosmos-previous]');
  const toggleButton = controls?.querySelector('[data-cosmos-toggle]');
  const toggleIcon = controls?.querySelector('[data-cosmos-toggle-icon]');
  const nextButton = controls?.querySelector('[data-cosmos-next]');
  if (cosmosTrack && slides.length > 0) {
    const imageDirectory = './assets/images/images/homepage/website_responsive/images/';
    const widths = [640, 960, 1280, 1920, 2560, 3840, 7680];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const intervalMs = Number(cosmosCarousel.dataset.intervalMs) || 6500;
    const transitionMs = Number(cosmosCarousel.dataset.transitionMs) || 1300;
    let activeIndex = 0;
    let timerId = null;
    let paused = false;
    let changeToken = 0;

    cosmosCarousel.style.setProperty('--cosmos-transition', `${transitionMs}ms`);

    const slideWidths = (slide) => {
      const maxWidth = Number(slide.dataset.maxWidth) || widths[widths.length - 1];
      return widths.filter((width) => width <= maxWidth);
    };

    const responsiveSet = (slide, extension) => slideWidths(slide)
      .map((width) => `${imageDirectory}${slide.dataset.image}-${width}.${extension} ${width}w`)
      .join(', ');

    const loadSlide = (slide) => {
      const existingImage = slide.querySelector('img');
      if (existingImage) {
        return existingImage.decode().catch(() => undefined);
      }

      const availableWidths = slideWidths(slide);
      const fallbackWidth = availableWidths.includes(1280)
        ? 1280
        : availableWidths[availableWidths.length - 1];
      const name = slide.dataset.image;
      const picture = document.createElement('picture');
      const avif = document.createElement('source');
      avif.type = 'image/avif';
      avif.sizes = '100vw';
      avif.srcset = responsiveSet(slide, 'avif');
      const image = document.createElement('img');
      image.srcset = responsiveSet(slide, 'webp');
      image.sizes = '100vw';
      image.src = `${imageDirectory}${name}-${fallbackWidth}.webp`;
      image.alt = '';
      image.decoding = 'async';
      image.fetchPriority = slide === slides[0] ? 'high' : 'auto';
      picture.append(avif, image);
      slide.appendChild(picture);
      return image.decode().catch(() => undefined);
    };

    const stopTimer = () => {
      window.clearTimeout(timerId);
      timerId = null;
    };

    const scheduleNext = () => {
      stopTimer();
      if (paused || reducedMotion.matches || document.hidden || slides.length < 2) return;
      timerId = window.setTimeout(() => showSlide(activeIndex + 1), intervalMs);
    };

    const showSlide = async (requestedIndex, { manual = false } = {}) => {
      const nextIndex = (requestedIndex + slides.length) % slides.length;
      if (nextIndex === activeIndex) {
        if (manual) scheduleNext();
        return;
      }

      const token = ++changeToken;
      const nextSlide = slides[nextIndex];
      await loadSlide(nextSlide);
      if (token !== changeToken) return;

      slides[activeIndex].classList.remove('is-active');
      slides[activeIndex].setAttribute('aria-hidden', 'true');
      nextSlide.classList.add('is-active');
      nextSlide.removeAttribute('aria-hidden');
      activeIndex = nextIndex;
      loadSlide(slides[(activeIndex + 1) % slides.length]);
      scheduleNext();
    };

    const setPaused = (shouldPause) => {
      paused = shouldPause;
      toggleButton?.setAttribute('aria-pressed', String(paused));
      toggleButton?.setAttribute('aria-label', paused ? 'Play background slideshow' : 'Pause background slideshow');
      if (toggleIcon) toggleIcon.textContent = paused ? '▶' : 'Ⅱ';
      if (paused) stopTimer();
      else scheduleNext();
    };

    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeIndex);
      if (index === activeIndex) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });

    loadSlide(slides[activeIndex]);
    loadSlide(slides[(activeIndex + 1) % slides.length]);

    previousButton?.addEventListener('click', () => showSlide(activeIndex - 1, { manual: true }));
    nextButton?.addEventListener('click', () => showSlide(activeIndex + 1, { manual: true }));
    toggleButton?.addEventListener('click', () => setPaused(!paused));

    scheduleNext();
    reducedMotion.addEventListener?.('change', scheduleNext);
    document.addEventListener('visibilitychange', scheduleNext);
    window.addEventListener('pagehide', stopTimer, { once: true });
  }
}

async function loadProjects() {
  const target = document.getElementById('projects-grid');
  const featuredTarget = document.getElementById('featured-projects-grid');
  if (!target && !featuredTarget) {
    return;
  }

  try {
    const response = await fetch('./data/projects.json?v=20260930-3');
    if (!response.ok) {
      throw new Error('Unable to load projects data.');
    }

    const projects = await response.json();

    if (featuredTarget) {
      featuredTarget.innerHTML = projects.slice(0, 3).map((project) => `
        <article class="card" data-animate>
          <h3>${project.title}</h3>
          <p>${project.description || project.problem || ''}</p>
          <p class="meta">${(project.technologies || []).join(' | ')}</p>
        </article>
      `).join('');
      featuredTarget.querySelectorAll('[data-animate]').forEach((element) => observer.observe(element));
    }

    if (target) {
      target.innerHTML = projects.map((project, index) => `
        <article class="card project-card" data-animate>
          <p class="project-order">${String(index + 1).padStart(2, '0')}</p>
          <h3>${project.title}</h3>
          <p>${project.description || ''}</p>
          <p class="project-result"><strong>Result:</strong> ${project.result || ''}</p>
          <p><strong>Related Publications:</strong></p>
          <ul class="list-clean pretty-list">
            ${(project.related_publications || [])
              .map((item) => `
                <li>
                  <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                  ${item.citation ? `, <span class="pub-citation">${item.citation}</span>` : ''}
                </li>
              `)
              .join('')}
          </ul>
        </article>
      `).join('');
      target.querySelectorAll('[data-animate]').forEach((element) => observer.observe(element));
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadPublications() {
  const highlightedTarget = document.getElementById('highlighted-publications');
  const fullListTarget = document.getElementById('full-publications-list');
  const selectedTarget = document.getElementById('selected-publications');

  if (!highlightedTarget && !fullListTarget && !selectedTarget) {
    return;
  }

  try {
    const response = await fetch('./data/publications.json?v=20260930-3');
    if (!response.ok) {
      throw new Error('Unable to load publications data.');
    }

    const publications = await response.json();

    const renderItem = (pub) => `
      <article class="card" data-animate>
        <h3>${pub.url ? `<a class="publication-title-link" href="${pub.url}" target="_blank" rel="noopener noreferrer">${pub.title}</a>` : pub.title}</h3>
        <p>${pub.authors}</p>
        <p>${pub.venue} (${pub.year})</p>
        <p class="meta">${pub.topic}</p>
      </article>
    `;

    if (selectedTarget) {
      selectedTarget.innerHTML = publications.slice(0, 3).map(renderItem).join('');
      selectedTarget.querySelectorAll('[data-animate]').forEach((element) => observer.observe(element));
    }

    if (highlightedTarget) {
      highlightedTarget.innerHTML = publications
        .filter((pub) => pub.highlighted)
        .slice(0, 3)
        .map(renderItem)
        .join('');
      highlightedTarget.querySelectorAll('[data-animate]').forEach((element) => observer.observe(element));
    }

    if (fullListTarget) {
      fullListTarget.innerHTML = publications.map(renderItem).join('');
      fullListTarget.querySelectorAll('[data-animate]').forEach((element) => observer.observe(element));
    }
  } catch (error) {
    console.error(error);
  }
}

loadProjects();
loadPublications();

// Keep the desktop news panel aligned with the responsive profile card.
const homeProfile = document.querySelector('.home-page .hero-primary-card');
const homeNews = document.querySelector('.home-page .hero-card-compact');
if (homeProfile && homeNews) {
  const alignHomePanels = () => {
    homeNews.style.top = window.innerWidth > 640
      ? `${homeProfile.offsetTop}px`
      : '';
  };
  const homePanelObserver = new ResizeObserver(alignHomePanels);
  homePanelObserver.observe(homeProfile);
  homePanelObserver.observe(homeProfile.parentElement);
  window.addEventListener('resize', alignHomePanels, { passive: true });
  alignHomePanels();
}
