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
  const originalSlides = Array.from(cosmosTrack?.querySelectorAll('.cosmos-slide') || []);
  if (cosmosTrack && originalSlides.length > 0) {
    const imageDirectory = './assets/images/images/homepage/website_responsive/images/';
    const widths = [640, 960, 1280, 1920, 2560, 3840, 7680];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeIndex = 0;
    let timerId = null;
    let transitionFallbackId = null;

    const responsiveSet = (name, extension) => widths
      .map((width) => `${imageDirectory}${name}-${width}.${extension} ${width}w`)
      .join(', ');

    const loadSlide = (slide) => {
      if (slide.querySelector('img')) {
        return slide.querySelector('img').decode().catch(() => undefined);
      }

      const name = slide.dataset.image;
      const picture = document.createElement('picture');
      const avif = document.createElement('source');
      avif.type = 'image/avif';
      avif.sizes = '100vw';
      avif.srcset = responsiveSet(name, 'avif');
      const image = document.createElement('img');
      image.srcset = responsiveSet(name, 'webp');
      image.sizes = '100vw';
      image.src = `${imageDirectory}${name}-1280.webp`;
      image.width = 7680;
      image.height = 3840;
      image.alt = '';
      image.decoding = 'async';
      image.fetchPriority = slide === originalSlides[0] ? 'high' : 'auto';
      picture.append(avif, image);
      slide.appendChild(picture);
      return image.decode().catch(() => undefined);
    };

    const firstSlide = originalSlides[0];
    const firstClone = firstSlide.cloneNode(true);
    firstClone.classList.add('is-clone');
    firstClone.setAttribute('aria-hidden', 'true');
    cosmosTrack.appendChild(firstClone);
    loadSlide(firstSlide);
    loadSlide(originalSlides[1] || firstClone);

    const finishTransition = () => {
      window.clearTimeout(transitionFallbackId);
      transitionFallbackId = null;
      if (activeIndex === originalSlides.length) {
        cosmosTrack.classList.add('is-resetting');
        cosmosTrack.style.transform = 'translate3d(0, 0, 0)';
        activeIndex = 0;
        requestAnimationFrame(() => cosmosTrack.classList.remove('is-resetting'));
      }
      loadSlide(originalSlides[(activeIndex + 1) % originalSlides.length] || firstClone);
    };

    cosmosTrack.addEventListener('transitionend', (event) => {
      if (event.target === cosmosTrack && event.propertyName === 'transform') finishTransition();
    });

    const advance = async () => {
      if (document.hidden || reducedMotion.matches) return;
      const nextIndex = activeIndex + 1;
      const nextSlide = originalSlides[nextIndex] || firstClone;
      await loadSlide(nextSlide);
      if (document.hidden || reducedMotion.matches) return;
      activeIndex = nextIndex;
      cosmosTrack.style.transform = `translate3d(-${activeIndex * 100}%, 0, 0)`;
      transitionFallbackId = window.setTimeout(finishTransition, Number(cosmosCarousel.dataset.transitionMs) || 1300);
    };

    const startTimer = () => {
      window.clearInterval(timerId);
      if (!reducedMotion.matches) timerId = window.setInterval(advance, Number(cosmosCarousel.dataset.intervalMs) || 6500);
    };

    startTimer();
    reducedMotion.addEventListener?.('change', startTimer);
    document.addEventListener('visibilitychange', startTimer);
    window.addEventListener('pagehide', () => {
      window.clearInterval(timerId);
      window.clearTimeout(transitionFallbackId);
    }, { once: true });
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
