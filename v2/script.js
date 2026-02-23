// ========== THEME TOGGLE ==========
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  if (!themeToggle) {
    return;
  }
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ========== MOBILE NAV ==========
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ========== ACTIVE NAV LINK ==========
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');
  const scrollY = window.scrollY + 80;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navItems.forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === `#${id}`) {
          a.classList.add('active');
        }
      });
    }
  });
}

// ========== SCROLL ANIMATIONS ==========
const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
  : null;

function registerFadeElements(root = document) {
  const fadeElements = root.querySelectorAll('.fade-in');
  fadeElements.forEach(el => {
    if (observer) {
      observer.observe(el);
      return;
    }
    el.classList.add('visible');
  });
}

function applyStaggerDelays() {
  document.querySelectorAll('.stagger-children').forEach(parent => {
    const children = parent.querySelectorAll('.fade-in');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });
}

function refreshDynamicUi() {
  registerFadeElements();
  applyStaggerDelays();
  updateActiveNav();
}

// ========== BACK TO TOP ==========
const backTop = document.getElementById('back-top');
window.addEventListener('scroll', () => {
  if (backTop) {
    backTop.classList.toggle('visible', window.scrollY > 400);
  }
  updateActiveNav();
});

if (backTop) {
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ========== YAML CONTENT LOADER ==========
function setDynamicYear() {
  const yearElement = document.getElementById('current-year');
  if (!yearElement) {
    return;
  }
  yearElement.textContent = String(new Date().getFullYear());
}

const heroImageSwitcherState = {
  avatarElement: null,
  clickHandler: null,
  timerId: null
};

function clearHeroImageSwitcher() {
  if (heroImageSwitcherState.timerId) {
    window.clearInterval(heroImageSwitcherState.timerId);
    heroImageSwitcherState.timerId = null;
  }

  if (heroImageSwitcherState.avatarElement && heroImageSwitcherState.clickHandler) {
    heroImageSwitcherState.avatarElement.removeEventListener('click', heroImageSwitcherState.clickHandler);
  }

  if (heroImageSwitcherState.avatarElement) {
    heroImageSwitcherState.avatarElement.style.cursor = '';
    heroImageSwitcherState.avatarElement.removeAttribute('title');
  }

  heroImageSwitcherState.avatarElement = null;
  heroImageSwitcherState.clickHandler = null;
}

function getOrCreateHeroAvatarImage() {
  const avatar = document.querySelector('.hero-avatar');
  if (!avatar) {
    return null;
  }

  let image = avatar.querySelector('img');
  if (!image) {
    image = document.createElement('img');
    image.loading = 'lazy';
    avatar.replaceChildren(image);
  }

  return { avatar, image };
}

function setupHeroImageSwitcher(imageConfig) {
  clearHeroImageSwitcher();

  const heroConfig = imageConfig && typeof imageConfig === 'object' ? imageConfig.hero : null;
  if (!heroConfig || typeof heroConfig !== 'object' || !isNonEmptyString(heroConfig.primary)) {
    return;
  }

  const avatarData = getOrCreateHeroAvatarImage();
  if (!avatarData) {
    return;
  }

  const { avatar, image } = avatarData;
  const paths = [heroConfig.primary];
  if (isNonEmptyString(heroConfig.alternate)) {
    paths.push(heroConfig.alternate);
  }

  const altBase = isNonEmptyString(heroConfig.alt) ? heroConfig.alt : 'Profile photo';
  const rawInterval = Number(heroConfig.flip_interval_seconds);
  const intervalSeconds = Number.isFinite(rawInterval) && rawInterval > 0 ? rawInterval : 30;
  const intervalMs = intervalSeconds * 1000;
  const flipDurationMs = 720;
  const flipSwapDelayMs = Math.floor(flipDurationMs / 2);
  let currentIndex = 0;
  let isAnimating = false;

  const render = () => {
    image.src = paths[currentIndex];
    image.alt = currentIndex === 0 ? altBase : `${altBase} (AI)`;
  };

  render();

  if (paths.length < 2) {
    return;
  }

  const moveToNext = () => {
    currentIndex = currentIndex === 0 ? 1 : 0;
    render();
  };

  const flip = () => {
    if (isAnimating) {
      return;
    }

    isAnimating = true;
    avatar.classList.add('is-flipping');

    window.setTimeout(() => {
      moveToNext();
    }, flipSwapDelayMs);

    window.setTimeout(() => {
      avatar.classList.remove('is-flipping');
      isAnimating = false;
    }, flipDurationMs + 30);
  };

  const startTimer = () => {
    if (heroImageSwitcherState.timerId) {
      window.clearInterval(heroImageSwitcherState.timerId);
    }
    heroImageSwitcherState.timerId = window.setInterval(flip, intervalMs);
  };

  heroImageSwitcherState.avatarElement = avatar;
  heroImageSwitcherState.clickHandler = () => {
    flip();
    startTimer();
  };

  avatar.style.cursor = 'pointer';
  avatar.title = 'Click to switch profile image';
  avatar.addEventListener('click', heroImageSwitcherState.clickHandler);
  startTimer();
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function setText(selector, value) {
  if (!isNonEmptyString(value)) {
    return;
  }
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function setMetaContent(selector, value) {
  if (!isNonEmptyString(value)) {
    return;
  }
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute('content', value);
  }
}

function setAttribute(selector, name, value) {
  if (!isNonEmptyString(value)) {
    return;
  }
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute(name, value);
  }
}

function createTextNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  node.textContent = text || '';
  return node;
}

function applyHeadConfig(head) {
  if (!head || typeof head !== 'object') {
    return;
  }

  if (isNonEmptyString(head.title)) {
    document.title = head.title;
    setText('#head-title', head.title);
  }

  const ogTitle = isNonEmptyString(head.og_title)
    ? head.og_title
    : head.title;
  const ogDescription = isNonEmptyString(head.og_description)
    ? head.og_description
    : head.description;

  setMetaContent('#head-description', head.description);
  setMetaContent('#head-og-title', ogTitle);
  setMetaContent('#head-og-description', ogDescription);
  setMetaContent('#head-og-type', head.og_type);
  setAttribute('#head-canonical', 'href', head.canonical_url);

  if (head.icons && typeof head.icons === 'object') {
    setAttribute('#head-favicon-svg', 'href', head.icons.svg);
    setAttribute('#head-favicon-png', 'href', head.icons.png_64);
    setAttribute('#head-apple-touch-icon', 'href', head.icons.apple_touch);
    setAttribute('#head-favicon-fallback', 'href', head.icons.fallback_svg);
  }
}

function applySiteConfig(site) {
  if (!site || typeof site !== 'object') {
    return;
  }
  setText('.nav-logo', site.nav_logo);
}

function applyContact(contact) {
  if (!contact || typeof contact !== 'object' || !isNonEmptyString(contact.email)) {
    return;
  }

  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.setAttribute('href', `mailto:${contact.email}`);
    if (link.textContent.includes('@')) {
      link.textContent = contact.email;
    }
  });
}

function renderHero(hero) {
  if (!hero || typeof hero !== 'object') {
    return;
  }

  if (isNonEmptyString(hero.availability)) {
    const badge = document.querySelector('.hero-badge');
    if (badge) {
      const indicator = badge.querySelector('span') || document.createElement('span');
      badge.replaceChildren();
      badge.append(indicator, document.createTextNode(` ${hero.availability}`));
    }
  }

  if (isNonEmptyString(hero.greeting) || isNonEmptyString(hero.name)) {
    const title = document.querySelector('.hero-title');
    if (title) {
      const greeting = isNonEmptyString(hero.greeting) ? hero.greeting : "Hi, I'm";
      const name = isNonEmptyString(hero.name) ? hero.name : 'Your Name';
      const nameSpan = document.createElement('span');
      nameSpan.className = 'gradient-text';
      nameSpan.textContent = name;
      title.replaceChildren(document.createTextNode(`${greeting} `), nameSpan);
    }
  }

  setText('.hero-subtitle', hero.subtitle);
  setText('.hero-description', hero.description);

  if (Array.isArray(hero.cta) && hero.cta.length > 0) {
    const ctaWrap = document.querySelector('.hero-cta');
    if (ctaWrap) {
      ctaWrap.replaceChildren();
      hero.cta.forEach((item, idx) => {
        if (!item || !isNonEmptyString(item.label) || !isNonEmptyString(item.href)) {
          return;
        }
        const link = document.createElement('a');
        link.className = idx === 0 ? 'btn btn-primary' : 'btn btn-outline';
        link.setAttribute('href', item.href);
        link.textContent = item.label;
        ctaWrap.append(link);
      });
    }
  }

  if (Array.isArray(hero.stats) && hero.stats.length > 0) {
    const statsWrap = document.querySelector('.hero-stats');
    if (statsWrap) {
      statsWrap.replaceChildren();
      hero.stats.forEach(stat => {
        if (!stat || !isNonEmptyString(stat.value) || !isNonEmptyString(stat.label)) {
          return;
        }
        const statEl = document.createElement('div');
        statEl.className = 'stat';
        statEl.append(
          createTextNode('div', 'stat-number', stat.value),
          createTextNode('div', 'stat-label', stat.label)
        );
        statsWrap.append(statEl);
      });
    }
  }

  if (isNonEmptyString(hero.avatar_image)) {
    const avatar = document.querySelector('.hero-avatar');
    if (avatar) {
      const image = document.createElement('img');
      image.src = hero.avatar_image;
      image.alt = isNonEmptyString(hero.avatar_alt)
        ? hero.avatar_alt
        : `${hero.name || 'Profile'} photo`;
      image.loading = 'lazy';
      avatar.replaceChildren(image);
    }
  }
}

function renderAbout(about) {
  if (!about || typeof about !== 'object') {
    return;
  }

  if (Array.isArray(about.paragraphs) && about.paragraphs.length > 0) {
    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
      aboutText.replaceChildren();
      about.paragraphs.forEach(paragraph => {
        if (!isNonEmptyString(paragraph)) {
          return;
        }
        const p = document.createElement('p');
        p.textContent = paragraph;
        aboutText.append(p);
      });
    }
  }

  if (Array.isArray(about.highlights) && about.highlights.length > 0) {
    const highlightsWrap = document.querySelector('.about-highlights');
    if (highlightsWrap) {
      highlightsWrap.replaceChildren();
      about.highlights.forEach(item => {
        if (!item || !isNonEmptyString(item.label) || !isNonEmptyString(item.value)) {
          return;
        }

        const icon = createTextNode('span', 'highlight-icon', item.icon || '•');
        const valueWrap = document.createElement('div');
        valueWrap.append(
          createTextNode('div', 'highlight-label', item.label)
        );

        const valueNode = document.createElement('div');
        valueNode.className = 'highlight-value';
        const hasLink = isNonEmptyString(item.href) || item.type === 'email';
        if (hasLink) {
          const link = document.createElement('a');
          const href = isNonEmptyString(item.href)
            ? item.href
            : `mailto:${item.value}`;
          link.href = href;
          link.textContent = item.value;
          valueNode.append(link);
        } else {
          valueNode.textContent = item.value;
        }

        valueWrap.append(valueNode);

        const highlightItem = document.createElement('div');
        highlightItem.className = 'highlight-item';
        highlightItem.append(icon, valueWrap);
        highlightsWrap.append(highlightItem);
      });
    }
  }
}

function renderExperience(experience) {
  if (!experience || !Array.isArray(experience.items) || experience.items.length === 0) {
    return;
  }

  const timeline = document.querySelector('.timeline');
  if (!timeline) {
    return;
  }

  timeline.replaceChildren();
  experience.items.forEach(item => {
    if (!item || !isNonEmptyString(item.role)) {
      return;
    }
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item fade-in';
    const card = document.createElement('div');
    card.className = 'timeline-card';
    const header = document.createElement('div');
    header.className = 'timeline-header';
    header.append(
      createTextNode('div', 'timeline-role', item.role),
      createTextNode('div', 'timeline-period', item.period || '')
    );

    const companyText = [item.company, item.employment_type].filter(Boolean).join(' · ');
    const companyLine = document.createElement('div');
    companyLine.className = 'timeline-company';
    if (isNonEmptyString(item.logo)) {
      const companyLogo = document.createElement('img');
      companyLogo.className = 'timeline-company-logo';
      companyLogo.src = item.logo;
      companyLogo.alt = `${item.company || 'Company'} logo`;
      companyLogo.loading = 'lazy';
      companyLine.append(companyLogo);
    }
    companyLine.append(createTextNode('span', 'timeline-company-name', companyText));

    card.append(
      header,
      companyLine,
      createTextNode('div', 'timeline-desc', item.description || '')
    );
    timelineItem.append(createTextNode('div', 'timeline-dot', ''), card);
    timeline.append(timelineItem);
  });
}

function renderSkills(skills) {
  if (!skills || !Array.isArray(skills.categories) || skills.categories.length === 0) {
    return;
  }

  const grid = document.querySelector('.skills-grid');
  if (!grid) {
    return;
  }

  grid.replaceChildren();
  skills.categories.forEach(category => {
    if (!category || !isNonEmptyString(category.title)) {
      return;
    }
    const categoryEl = document.createElement('div');
    categoryEl.className = 'skill-category fade-in';

    const titleEl = document.createElement('div');
    titleEl.className = 'skill-cat-title';
    if (isNonEmptyString(category.title_icon_url)) {
      const titleIcon = document.createElement('img');
      titleIcon.className = 'skill-cat-title-icon';
      titleIcon.src = category.title_icon_url;
      titleIcon.alt = `${category.title} icon`;
      titleIcon.loading = 'lazy';
      titleIcon.decoding = 'async';
      titleIcon.onerror = () => {
        titleIcon.remove();
      };
      titleEl.append(titleIcon);
    } else if (isNonEmptyString(category.title_icon)) {
      const titleIcon = createTextNode('span', 'skill-cat-title-icon-emoji', category.title_icon);
      titleIcon.setAttribute('aria-hidden', 'true');
      titleEl.append(titleIcon);
    }
    titleEl.append(createTextNode('span', 'skill-cat-title-label', category.title));
    categoryEl.append(titleEl);

    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'skill-tags';
    (Array.isArray(category.tags) ? category.tags : []).forEach(tag => {
      const tagData = normalizeSkillTag(tag);
      if (!tagData) {
        return;
      }

      const tagChip = document.createElement('span');
      tagChip.className = 'skill-tag';
      if (isNonEmptyString(tagData.iconUrl)) {
        const iconNode = document.createElement('img');
        iconNode.className = 'skill-tag-tech-icon';
        iconNode.src = tagData.iconUrl;
        iconNode.alt = `${tagData.label} icon`;
        iconNode.loading = 'lazy';
        iconNode.decoding = 'async';
        iconNode.onerror = () => {
          iconNode.remove();
        };
        tagChip.append(iconNode);
      } else if (isNonEmptyString(tagData.icon)) {
        const iconNode = createTextNode('span', 'skill-tag-icon', tagData.icon);
        iconNode.setAttribute('aria-hidden', 'true');
        tagChip.append(iconNode);
      }
      tagChip.append(createTextNode('span', 'skill-tag-label', tagData.label));
      tagsWrap.append(tagChip);
    });
    categoryEl.append(tagsWrap);
    grid.append(categoryEl);
  });
}

function normalizeSkillTag(tag) {
  if (isNonEmptyString(tag)) {
    const label = tag.trim();
    return {
      label,
      iconUrl: ''
    };
  }

  if (!tag || typeof tag !== 'object') {
    return null;
  }

  // Supports shorthand YAML object format:
  // - AWS: https://cdn.simpleicons.org/amazonwebservices
  const shorthandEntry = getSkillTagShorthandEntry(tag);
  const label = shorthandEntry
    ? shorthandEntry.label
    : (isNonEmptyString(tag.label)
      ? tag.label
      : (isNonEmptyString(tag.name) ? tag.name : ''));
  if (!isNonEmptyString(label)) {
    return null;
  }

  const yamlUrl = shorthandEntry
    ? shorthandEntry.iconUrl
    : (isNonEmptyString(tag.url) ? tag.url : '');
  const iconColor = isNonEmptyString(tag.color) ? tag.color.trim() : '';
  const iconUrl = isNonEmptyString(tag.icon_url)
    ? tag.icon_url
    : (isNonEmptyString(yamlUrl)
      ? yamlUrl
    : (isNonEmptyString(tag.icon) && isProbablyUrl(tag.icon)
      ? tag.icon
      : ''));

  return {
    label,
    iconUrl: applyIconColor(iconUrl, iconColor),
    iconColor,
    icon: isNonEmptyString(tag.icon) && !isProbablyUrl(tag.icon) ? tag.icon : ''
  };
}

function getSkillTagShorthandEntry(tag) {
  const entries = Object.entries(tag || {});
  if (entries.length !== 1) {
    return null;
  }

  const [rawLabel, rawIconUrl] = entries[0];
  if (!isNonEmptyString(rawLabel) || !isNonEmptyString(rawIconUrl) || !isProbablyUrl(rawIconUrl)) {
    return null;
  }

  return {
    label: rawLabel.trim(),
    iconUrl: rawIconUrl.trim()
  };
}

function isProbablyUrl(value) {
  return typeof value === 'string'
    && /^(https?:\/\/|\/|\.{1,2}\/)/.test(value.trim());
}

function normalizeHexColor(color) {
  if (!isNonEmptyString(color)) {
    return '';
  }
  const normalized = color.trim().replace(/^#/, '');
  return /^[0-9a-fA-F]{3,8}$/.test(normalized) ? normalized : '';
}

function applyIconColor(iconUrl, color) {
  if (!isNonEmptyString(iconUrl)) {
    return '';
  }

  const hexColor = normalizeHexColor(color);
  if (!hexColor) {
    return iconUrl;
  }

  try {
    const parsed = new URL(iconUrl, window.location.href);
    if (parsed.hostname !== 'cdn.simpleicons.org') {
      return iconUrl;
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return iconUrl;
    }

    const slug = segments[0];
    parsed.pathname = `/${slug}/${hexColor}`;
    return parsed.toString();
  } catch (error) {
    return iconUrl;
  }
}

function renderCertifications(certs) {
  if (!certs || !Array.isArray(certs.items) || certs.items.length === 0) {
    return;
  }

  const grid = document.querySelector('.certs-grid');
  if (!grid) {
    return;
  }

  const certContainer = document.querySelector('#certs .container');
  const existingMoreWrap = certContainer
    ? certContainer.querySelector('.certs-more-wrap')
    : null;
  if (existingMoreWrap) {
    existingMoreWrap.remove();
  }

  const visibleCertCount = Number.isFinite(Number(certs.initial_visible_count))
    && Number(certs.initial_visible_count) > 0
    ? Number(certs.initial_visible_count)
    : 8;
  let renderedCount = 0;
  grid.replaceChildren();
  certs.items.forEach(item => {
    if (!item || !isNonEmptyString(item.name)) {
      return;
    }

    const card = document.createElement('div');
    card.className = 'cert-card fade-in';
    if (renderedCount >= visibleCertCount) {
      card.classList.add('cert-card-hidden');
    }

    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'cert-badge-wrapper';

    if (isNonEmptyString(item.badge_image)) {
      const badgeImage = document.createElement('img');
      badgeImage.src = item.badge_image;
      badgeImage.alt = `${item.name} badge`;
      badgeImage.loading = 'lazy';
      badgeImage.style.maxWidth = '90px';
      badgeImage.style.maxHeight = '90px';
      badgeWrap.append(badgeImage);
    } else {
      const emoji = createTextNode('span', '', item.badge_emoji || '🏅');
      emoji.style.fontSize = '3.5rem';
      badgeWrap.append(emoji);
    }

    const verifyLink = document.createElement('a');
    verifyLink.className = 'cert-link';
    verifyLink.textContent = item.verify_label || 'Verify ↗';
    verifyLink.href = isNonEmptyString(item.verify_url) ? item.verify_url : '#';
    if (isNonEmptyString(item.verify_url)) {
      verifyLink.target = '_blank';
      verifyLink.rel = 'noopener';
    }

    card.append(
      badgeWrap,
      createTextNode('div', 'cert-name', item.name),
      createTextNode('div', 'cert-issuer', item.issuer || ''),
      createTextNode('div', 'cert-date', item.date || ''),
      verifyLink
    );
    grid.append(card);
    renderedCount += 1;
  });

  if (!certContainer || renderedCount <= visibleCertCount) {
    return;
  }

  const moreWrap = document.createElement('div');
  moreWrap.className = 'certs-more-wrap';
  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'btn btn-outline certs-more-btn';
  const moreLabel = isNonEmptyString(certs.more_button_label)
    ? certs.more_button_label
    : 'View More Certifications';
  const lessLabel = isNonEmptyString(certs.less_button_label)
    ? certs.less_button_label
    : 'View Less';
  let expanded = false;

  const applyExpandedState = () => {
    grid.querySelectorAll('.cert-card').forEach((card, index) => {
      const shouldHide = !expanded && index >= visibleCertCount;
      card.classList.toggle('cert-card-hidden', shouldHide);
    });
    toggleButton.textContent = expanded ? lessLabel : moreLabel;
    refreshDynamicUi();
  };

  toggleButton.addEventListener('click', () => {
    expanded = !expanded;
    applyExpandedState();
  });

  applyExpandedState();
  moreWrap.append(toggleButton);
  certContainer.append(moreWrap);
}

function renderProjects(projects) {
  if (!projects || !Array.isArray(projects.items) || projects.items.length === 0) {
    return;
  }

  const grid = document.querySelector('.projects-grid');
  if (!grid) {
    return;
  }

  grid.replaceChildren();
  projects.items.forEach(item => {
    if (!item || !isNonEmptyString(item.name)) {
      return;
    }

    const card = document.createElement('div');
    card.className = 'project-card fade-in';

    const header = document.createElement('div');
    header.className = 'project-header';
    header.append(createTextNode('span', 'project-icon', item.icon || '🚀'));

    const links = document.createElement('div');
    links.className = 'project-links';
    if (isNonEmptyString(item.github_url)) {
      const github = document.createElement('a');
      github.href = item.github_url;
      github.className = 'project-link';
      github.target = '_blank';
      github.rel = 'noopener';
      github.title = 'GitHub';
      github.textContent = '⌥';
      links.append(github);
    }
    if (isNonEmptyString(item.demo_url)) {
      const demo = document.createElement('a');
      demo.href = item.demo_url;
      demo.className = 'project-link';
      demo.target = '_blank';
      demo.rel = 'noopener';
      demo.title = 'Live Demo';
      demo.textContent = '↗';
      links.append(demo);
    }
    header.append(links);

    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'project-tags';
    (Array.isArray(item.tags) ? item.tags : []).forEach(tag => {
      if (!isNonEmptyString(tag)) {
        return;
      }
      tagsWrap.append(createTextNode('span', 'project-tag', tag));
    });

    card.append(
      header,
      createTextNode('div', 'project-name', item.name),
      createTextNode('div', 'project-desc', item.description || ''),
      tagsWrap
    );
    grid.append(card);
  });
}

function renderEducation(education) {
  if (!education || !Array.isArray(education.items) || education.items.length === 0) {
    return;
  }

  const grid = document.querySelector('.education-grid');
  if (!grid) {
    return;
  }

  grid.replaceChildren();
  education.items.forEach(item => {
    if (!item || !isNonEmptyString(item.degree)) {
      return;
    }

    const card = document.createElement('div');
    card.className = 'edu-card fade-in';
    const body = document.createElement('div');
    body.append(
      createTextNode('div', 'edu-degree', item.degree),
      createTextNode('div', 'edu-school', item.school || ''),
      createTextNode('div', 'edu-period', item.period || ''),
      createTextNode('div', 'edu-desc', item.description || '')
    );
    card.append(
      createTextNode('div', 'edu-icon', item.icon || '🎓'),
      body
    );
    grid.append(card);
  });
}

function toEmbedUrl(video) {
  if (isNonEmptyString(video.embed_url)) {
    return video.embed_url;
  }
  if (isNonEmptyString(video.youtube_id)) {
    return `https://www.youtube.com/embed/${video.youtube_id}`;
  }
  return '';
}

const VIDEO_DESCRIPTION_PREVIEW_THRESHOLD = 180;
let videoModal = null;

function ensureVideoModal() {
  if (videoModal) {
    return videoModal;
  }

  const modalRoot = document.createElement('div');
  modalRoot.className = 'video-modal';
  modalRoot.setAttribute('aria-hidden', 'true');
  modalRoot.innerHTML = `
    <div class="video-modal-backdrop" data-video-close="true"></div>
    <div class="video-modal-card" role="dialog" aria-modal="true" aria-labelledby="video-modal-title">
      <button type="button" class="video-modal-close" aria-label="Close">✕</button>
      <h3 id="video-modal-title" class="video-modal-title"></h3>
      <div class="video-modal-embed-wrap">
        <iframe class="video-modal-embed" title="Video preview"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen loading="lazy"></iframe>
      </div>
      <p class="video-modal-description"></p>
      <div class="video-modal-actions">
        <a class="btn btn-primary video-modal-repo" target="_blank" rel="noopener">Open Git Repo ↗</a>
      </div>
    </div>
  `;
  document.body.append(modalRoot);

  const titleEl = modalRoot.querySelector('.video-modal-title');
  const embedWrapEl = modalRoot.querySelector('.video-modal-embed-wrap');
  const embedEl = modalRoot.querySelector('.video-modal-embed');
  const descriptionEl = modalRoot.querySelector('.video-modal-description');
  const repoLinkEl = modalRoot.querySelector('.video-modal-repo');
  const closeButton = modalRoot.querySelector('.video-modal-close');
  const backdrop = modalRoot.querySelector('.video-modal-backdrop');

  const close = () => {
    modalRoot.classList.remove('open');
    modalRoot.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('video-modal-open');
    if (embedEl) {
      embedEl.src = '';
    }
  };

  const open = (video, embedUrl) => {
    titleEl.textContent = isNonEmptyString(video.title) ? video.title : 'Video';
    if (isNonEmptyString(embedUrl)) {
      embedEl.src = embedUrl;
      embedWrapEl.classList.remove('hidden');
    } else {
      embedEl.src = '';
      embedWrapEl.classList.add('hidden');
    }
    descriptionEl.textContent = isNonEmptyString(video.description)
      ? video.description
      : 'No additional description available.';

    if (isNonEmptyString(video.repo_url)) {
      repoLinkEl.href = video.repo_url;
      repoLinkEl.classList.remove('disabled');
      repoLinkEl.setAttribute('aria-disabled', 'false');
    } else {
      repoLinkEl.href = '#';
      repoLinkEl.classList.add('disabled');
      repoLinkEl.setAttribute('aria-disabled', 'true');
    }

    modalRoot.classList.add('open');
    modalRoot.setAttribute('aria-hidden', 'false');
    document.body.classList.add('video-modal-open');
  };

  closeButton.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  modalRoot.addEventListener('click', event => {
    if (event.target.matches('.video-modal-repo.disabled')) {
      event.preventDefault();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modalRoot.classList.contains('open')) {
      close();
    }
  });

  videoModal = { open, close };
  return videoModal;
}

function renderVideos(videos) {
  if (!videos || !Array.isArray(videos.items) || videos.items.length === 0) {
    return;
  }

  const grid = document.querySelector('.videos-grid');
  if (!grid) {
    return;
  }

  grid.replaceChildren();
  videos.items.forEach(video => {
    const item = video || {};
    const embedUrl = toEmbedUrl(item);
    if (!isNonEmptyString(embedUrl) || !isNonEmptyString(item.title)) {
      return;
    }

    const card = document.createElement('div');
    card.className = 'video-card fade-in';

    const thumb = document.createElement('div');
    thumb.className = 'video-thumb';
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.title = item.title;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    thumb.append(iframe);

    const info = document.createElement('div');
    info.className = 'video-info';
    info.append(createTextNode('div', 'video-title', item.title));

    const descriptionText = isNonEmptyString(item.description)
      ? item.description
      : '';
    const descriptionEl = createTextNode('p', 'video-description', descriptionText);
    info.append(descriptionEl);

    if (descriptionText.length > VIDEO_DESCRIPTION_PREVIEW_THRESHOLD) {
      const actions = document.createElement('div');
      actions.className = 'video-actions';
      const readMoreButton = document.createElement('button');
      readMoreButton.type = 'button';
      readMoreButton.className = 'video-read-more';
      readMoreButton.textContent = 'Read More';
      readMoreButton.addEventListener('click', () => {
        ensureVideoModal().open(item, embedUrl);
      });
      actions.append(readMoreButton);
      info.append(actions);
    }

    card.append(thumb, info);
    grid.append(card);
  });
}

function renderSocial(social) {
  if (!social || typeof social !== 'object') {
    return;
  }

  const titleMap = {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    twitter: 'Twitter/X',
    credly: 'Credly',
    youtube: 'YouTube'
  };

  Object.entries(titleMap).forEach(([key, title]) => {
    if (!isNonEmptyString(social[key])) {
      return;
    }
    const link = document.querySelector(`.footer-social a[title="${title}"]`);
    if (link) {
      link.href = social[key];
    }
  });
}

function renderFooter(footer) {
  if (!footer || typeof footer !== 'object') {
    return;
  }

  setText('#footer-intro-text', footer.intro_text);
  setText('#footer-rights-owner', footer.rights_owner);
  setText('#footer-rights-text', footer.rights_text);

  const hostedLink = document.getElementById('footer-hosted-link');
  if (!hostedLink) {
    return;
  }

  if (isNonEmptyString(footer.hosted_link_label)) {
    hostedLink.textContent = footer.hosted_link_label;
  }

  if (isNonEmptyString(footer.hosted_link_url)) {
    hostedLink.href = footer.hosted_link_url;
  }
}

function applyYamlContent(data) {
  if (!data || typeof data !== 'object') {
    return;
  }

  const headConfig = data.head && typeof data.head === 'object'
    ? data.head
    : data.site;

  applyHeadConfig(headConfig);
  applySiteConfig(data.site);
  applyContact(data.contact);
  renderHero(data.hero);
  renderAbout(data.about);
  renderExperience(data.experience);
  renderSkills(data.skills);
  renderCertifications(data.certifications);
  renderProjects(data.projects);
  renderEducation(data.education);
  renderVideos(data.videos);
  renderSocial(data.social);
  renderFooter(data.footer);
}

async function loadYamlContent() {
  const parsed = await loadYamlFile('content.yaml');
  if (!parsed || typeof parsed !== 'object') {
    return;
  }

  applyYamlContent(parsed);
  refreshDynamicUi();
}

async function loadImagesConfig() {
  const parsed = await loadYamlFile('images.yaml');
  if (!parsed || typeof parsed !== 'object') {
    return;
  }

  setupHeroImageSwitcher(parsed);
}

async function loadYamlFile(filename) {
  const parser = window.jsyaml;
  if (!parser || typeof parser.load !== 'function') {
    console.warn(`YAML parser not found. Skipping ${filename} hydration.`);
    return null;
  }

  try {
    const response = await fetch(filename, { cache: 'no-store' });
    if (!response.ok) {
      console.warn(`Unable to load ${filename} (${response.status}).`);
      return null;
    }

    const rawYaml = await response.text();
    return parser.load(rawYaml);
  } catch (error) {
    console.warn(`Failed to load or parse ${filename}.`, error);
    return null;
  }
}

registerFadeElements();
applyStaggerDelays();
updateActiveNav();
setDynamicYear();

async function initializePageData() {
  await loadYamlContent();
  await loadImagesConfig();
}

initializePageData();
