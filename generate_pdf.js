/**
 * FINAL PDF GENERATOR
 * 1. Uses 'path' from YAML for local certification images.
 * 2. Converts local images to Base64 to ensure PDF rendering.
 * 3. Preserves all layout fixes (Padding, Full Bleed, Sidebar spacing).
 */
async function downloadPDF() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';

    try {
        const response = await fetch('data.yaml');
        const text = await response.text();
        const data = jsyaml.load(text);

        // --- 1. IMAGE LOADER HELPER ---
        // Converts a path (local or remote) to a Base64 string.
        // This is crucial for html2canvas to render images reliably.
        const getDataUrl = (url) => {
            return new Promise((resolve) => {
                const img = new Image();
                // 'anonymous' is fine for local files served via http-server
                img.crossOrigin = "Anonymous"; 
                img.src = url;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    try {
                        resolve(canvas.toDataURL('image/png'));
                    } catch (err) {
                        console.warn("Error converting image:", url);
                        resolve(null);
                    }
                };
                // If local image is missing, return null to show icon
                img.onerror = () => {
                    console.warn("Could not load image at:", url);
                    resolve(null); 
                };
            });
        };

        // --- 2. PRE-PROCESS CERTIFICATIONS ---
        let certsHTML = '';
        if (data.certifications) {
            const certPromises = data.certifications.map(async (cert) => {
                
                // CHANGE: We now look for 'cert.path' instead of 'cert.image'
                // Ensure your YAML has: path: "images/my-cert.png"
                const imagePath = cert.path || cert.image; 
                const base64Img = await getDataUrl(imagePath);
                
                // Fallback: If image fails, show Trophy Icon
                const imgContent = base64Img 
                    ? `<img src="${base64Img}" style="width: 100%; height: 100%; object-fit: contain;">`
                    : `<i class="fas fa-trophy" style="font-size: 20px; color: #264886;"></i>`;

                return `
                    <div style="display: flex; align-items: center; margin-bottom: 15px; page-break-inside: avoid;">
                        <div style="width: 50px; height: 50px; margin-right: 12px; flex-shrink: 0; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 2px;">
                            ${imgContent}
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <a href="${cert.link}" target="_blank" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 12px; display: block; line-height: 1.2; margin-bottom: 3px;">${cert.title}</a>
                            <div style="color: #d1d5db; font-size: 11px; opacity: 0.8;">${cert.issuer}</div>
                        </div>
                    </div>`;
            });
            certsHTML = (await Promise.all(certPromises)).join('');
        }

        const pdfContainer = document.createElement('div');
        pdfContainer.id = 'pdf-temp-template';
        pdfContainer.style.width = '800px'; 
        pdfContainer.style.background = '#ffffff';

        const parseMd = (txt) => typeof marked !== 'undefined' ? marked.parse(txt || '') : txt;

        const color = {
            blue: "#264886",    
            dark: "#1a1a1a",    
            white: "#ffffff",
            textMain: "#333333",
            textLight: "#d1d5db"
        };

        const noSplit = "page-break-inside: avoid; break-inside: avoid;";

        pdfContainer.innerHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; display: flex; width: 100%; min-height: 1000px; color: ${color.textMain};">
                
                <div style="width: 35%; background-color: ${color.dark}; color: ${color.white}; padding: 50px 20px; box-sizing: border-box; text-align: center;">
                    
                    <div style="margin-bottom: 30px; ${noSplit} display: flex; justify-content: center;">
                        <img src="${data.profile.image}" crossorigin="anonymous" style="width: 140px; height: 140px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.1); object-fit: cover;">
                    </div>

                    <div style="text-align: left; margin-bottom: 30px; padding: 0 10px; ${noSplit}">
                        <h3 style="border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-bottom: 15px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Contact</h3>
                        
                        <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                            <div style="width: 25px; margin-right: 10px; text-align: center; color: ${color.blue};"><i class="fas fa-phone"></i></div>
                            <div style="font-size: 13px; color: ${color.textLight}; word-break: break-all;">${data.profile.phone}</div>
                        </div>

                        <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                            <div style="width: 25px; margin-right: 10px; text-align: center; color: ${color.blue};"><i class="fas fa-envelope"></i></div>
                            <div style="font-size: 13px; color: ${color.textLight}; word-break: break-all;">${data.profile.email}</div>
                        </div>

                        ${data.profile.website ? `
                        <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                            <div style="width: 25px; margin-right: 10px; text-align: center; color: ${color.blue};"><i class="fa-solid fa-globe"></i></div>
                            <div style="font-size: 13px; color: ${color.textLight};">
                                <a href="${data.profile.website}" target="_blank" style="color: ${color.textLight}; text-decoration: none;">
                                    ${data.profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                </a>
                            </div>
                        </div>` : ''}

                        <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                            <div style="width: 25px; margin-right: 10px; text-align: center; color: ${color.blue};"><i class="fas fa-map-marker-alt"></i></div>
                            <div style="font-size: 13px; color: ${color.textLight};">${data.profile.location}</div>
                        </div>

                        <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                            <div style="width: 25px; margin-right: 10px; text-align: center; color: ${color.blue};"><i class="fab fa-linkedin"></i></div>
                            <div style="font-size: 13px; color: ${color.textLight};">
                                <a href="${data.profile.linkedin}" style="color: ${color.textLight}; text-decoration: none;">Marian Bodnar</a>
                            </div>
                        </div>
                    </div>

                    ${data.languages ? `
                    <div style="text-align: left; margin-bottom: 30px; padding: 0 10px; ${noSplit}">
                         <h3 style="border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-bottom: 15px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Languages</h3>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px; color: ${color.textLight};">
                            ${data.languages.map(lang => `
                                <li style="margin-bottom: 8px; display: flex; justify-content: space-between;">
                                    <span>${lang.name}</span>
                                    <span style="opacity: 0.7; font-style: italic;">${lang.level}</span>
                                </li>`).join('')}
                        </ul>
                    </div>` : ''}

                    ${data.skills ? `
                    <div style="text-align: left; margin-bottom: 30px; padding: 0 10px;">
                        <h3 style="border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-bottom: 15px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Skills</h3>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px; color: ${color.textLight};">
                            ${data.skills.map(skill => `<li style="margin-bottom: 6px; ${noSplit}">• ${skill.name}</li>`).join('')}
                        </ul>
                    </div>` : ''}

                    ${data.certifications ? `
                    <div style="text-align: left; margin-bottom: 30px; padding: 0 10px; ${noSplit}">
                        <h3 style="border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-bottom: 15px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Certifications</h3>
                        ${certsHTML}
                    </div>` : ''}

                </div>

                <div style="width: 65%; background-color: ${color.white}; padding-bottom: 50px;">
                    
                    <div style="background-color: ${color.blue}; padding: 50px 40px 30px 40px; box-sizing: border-box; ${noSplit}">
                        <h1 style="margin: 0; font-size: 38px; text-transform: uppercase; color: ${color.white}; line-height: 1; font-weight: bold;">
                            ${data.profile.name}
                        </h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; color: ${color.white}; opacity: 0.9; letter-spacing: 2px; text-transform: uppercase;">${data.profile.role}</p>
                    </div>

                    <div style="padding: 30px 40px 0 40px;">
                        
                        <div style="margin-bottom: 30px; ${noSplit}">
                            <h3 style="color: ${color.textMain}; font-size: 18px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase;">About Me</h3>
                            <div style="font-size: 13px; color: #4a5568; text-align: justify; line-height: 1.6;">
                                ${parseMd(data.about)}
                            </div>
                        </div>

                        <div style="margin-bottom: 10px;">
                            <div style="background-color: ${color.blue}; color: ${color.white}; padding: 6px 25px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; ${noSplit}">
                                Experience
                            </div>
                            
                            ${data.experience.map(job => `
                                <div style="margin-bottom: 25px; ${noSplit}">
                                    <div style="font-weight: bold; font-size: 15px; color: ${color.textMain};">${job.company}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                        <div style="font-size: 13px; font-weight: bold; color: ${color.textMain};">${job.role}</div>
                                        <div style="font-size: 12px; color: #718096; font-style: italic;">${job.date}</div>
                                    </div>
                                    <div style="font-size: 13px; color: #4a5568; text-align: justify; line-height: 1.4;">
                                        ${parseMd(job.desc)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div style="margin-bottom: 10px;">
                            <div style="background-color: ${color.blue}; color: ${color.white}; padding: 6px 25px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; ${noSplit}">
                                Education
                            </div>
                            
                            ${data.education ? data.education.map(edu => `
                                <div style="margin-bottom: 20px; ${noSplit}">
                                    <div style="font-weight: bold; font-size: 14px; color: ${color.textMain};">${edu.school}</div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <div style="font-size: 13px; color: ${color.textMain};">${edu.degree}</div>
                                        <div style="font-size: 12px; color: #718096;">${edu.date}</div>
                                    </div>
                                </div>
                            `).join('') : ''}
                        </div>

                         ${data.projects ? `
                        <div style="margin-bottom: 10px;">
                            <div style="background-color: ${color.blue}; color: ${color.white}; padding: 6px 25px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; ${noSplit}">
                                Projects
                            </div>
                            ${data.projects.map(proj => `
                                <div style="margin-bottom: 15px; ${noSplit}">
                                    <div style="font-weight: bold; color: ${color.textMain}; font-size: 14px;">${proj.title}</div>
                                    <div style="font-size: 13px; color: #4a5568; margin-bottom: 2px;">${parseMd(proj.desc)}</div>
                                    <a href="${proj.repo}" style="color: ${color.blue}; font-size: 12px;">View Code</a>
                                </div>
                            `).join('')}
                        </div>` : ''}

                        ${data.videos ? `
                        <div style="margin-bottom: 10px;">
                            <div style="background-color: ${color.blue}; color: ${color.white}; padding: 6px 25px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; ${noSplit}">
                                Demos
                            </div>
                            ${data.videos.map(video => `
                                <div style="margin-bottom: 15px; ${noSplit}">
                                    <div style="font-weight: bold; color: ${color.textMain}; font-size: 14px;">${video.title}</div>
                                    <div style="font-size: 13px; color: #4a5568; margin-bottom: 4px; text-align: justify; line-height: 1.4;">
                                        ${parseMd(video.desc)}
                                    </div>
                                    <a href="https://youtu.be/${video.id}" target="_blank" style="color: ${color.blue}; font-size: 12px; text-decoration: none; display: flex; align-items: center;">
                                        <i class="fab fa-youtube" style="margin-right: 5px;"></i> Watch Video
                                    </a>
                                </div>
                            `).join('')}
                        </div>` : ''}

                    </div>
                </div>
            </div>
        `;

        const opt = {
            margin: 0, 
            filename: `${data.profile.name.replace(/\s+/g, '_')}_Resume.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(pdfContainer).save();

    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("Error generating PDF. Check console.");
    } finally {
        if (loading) loading.style.display = 'none';
    }
}