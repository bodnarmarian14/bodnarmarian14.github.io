document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. HELPERS ---
    const getEl = (id) => document.getElementById(id);
    const setText = (id, txt) => { const el = getEl(id); if (el) el.textContent = txt; };
    const setSrc = (id, src) => { const el = getEl(id); if (el) el.src = src; };
    const setHtml = (id, html) => { const el = getEl(id); if (el) el.innerHTML = html; };
    
    // Efficiently handles "Read More" logic
    const initReadMore = (containerId, btnId) => {
        const container = getEl(containerId);
        const btn = getEl(btnId);
        if (!container || !btn) return;

        // Wait for layout to paint to calculate height
        setTimeout(() => {
            if (container.scrollHeight > container.clientHeight) {
                btn.style.display = 'inline-block';
                btn.onclick = () => {
                    container.classList.toggle('line-clamp');
                    btn.textContent = container.classList.contains('line-clamp') ? 'Read More' : 'Read Less';
                };
            } else {
                btn.style.display = 'none';
            }
        }, 50);
    };

    // --- 2. DATA POPULATION ---
    try {
        const response = await fetch('data.yaml');
        const text = await response.text();
        const data = jsyaml.load(text);

        // A. Static Footer Info
        setText('year', new Date().getFullYear());
        setText('footer-name', data.profile.name);

        // B. Profile & Sidebar Mapping (Reduces repetitive code)
        const textMap = {
            'profile-name': data.profile.name, 'sidebar-name': data.profile.name,
            'profile-role': data.profile.role, 'sidebar-role': data.profile.role,
            'sidebar-email': data.profile.email, 'footer-email': data.profile.email,
            'sidebar-phone': data.profile.phone, 'footer-phone': data.profile.phone,
            'sidebar-location': data.profile.location, 'footer-location': data.profile.location,
            'sidebar-linkedin': data.profile.linkedin
        };
        Object.entries(textMap).forEach(([id, val]) => setText(id, val));

        setSrc('profile-img', data.profile.image);
        setSrc('sidebar-img', data.profile.image);

        // C. Specific HTML Blocks
        const contactHTML = `
            <i class="fas fa-envelope"></i> ${data.profile.email} &nbsp;|&nbsp; 
            <i class="fab fa-linkedin"></i> ${data.profile.linkedin} &nbsp;|&nbsp; 
            <i class="fas fa-phone"></i> ${data.profile.phone}`;
        setHtml('pdf-contact-text', contactHTML);

        // D. About Section
        setHtml('about-content', marked.parse(data.about));
        initReadMore('about-content', 'read-more-btn');

        // E. Lists (Experience, Education, Projects, Certs)
        // Helper to generate HTML lists efficiently
        const renderList = (containerId, items, templateFn) => {
            const container = getEl(containerId);
            if (container && items?.length) {
                container.innerHTML = items.map(templateFn).join('');
            }
        };

        // Experience
        renderList('experience-list', data.experience, item => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <img src="${item.logo}" class="company-logo" onerror="this.style.display='none'">
                        <div><h3>${item.role}</h3><h4>${item.company}</h4></div>
                    </div>
                    <div class="markdown-content">${marked.parse(item.desc)}</div>
                </div>
            </div>`);

        // Education
        renderList('education-list', data.education, item => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <img src="${item.logo}" class="company-logo" onerror="this.style.display='none'">
                        <div><h3>${item.degree}</h3><h4>${item.school}</h4></div>
                    </div>
                    <div class="markdown-content">${item.desc}</div>
                </div>
            </div>`);

        // Projects
        renderList('project-list', data.projects, proj => `
            <div class="project-card">
                <h3>${proj.title}</h3>
                ${proj.desc ? `<div class="project-desc">${marked.parse(proj.desc)}</div>` : ''}
                <a href="${proj.repo}" target="_blank" class="repo-btn"><i class="fab fa-github"></i> View Repository</a>
            </div>`);

        // Certifications
        renderList('cert-list', data.certifications, cert => `
            <a href="${cert.link}" target="_blank" class="cert-card">
                <h3>${cert.title}</h3>
                <div class="cert-img-wrapper"><img src="${cert.image}" onerror="this.src='https://via.placeholder.com/100?text=Badge'"></div>
                <div class="cert-info"><p>${cert.issuer}</p><span class="verify-btn">Verify <i class="fas fa-external-link-alt"></i></span></div>
            </a>`);

        // F. Skills (Dual rendering for Web and Sidebar)
        if (data.skills) {
            const webSkills = data.skills.map(s => `<span><i class="${s.icon}"></i> ${s.name}</span>`).join('');
            const sideSkills = data.skills.map(s => `<span>${s.name}</span>`).join('');
            setHtml('skills-list', webSkills);
            setHtml('sidebar-skills', sideSkills);
        }

        // G. Languages (Dual rendering)
        if (data.languages) {
            const langHTML = data.languages.map(l => 
                `<div class="lang-row"><i class="fi fi-${l.countryCode}"></i> <span>${l.name} (${l.level})</span></div>`
            ).join('');
            setHtml('footer-languages', langHTML);
            setHtml('sidebar-languages', langHTML);
        }

        // H. Update Social Links (Targeting the IDs added in HTML refactor)
        const updateLink = (id, url) => { const el = getEl(id); if (el && url) el.href = url; };
        updateLink('link-linkedin', `https://www.${data.profile.linkedin}`);
        updateLink('link-github', data.projects?.[0]?.repo ? data.projects[0].repo.split('/').slice(0,3).join('/') : '#'); // rough guess or add github to profile yaml
        updateLink('link-gitlab', 'https://gitlab.com/devops-project23'); 

        // I. Videos
        if (data.videos) {
            const videoHTML = data.videos.map((video, idx) => `
                <div class="video-wrapper">
                    <h3>${video.title}</h3>
                    <div class="video-container web-video">
                        <iframe src="https://www.youtube.com/embed/${video.id}" title="${video.title}" frameborder="0" allowfullscreen loading="lazy"></iframe>
                    </div>
                    <div id="video-desc-${idx}" class="markdown-content line-clamp video-desc">${marked.parse(video.desc)}</div>
                    <button id="video-btn-${idx}" class="read-more-btn">Read More</button>
                    <div class="pdf-video-link" style="display: none;">
                        <p><strong>Watch Video:</strong> <a href="https://youtu.be/${video.id}">https://youtu.be/${video.id}</a></p>
                    </div>
                </div>
            `).join('');
            
            setHtml('video-list', videoHTML);
            
            // Initialize read more buttons for videos after injection
            data.videos.forEach((_, idx) => initReadMore(`video-desc-${idx}`, `video-btn-${idx}`));
        }

    } catch (err) {
        console.error('Error loading YAML data:', err);
        setText('profile-name', 'Error loading data');
    }

    // --- 3. EVENT LISTENERS ---
    
    // PDF Download
    const downloadBtn = getEl('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            typeof downloadPDF === "function" 
                ? downloadPDF() 
                : alert("PDF Generator is still loading, please wait...");
        });
    }

    // Smooth Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});