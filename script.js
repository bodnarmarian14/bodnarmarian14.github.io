// 1. LOAD DATA FROM JSON
document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // -- FILL PROFILE --
            document.getElementById('profile-name').textContent = data.profile.name;
            document.getElementById('profile-role').textContent = data.profile.role;
            
            // Fill PDF Contact Info
            const contactHTML = `
                <i class="fas fa-envelope"></i> ${data.profile.email} &nbsp;|&nbsp; 
                <i class="fab fa-linkedin"></i> ${data.profile.linkedin} &nbsp;|&nbsp; 
                <i class="fas fa-phone"></i> ${data.profile.phone}
            `;
            document.getElementById('pdf-contact-text').innerHTML = contactHTML;

            // Fill Footer Contact
            document.getElementById('footer-email').textContent = data.profile.email;
            document.getElementById('footer-phone').textContent = data.profile.phone;
            document.getElementById('footer-location').textContent = data.profile.location;

            // -- FILL ABOUT --
            document.getElementById('about-text').textContent = data.about;

            // -- FILL SKILLS --
            // Helper function to create skill tags
            const createTags = (skills, containerId) => {
                const container = document.getElementById(containerId);
                skills.forEach(skill => {
                    const span = document.createElement('span');
                    span.textContent = skill;
                    container.appendChild(span);
                });
            };
            createTags(data.skills.frontend, 'skills-frontend');
            createTags(data.skills.backend, 'skills-backend');

            // -- FILL TIMELINE --
            const timelineContainer = document.getElementById('timeline-list');
            data.experience.forEach(item => {
                const html = `
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-date">${item.date}</div>
                        <div class="timeline-content">
                            <h3>${item.role}</h3>
                            <h4>${item.company}</h4>
                            <p>${item.desc}</p>
                        </div>
                    </div>
                `;
                timelineContainer.innerHTML += html;
            });

        })
        .catch(err => console.error('Error loading JSON:', err));
});

// 2. PDF DOWNLOAD LOGIC (Kept same as before)
document.getElementById('downloadBtn').addEventListener('click', function () {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex';

    const element = document.getElementById('content-to-print');
    const opt = {
        margin:       [0.5, 0.5],
        filename:     'Marian_Bodnar_Portfolio.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    document.body.classList.add('generating-pdf');

    html2pdf().set(opt).from(element).save()
        .then(() => {
            document.body.classList.remove('generating-pdf');
            loading.style.display = 'none';
        })
        .catch((err) => {
            console.error(err);
            document.body.classList.remove('generating-pdf');
            loading.style.display = 'none';
            alert("Error generating PDF.");
        });
});

// 3. SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});