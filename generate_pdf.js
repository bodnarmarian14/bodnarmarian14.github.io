/**
 * GENERATE PDF FUNCTION
 * Creates a clean, link-rich PDF with a sidebar that matches your navbar.
 */
async function downloadPDF() {
    // --- CONFIGURATION ---
    // Replace this with the exact background color of your website's Navbar
    // Example: '#000000', '#1a1a1a', '#0d1117', etc.
    const sidebarColor = "#1a1a1a"; 

    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';

    try {
        const response = await fetch('data.yaml');
        const text = await response.text();
        const data = jsyaml.load(text);

        const pdfContainer = document.createElement('div');
        pdfContainer.id = 'pdf-temp-template';
        pdfContainer.style.width = '100%';
        pdfContainer.style.background = '#ffffff';
        
        // Helper function to safely parse Markdown
        const parseMd = (txt) => typeof marked !== 'undefined' ? marked.parse(txt || '') : txt;

        pdfContainer.innerHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.5;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 32%; background-color: ${sidebarColor}; color: #ffffff; vertical-align: top; padding: 30px 20px;">
                            
                            <div style="text-align: center; margin-bottom: 30px;">
                                <img src="${data.profile.image}" style="width: 140px; height: 140px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.2); object-fit: cover; display: block; margin: 0 auto;">
                            </div>

                            <div style="margin-bottom: 30px;">
                                <h3 style="border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; color: #ffffff; font-size: 16px; text-transform: uppercase; margin-bottom: 15px;">Contact</h3>
                                <div style="font-size: 13px; color: #e0e0e0;">
                                    <div style="margin-bottom: 12px;">
                                        <strong style="color: #fff; display: block;">Phone</strong>
                                        ${data.profile.phone}
                                    </div>
                                    <div style="margin-bottom: 12px;">
                                        <strong style="color: #fff; display: block;">Email</strong>
                                        ${data.profile.email}
                                    </div>
                                    <div style="margin-bottom: 12px;">
                                        <strong style="color: #fff; display: block;">Address</strong>
                                        ${data.profile.location}
                                    </div>
                                    <div style="margin-bottom: 12px;">
                                        <strong style="color: #fff; display: block;">LinkedIn</strong>
                                        <a href="${data.profile.linkedin}" style="color: #63b3ed; text-decoration: none;">View Profile</a>
                                    </div>
                                </div>
                            </div>

                            <div style="margin-bottom: 30px;">
                                <h3 style="border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; color: #ffffff; font-size: 16px; text-transform: uppercase; margin-bottom: 15px;">Skills</h3>
                                <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px; color: #e0e0e0;">
                                    ${data.skills ? data.skills.map(skill => `<li style="margin-bottom: 6px;">• ${skill.name}</li>`).join('') : ''}
                                </ul>
                            </div>

                            <div style="margin-bottom: 30px;">
                                <h3 style="border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; color: #ffffff; font-size: 16px; text-transform: uppercase; margin-bottom: 15px;">Languages</h3>
                                <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px; color: #e0e0e0;">
                                    ${data.languages ? data.languages.map(lang => `<li style="margin-bottom: 6px;">• ${lang.name} (${lang.level})</li>`).join('') : ''}
                                </ul>
                            </div>
                        </td>

                        <td style="width: 68%; background-color: #ffffff; vertical-align: top; padding: 40px 30px;">
                            
                            <div style="margin-bottom: 40px;">
                                <h1 style="margin: 0; font-size: 38px; text-transform: uppercase; color: #2d3748; line-height: 1;">${data.profile.name}</h1>
                                <p style="margin: 5px 0 0 0; font-size: 18px; text-transform: uppercase; color: ${sidebarColor}; letter-spacing: 2px;">${data.profile.role}</p>
                            </div>

                            <div style="margin-bottom: 30px;">
                                <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; font-size: 18px; text-transform: uppercase; margin-bottom: 15px;">Profile</h3>
                                <div style="font-size: 13px; color: #4a5568; text-align: justify;">
                                    ${parseMd(data.about)}
                                </div>
                            </div>

                            <div style="margin-bottom: 30px;">
                                <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; font-size: 18px; text-transform: uppercase; margin-bottom: 15px;">Experience</h3>
                                ${data.experience.map(job => `
                                    <div style="margin-bottom: 20px; page-break-inside: avoid;">
                                        <div style="display: flex; margin-bottom: 5px;">
                                            <div style="width: 120px; font-weight: bold; font-size: 12px; color: #718096; padding-top: 2px;">
                                                ${job.date}
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="font-weight: bold; font-size: 15px; color: #2d3748;">${job.role}</div>
                                                <div style="font-size: 13px; color: #718096; margin-bottom: 5px; font-style: italic;">${job.company}</div>
                                                <div style="font-size: 13px; color: #4a5568; text-align: justify;">
                                                    ${parseMd(job.desc)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <div style="margin-bottom: 30px;">
                                <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; font-size: 18px; text-transform: uppercase; margin-bottom: 15px;">Education</h3>
                                ${data.education ? data.education.map(edu => `
                                    <div style="margin-bottom: 15px; page-break-inside: avoid;">
                                        <div style="display: flex;">
                                            <div style="width: 120px; font-weight: bold; font-size: 12px; color: #718096; padding-top: 2px;">
                                                ${edu.date}
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="font-weight: bold; font-size: 14px; color: #2d3748;">${edu.degree}</div>
                                                <div style="font-size: 13px; color: #718096;">${edu.school}</div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('') : ''}
                            </div>

                            ${data.certifications ? `
                            <div style="margin-bottom: 30px;">
                                <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; font-size: 18px; text-transform: uppercase; margin-bottom: 15px;">Certifications</h3>
                                <div style="font-size: 13px; color: #4a5568;">
                                    ${data.certifications.map(cert => `
                                        <div style="margin-bottom: 8px; page-break-inside: avoid;">
                                            <strong><a href="${cert.link}" target="_blank" style="color: ${sidebarColor}; text-decoration: none;">${cert.title}</a></strong>
                                            <span style="color: #718096;"> — ${cert.issuer}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>` : ''}

                            ${data.projects ? `
                            <div style="margin-bottom: 30px;">
                                <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; font-size: 18px; text-transform: uppercase; margin-bottom: 15px;">Projects</h3>
                                <div style="font-size: 13px; color: #4a5568;">
                                    ${data.projects.map(proj => `
                                        <div style="margin-bottom: 12px; page-break-inside: avoid;">
                                            <div style="font-weight: bold; color: #2d3748;">${proj.title}</div>
                                            <div style="margin-bottom: 4px;">${parseMd(proj.desc)}</div>
                                            <a href="${proj.repo}" target="_blank" style="color: ${sidebarColor}; text-decoration: underline; font-size: 12px;">View Repository</a>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>` : ''}

                            ${data.videos ? `
                            <div style="margin-bottom: 30px;">
                                <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; font-size: 18px; text-transform: uppercase; margin-bottom: 15px;">Demos</h3>
                                <div style="font-size: 13px; color: #4a5568;">
                                    ${data.videos.map(video => `
                                        <div style="margin-bottom: 10px; page-break-inside: avoid;">
                                            <div style="font-weight: bold; color: #2d3748;">${video.title}</div>
                                            <a href="https://youtu.be/${video.id}" target="_blank" style="color: ${sidebarColor}; text-decoration: underline; font-size: 12px;">Watch Video (YouTube)</a>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>` : ''}

                        </td>
                    </tr>
                </table>
            </div>
        `;

        const opt = {
            margin: 0, 
            filename: `${data.profile.name.replace(/\s+/g, '_')}_CV.pdf`,
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