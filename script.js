document.addEventListener('DOMContentLoaded', () => {

    // Fetch the YAML file
    fetch('data.yaml')
        .then(response => response.text())
        .then(text => {
            // Parse YAML text into a JavaScript Object
            const data = jsyaml.load(text);

            const year = new Date().getFullYear();
            document.getElementById('year').textContent = year;
            document.getElementById('footer-name').textContent = data.profile.name;

            // -- PROFILE --
            document.getElementById('profile-name').textContent = data.profile.name;
            document.getElementById('profile-role').textContent = data.profile.role;
            document.getElementById('profile-img').src = data.profile.image;
            
            // PDF Contact
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

            // -- ABOUT SECTION LOGIC --
            const aboutContainer = document.getElementById('about-content');
            const readMoreBtn = document.getElementById('read-more-btn');

            // 1. Inject the Markdown content
            aboutContainer.innerHTML = marked.parse(data.about);

            // 2. Check if text exceeds 5 lines
            // We wait a tiny moment for the browser to render the styles
            setTimeout(() => {
                // If the full scrollable height is bigger than the visible height
                if (aboutContainer.scrollHeight > aboutContainer.clientHeight) {
                    readMoreBtn.style.display = 'inline-block';
                }
            }, 0);

            // 3. Add Click Event
            readMoreBtn.addEventListener('click', () => {
                // Toggle the class
                aboutContainer.classList.toggle('line-clamp');

                // Update Button Text
                if (aboutContainer.classList.contains('line-clamp')) {
                    readMoreBtn.textContent = 'Read More';
                } else {
                    readMoreBtn.textContent = 'Read Less';
                }
            });

            // -- SKILLS (Single List) --
            const skillsContainer = document.getElementById('skills-list');
            
            // Clear existing content just in case
            skillsContainer.innerHTML = '';

            // Loop through the single 'skills' array
            if (data.skills) {
                data.skills.forEach(skill => {
                    const span = document.createElement('span');
                    // Add Icon and Text
                    span.innerHTML = `<i class="${skill.icon}"></i> ${skill.name}`;
                    skillsContainer.appendChild(span);
                });
            }

            // -- EXPERIENCE (With Company Logos) --
            const expContainer = document.getElementById('experience-list');
            data.experience.forEach(item => {
                const html = `
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-date">${item.date}</div>
                        <div class="timeline-content">
                            <div class="job-header">
                                <img src="${item.logo}" alt="Logo" class="company-logo" onerror="this.style.display='none'">
                                <div>
                                    <h3>${item.role}</h3>
                                    <h4>${item.company}</h4>
                                </div>
                            </div>
                            <p class="multi-line-text">${item.desc}</p>
                        </div>
                    </div>
                `;
                expContainer.innerHTML += html;
            });

            // -- EDUCATION (New Section) --
            const eduContainer = document.getElementById('education-list');
            if (data.education) {
                data.education.forEach(item => {
                    const html = `
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-date">${item.date}</div>
                            <div class="timeline-content">
                                <h3>${item.degree}</h3>
                                <h4>${item.school}</h4>
                                <p>${item.desc}</p>
                            </div>
                        </div>
                    `;
                    eduContainer.innerHTML += html;
                });
            }
        })
        .catch(err => console.error('Error loading YAML:', err));
});

// -- PDF & SCROLL LOGIC (Same as before) --
document.getElementById('downloadBtn').addEventListener('click', function () {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex';
    document.body.classList.add('generating-pdf');

    const element = document.getElementById('content-to-print');
    const opt = {
        margin: [0.5, 0.5],
        filename: 'My_Portfolio.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save()
        .then(() => {
            document.body.classList.remove('generating-pdf');
            loading.style.display = 'none';
        })
        .catch((err) => {
            document.body.classList.remove('generating-pdf');
            loading.style.display = 'none';
        });
});

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