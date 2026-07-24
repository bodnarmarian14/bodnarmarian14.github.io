// --- 1. CONFIG & HELPERS ---
const PDF_COLORS = {
  blue: '#1f6feb', sidebar: '#161b22', textWhite: '#ffffff',
  textGrey: '#c9d1d9', textDark: '#1c2128', divider: '#30363d'
};

const PDF_ICONS = {
  email: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  location: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  linkedin: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
  github: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
};

const pdfCleanText = (str) => str?.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim() || '';

const pdfGetBase64Image = (url, isRound = false) => new Promise((resolve) => {
  if (!url) {
    resolve(null);
    return;
  }
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.onload = () => {
    const size = Math.min(img.width, img.height);
    const canvas = document.createElement('canvas');
    Object.assign(canvas, { width: size, height: size });
    const ctx = canvas.getContext('2d');

    if (isRound) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
    } else {
      ctx.drawImage(img, 0, 0);
    }
    resolve(canvas.toDataURL('image/png'));
  };
  img.onerror = () => resolve(null);
  img.src = url;
});

const pdfCreatePill = (text, type) => {
  const isSidebar = type === 'sidebar';
  const width = isSidebar ? 180 : 120;
  return {
    columns: [{
      width, stack: [
        { canvas: [{ type: 'rect', x: 0, y: 0, w: width, h: 22, r: 11, color: isSidebar ? null : PDF_COLORS.blue, lineColor: isSidebar ? PDF_COLORS.divider : null }] },
        { text: text.toUpperCase(), color: 'white', bold: true, fontSize: 9, alignment: 'center', margin: [0, -16, 0, 0] }
      ]
    }],
    alignment: isSidebar ? 'center' : 'left', margin: [0, 10, 0, 15]
  };
};

const pdfIconRow = (path, textVal, linkUrl = null) => textVal ? {
  columns: [
    { width: 14, svg: `<svg viewBox="0 0 24 24"><path fill="${PDF_COLORS.blue}" d="${path}"/></svg>` },
    { width: '*', text: textVal, fontSize: 9, color: PDF_COLORS.textGrey, margin: [6, 3, 0, 6], link: linkUrl, decoration: null }
  ]
} : null;

const pdfListItem = (text) => ({
  unbreakable: true, margin: [0, 0, 0, 5],
  columns: [
    { width: 10, text: '•', color: PDF_COLORS.blue, fontSize: 10 },
    { width: '*', text, fontSize: 9, color: PDF_COLORS.textGrey }
  ]
});

function pdfFindHighlight(highlights, label) {
  if (!Array.isArray(highlights)) {
    return '';
  }
  const found = highlights.find(item => item && typeof item.label === 'string' && item.label.toLowerCase() === label.toLowerCase());
  return found ? (found.value || '') : '';
}

// --- 2. MAIN FUNCTION ---
async function downloadCvPdf() {
  const overlay = document.getElementById('pdf-loading-overlay');
  if (overlay) {
    overlay.classList.add('visible');
  }

  try {
    const [contentRes, imagesRes] = await Promise.all([
      fetch('content.yaml', { cache: 'no-store' }),
      fetch('images.yaml', { cache: 'no-store' })
    ]);
    const data = jsyaml.load(await contentRes.text());
    const imagesConfig = jsyaml.load(await imagesRes.text());

    const hero = data.hero || {};
    const about = data.about || {};
    const experienceItems = (data.experience && data.experience.items) || [];
    const educationItems = (data.education && data.education.items) || [];
    const skillCategories = (data.skills && data.skills.categories) || [];
    const certItems = (data.certifications && data.certifications.items) || [];
    const projectItems = (data.projects && data.projects.items) || [];
    const social = data.social || {};
    const email = (data.contact && data.contact.email) || pdfFindHighlight(about.highlights, 'Email');
    const location = pdfFindHighlight(about.highlights, 'Location');
    const languages = pdfFindHighlight(about.highlights, 'Languages');

    const avatarUrl = hero.avatar_image || (imagesConfig && imagesConfig.hero && imagesConfig.hero.primary) || '';

    // Concurrent image loading
    const [profileImg, ...certImages] = await Promise.all([
      pdfGetBase64Image(avatarUrl, true),
      ...certItems.map(c => pdfGetBase64Image(c.badge_image, false))
    ]);

    // --- Sidebar content ---
    const leftContent = [
      profileImg && { image: profileImg, width: 120, height: 120, alignment: 'center', margin: [0, 10, 0, 20] },
      { text: 'About Me', style: 'h3_white', alignment: 'center' },
      { text: pdfCleanText(about.paragraphs && about.paragraphs[0]), style: 'p_grey', alignment: 'center', margin: [10, 5, 10, 20] },
      {
        stack: [
          pdfIconRow(PDF_ICONS.email, email, email ? `mailto:${email}` : null),
          pdfIconRow(PDF_ICONS.location, location),
          pdfIconRow(PDF_ICONS.linkedin, social.linkedin ? 'LinkedIn Profile' : null, social.linkedin ? `https://${social.linkedin.replace(/^https?:\/\//, '')}` : null),
          pdfIconRow(PDF_ICONS.github, social.github ? 'GitHub Profile' : null, social.github)
        ].filter(Boolean), margin: [10, 0, 10, 5]
      }
    ].filter(Boolean);

    if (languages) {
      leftContent.push(
        pdfCreatePill('Languages', 'sidebar'),
        { stack: languages.split('·').map(l => pdfListItem(l.trim())).filter(l => l.columns[1].text), margin: [25, 0, 10, 0] }
      );
    }

    if (skillCategories.length) {
      leftContent.push(pdfCreatePill('Skills', 'sidebar'));
      skillCategories.forEach(category => {
        const tags = (category.tags || [])
          .map(tag => (typeof tag === 'string' ? tag : (tag.label || Object.keys(tag)[0])))
          .filter(Boolean);
        if (!tags.length) {
          return;
        }
        leftContent.push({
          stack: [
            { text: pdfCleanText(category.title).replace(/^[^\w]+/, '').trim(), color: 'white', bold: true, fontSize: 9, margin: [0, 0, 0, 2] },
            { text: tags.join(', '), color: PDF_COLORS.textGrey, fontSize: 8.5, margin: [0, 0, 0, 10], lineHeight: 1.3 }
          ], margin: [25, 0, 10, 0]
        });
      });
    }

    if (certItems.length) {
      leftContent.push(pdfCreatePill('Certifications', 'sidebar'));
      certItems.forEach((cert, i) => {
        const cImg = certImages[i];
        leftContent.push({
          unbreakable: true, margin: [20, 0, 10, 5],
          columns: [
            { width: 40, stack: [cImg ? { image: cImg, width: 30, height: 30 } : { text: '•', color: 'white' }] },
            { width: '*', text: pdfCleanText(cert.name), color: 'white', fontSize: 9, margin: [0, 8, 0, 8], link: cert.verify_url, decoration: null }
          ]
        });
      });
    }

    // --- Main content ---
    const rightContent = [{
      stack: [
        { text: (hero.name || '').toUpperCase(), fontSize: 30, bold: true, color: 'white', letterSpacing: 1 },
        { text: (hero.subtitle || '').toUpperCase(), fontSize: 12, color: 'white', letterSpacing: 2, margin: [0, 4, 0, 0] }
      ], margin: [0, 20, 0, 70]
    }];

    if (experienceItems.length) {
      rightContent.push(pdfCreatePill('Experience', 'main'));
      experienceItems.forEach(job => rightContent.push({
        stack: [
          { text: job.company || '', fontSize: 12, bold: true, color: PDF_COLORS.textDark },
          { columns: [{ text: job.role || '', fontSize: 10, bold: true, width: '*' }, { text: job.period || '', fontSize: 9, italics: true, color: '#666', alignment: 'right', width: 'auto' }], margin: [0, 0, 0, 6] },
          { text: pdfCleanText(job.description), fontSize: 9, color: '#444', margin: [0, 0, 0, 15], lineHeight: 1.1 }
        ]
      }));
    }

    if (educationItems.length) {
      rightContent.push(pdfCreatePill('Education', 'main'));
      educationItems.forEach(edu => rightContent.push({
        stack: [
          { text: edu.school || '', fontSize: 11, bold: true, color: PDF_COLORS.textDark },
          { text: edu.degree || '', fontSize: 10, margin: [0, 2, 0, 2] },
          { text: edu.period || '', fontSize: 9, color: '#666', italics: true },
          edu.description && { text: pdfCleanText(edu.description), fontSize: 9, color: '#444', margin: [0, 4, 0, 0], lineHeight: 1.1 }
        ].filter(Boolean), margin: [0, 0, 0, 10]
      }));
    }

    if (projectItems.length) {
      rightContent.push(pdfCreatePill('Projects', 'main'));
      projectItems.forEach(proj => {
        const links = [];
        if (proj.github_url) {
          links.push({ text: 'View Code', link: proj.github_url, color: PDF_COLORS.blue, fontSize: 9, decoration: 'underline' });
        }
        if (proj.demo_url && proj.demo_url !== '#') {
          links.push({ text: proj.github_url ? '   Live Demo' : 'Live Demo', link: proj.demo_url, color: PDF_COLORS.blue, fontSize: 9, decoration: 'underline' });
        }
        rightContent.push({
          stack: [
            { text: proj.name || '', fontSize: 11, bold: true, color: PDF_COLORS.textDark },
            { text: pdfCleanText(proj.description), fontSize: 9, color: '#444', margin: [0, 4, 0, 4], lineHeight: 1.1 },
            links.length ? { text: links, margin: [0, 2, 0, 12] } : { text: '', margin: [0, 0, 0, 8] }
          ]
        });
      });
    }

    // --- PDF generation ---
    pdfMake.createPdf({
      pageSize: 'A4',
      pageMargins: [0, 40, 0, 40],

      background: function (currentPage, pageSize) {
        return {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: pageSize.width * 0.35,
              h: pageSize.height,
              color: PDF_COLORS.sidebar
            },
            ...(currentPage === 1 ? [{
              type: 'rect',
              x: pageSize.width * 0.35,
              y: 0,
              w: pageSize.width * 0.65,
              h: 180,
              color: PDF_COLORS.blue
            }] : [])
          ]
        };
      },

      content: [{
        columns: [
          { width: '35%', stack: leftContent, margin: [15, 0, 15, 0] },
          { width: '65%', stack: rightContent, margin: [40, 0, 40, 0] }
        ]
      }],
      styles: {
        h3_white: { fontSize: 14, color: 'white', margin: [0, 0, 0, 5], bold: true },
        p_grey: { fontSize: 9, color: PDF_COLORS.textGrey, lineHeight: 1.2 }
      },
      defaultStyle: { font: 'Roboto', fontSize: 9 }
    }).download(`${(hero.name || 'CV').replace(/\s+/g, '_')}_CV.pdf`);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    alert('Something went wrong while generating the PDF. Please try again.');
  } finally {
    if (overlay) {
      overlay.classList.remove('visible');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const downloadButton = document.getElementById('download-cv');
  if (downloadButton) {
    downloadButton.addEventListener('click', downloadCvPdf);
  }
});
