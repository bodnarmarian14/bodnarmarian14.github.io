document.addEventListener('DOMContentLoaded', () => {

    // --- 1. YAML LOADING & PAGE POPULATION ---
    fetch('data.yaml')
        .then(response => response.text())
        .then(text => {
            const data = jsyaml.load(text);

            // General Info
            const year = new Date().getFullYear();
            document.getElementById('year').textContent = year;
            document.getElementById('footer-name').textContent = data.profile.name;

            // Profile (Main Web)
            document.getElementById('profile-name').textContent = data.profile.name;
            document.getElementById('profile-role').textContent = data.profile.role;
            document.getElementById('profile-img').src = data.profile.image;

            // Profile (PDF Sidebar)
            document.getElementById('sidebar-img').src = data.profile.image;
            document.getElementById('sidebar-name').textContent = data.profile.name;
            document.getElementById('sidebar-role').textContent = data.profile.role;
            document.getElementById('sidebar-email').textContent = data.profile.email;
            document.getElementById('sidebar-phone').textContent = data.profile.phone;
            document.getElementById('sidebar-location').textContent = data.profile.location;
            document.getElementById('sidebar-linkedin').textContent = data.profile.linkedin;

            // PDF Contact (Legacy)
            const contactHTML = `
                <i class="fas fa-envelope"></i> ${data.profile.email} &nbsp;|&nbsp; 
                <i class="fab fa-linkedin"></i> ${data.profile.linkedin} &nbsp;|&nbsp; 
                <i class="fas fa-phone"></i> ${data.profile.phone}
            `;
            document.getElementById('pdf-contact-text').innerHTML = contactHTML;

            // Footer Contact
            document.getElementById('footer-email').textContent = data.profile.email;
            document.getElementById('footer-phone').textContent = data.profile.phone;
            document.getElementById('footer-location').textContent = data.profile.location;

            // About
            const aboutContainer = document.getElementById('about-content');
            const readMoreBtn = document.getElementById('read-more-btn');
            aboutContainer.innerHTML = marked.parse(data.about);

            setTimeout(() => {
                if (aboutContainer.scrollHeight > aboutContainer.clientHeight) {
                    readMoreBtn.style.display = 'inline-block';
                }
            }, 0);

            readMoreBtn.addEventListener('click', () => {
                aboutContainer.classList.toggle('line-clamp');
                readMoreBtn.textContent = aboutContainer.classList.contains('line-clamp') ? 'Read More' : 'Read Less';
            });

            // Skills
            const skillsContainer = document.getElementById('skills-list');
            const sidebarSkills = document.getElementById('sidebar-skills');
            skillsContainer.innerHTML = '';
            sidebarSkills.innerHTML = '';

            if (data.skills) {
                data.skills.forEach(skill => {
                    // Web
                    const span = document.createElement('span');
                    span.innerHTML = `<i class="${skill.icon}"></i> ${skill.name}`;
                    skillsContainer.appendChild(span);
                    // Sidebar
                    const sideSpan = document.createElement('span');
                    sideSpan.innerHTML = skill.name;
                    sidebarSkills.appendChild(sideSpan);
                });
            }

            // Experience
            const expContainer = document.getElementById('experience-list');
            data.experience.forEach(item => {
                const description = marked.parse(item.desc);
                const html = `
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-date">${item.date}</div>
                        <div class="timeline-content">
                            <div class="timeline-header">
                                <img src="${item.logo}" alt="Logo" class="company-logo" onerror="this.style.display='none'">
                                <div>
                                    <h3>${item.role}</h3>
                                    <h4>${item.company}</h4>
                                </div>
                            </div>
                            <p class="markdown-content">${description}</p>
                        </div>
                    </div>
                `;
                expContainer.innerHTML += html;
            });

            // Certifications
            const certContainer = document.getElementById('cert-list');
            if (certContainer && data.certifications) {
                data.certifications.forEach(cert => {
                    const html = `
                        <a href="${cert.link}" target="_blank" class="cert-card">
                            <h3>${cert.title}</h3>
                            <div class="cert-img-wrapper">
                                <img src="${cert.image}" alt="${cert.title}" onerror="this.src='https://via.placeholder.com/100?text=Badge'">
                            </div>
                            <div class="cert-info">
                                <p>${cert.issuer}</p>
                                <span class="verify-btn">Verify <i class="fas fa-external-link-alt"></i></span>
                            </div>
                        </a>
                    `;
                    certContainer.innerHTML += html;
                });
            }

            // Projects
            const projectContainer = document.getElementById('project-list');
            if (projectContainer && data.projects) {
                data.projects.forEach(project => {
                    const descHTML = project.desc ? `<div class="project-desc">${marked.parse(project.desc)}</div>` : '';
                    const html = `
                        <div class="project-card">
                            <h3>${project.title}</h3>
                            ${descHTML}
                            <a href="${project.repo}" target="_blank" class="repo-btn">
                                <i class="fab fa-github"></i> View Repository
                            </a>
                        </div>
                    `;
                    projectContainer.innerHTML += html;
                });
            }

            // Education
            const eduContainer = document.getElementById('education-list');
            if (data.education) {
                data.education.forEach(item => {
                    const html = `
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-date">${item.date}</div>
                            <div class="timeline-content">
                                <div class="timeline-header">
                                    <img src="${item.logo}" alt="Logo" class="company-logo" onerror="this.style.display='none'">
                                    <div>
                                        <h3>${item.degree}</h3>
                                        <h4>${item.school}</h4>
                                    </div>
                                </div>
                                <p class="markdown-content">${item.desc}</p>
                            </div>
                        </div>
                    `;
                    eduContainer.innerHTML += html;
                });
            }

            // Languages
            const footerLangContainer = document.getElementById('footer-languages');
            const sidebarLangContainer = document.getElementById('sidebar-languages');
            if (data.languages) {
                let langHTML = '';
                data.languages.forEach(lang => {
                    langHTML += `
                        <div class="lang-row">
                            <i class="fi fi-${lang.countryCode}"></i>
                            <span>${lang.name} (${lang.level})</span>
                        </div>`;
                });
                if (footerLangContainer) footerLangContainer.innerHTML = langHTML;
                if (sidebarLangContainer) sidebarLangContainer.innerHTML = langHTML;
            }

            // Videos
            const videoContainer = document.getElementById('video-list');
            if (data.videos) {
                data.videos.forEach((video, index) => {
                    const descId = `video-desc-${index}`;
                    const btnId = `video-btn-${index}`;
                    const html = `
                        <div class="video-wrapper">
                            <h3>${video.title}</h3>
                            <div class="video-container web-video">
                                <iframe src="https://www.youtube.com/embed/${video.id}" title="${video.title}" frameborder="0" allowfullscreen></iframe>
                            </div>
                            <div id="${descId}" class="markdown-content line-clamp video-desc">
                                ${marked.parse(video.desc)}
                            </div>
                            <button id="${btnId}" class="read-more-btn">Read More</button>
                            <div class="pdf-video-link" style="display: none;">
                                <p><strong>Watch Video:</strong> <a href="https://youtu.be/${video.id}">https://youtu.be/${video.id}</a></p>
                            </div>
                        </div>
                    `;
                    videoContainer.innerHTML += html;

                    setTimeout(() => {
                        const descEl = document.getElementById(descId);
                        const btnEl = document.getElementById(btnId);
                        if (descEl && descEl.scrollHeight > descEl.clientHeight) {
                            btnEl.style.display = 'inline-block';
                        }
                        if (btnEl) {
                            btnEl.addEventListener('click', () => {
                                descEl.classList.toggle('line-clamp');
                                btnEl.textContent = descEl.classList.contains('line-clamp') ? 'Read More' : 'Read Less';
                            });
                        }
                    }, 0);
                });
            }
        })
        .catch(err => console.error('Error loading YAML:', err));

    // --- 2. LINKING THE PDF FUNCTION 

    // --- LINK THE PDF FUNCTION ---
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        // We use an arrow function to call the function from the other file
        downloadBtn.addEventListener('click', () => {
             // Check if generate_pdf.js is loaded
             if (typeof downloadPDF === "function") {
                 downloadPDF();
             } else {
                 alert("PDF Generator is still loading, please wait...");
             }
        });
    }
});

// --- 3. NAVIGATION ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});