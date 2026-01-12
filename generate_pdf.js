async function downloadPDF() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';

    try {
        // --- 1. DATA LOADING ---
        const response = await fetch('data.yaml');
        const text = await response.text();
        const data = jsyaml.load(text);

        // --- 2. IMAGE UTILS ---
        const getBase64Image = (url, isRound = false) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.setAttribute('crossOrigin', 'anonymous');
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const size = Math.min(img.width, img.height);
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext("2d");
                    if (isRound) {
                        ctx.beginPath();
                        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                        ctx.closePath();
                        ctx.clip();
                        const x = (img.width - size) / 2;
                        const y = (img.height - size) / 2;
                        ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
                    } else {
                        ctx.drawImage(img, 0, 0);
                    }
                    resolve(canvas.toDataURL("image/png"));
                };
                img.onerror = () => resolve(null);
                img.src = url;
            });
        };

        const profileImg = await getBase64Image(data.profile.image, true);
        const certImages = [];
        if (data.certifications) {
            for (const cert of data.certifications) {
                const path = cert.path || cert.image;
                if (path) certImages.push(await getBase64Image(path, false));
                else certImages.push(null);
            }
        }

        // --- 3. COLORS & ICONS ---
        const colors = {
            blue: '#264886',
            sidebar: '#2d2d2d',
            textWhite: '#ffffff',
            textGrey: '#c0c0c0',
            textDark: '#333333',
            divider: '#5a7ab0'
        };

        const icons = {
            phone: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
            email: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
            location: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            linkedin: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
            web: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'
        };

        // --- 4. COMPONENT BUILDERS ---

        const createPill = (text, type) => {
            const isSidebar = type === 'sidebar';
            const width = isSidebar ? 180 : 120; // Fixed width containers
            const height = 24;
            
            return {
                columns: [
                    {
                        width: width,
                        stack: [
                            {
                                // The Background Shape
                                canvas: [{
                                    type: 'rect', x: 0, y: 0, w: width, h: height, r: 12,
                                    color: isSidebar ? null : colors.blue,
                                    lineColor: isSidebar ? colors.divider : null,
                                    lineWidth: 1
                                }]
                            },
                            {
                                // The Text Overlay (Centered relative to pill width)
                                text: text.toUpperCase(),
                                color: 'white',
                                bold: true,
                                fontSize: 10,
                                alignment: 'center',
                                margin: [0, -18, 0, 0] // Pull text UP onto the shape
                            }
                        ]
                    }
                ],
                alignment: isSidebar ? 'center' : 'left',
                margin: [0, 25, 0, 15] 
            };
        };

        const iconRow = (path, textVal) => {
            if (!textVal) return null;
            return {
                columns: [
                    { width: 14, svg: `<svg viewBox="0 0 24 24"><path fill="${colors.blue}" d="${path}"/></svg>`, margin: [0, 2, 0, 0] },
                    { width: '*', text: textVal, fontSize: 10, color: colors.textGrey, margin: [6, 0, 0, 6] }
                ]
            };
        };

        // --- 5. LEFT COLUMN CONTENT ---
        const leftContent = [];
        
        if (profileImg) {
            // Added 10px margin top (plus global 40px = 50px visual space)
            leftContent.push({ image: profileImg, width: 130, height: 130, alignment: 'center', margin: [0, 10, 0, 25] });
        }

        leftContent.push(
            { text: 'About Me', style: 'h3_white', alignment: 'center' },
            { text: data.shortDesc, style: 'p_grey', alignment: 'center', margin: [10, 5, 10, 25] }
        );

        leftContent.push({
            stack: [
                iconRow(icons.phone, data.profile.phone),
                iconRow(icons.email, data.profile.email),
                iconRow(icons.location, data.profile.location),
                iconRow(icons.web, data.profile.website),
                iconRow(icons.linkedin, data.profile.linkedin ? "LinkedIn Profile" : null)
            ].filter(Boolean),
            margin: [10, 0, 10, 25]
        });

        if (data.languages) {
            leftContent.push(createPill('Language', 'sidebar'));
            leftContent.push({
                ul: data.languages.map(l => ({
                    text: [{ text: l.name, bold: true, color: 'white' }, { text: ` (${l.level})`, color: colors.textGrey }]
                })),
                style: 'list_style',
                margin: [25, 0, 10, 0]
            });
        }

        if (data.skills) {
            leftContent.push(createPill('Skills', 'sidebar'));
            leftContent.push({
                ul: data.skills.map(s => s.name),
                style: 'list_style',
                margin: [25, 0, 10, 0]
            });
        }

        if (data.certifications) {
            leftContent.push(createPill('Certifications', 'sidebar'));
            data.certifications.forEach((cert, i) => {
                const cImg = certImages[i];
                leftContent.push({
                    columns: [
                        { width: 25, stack: [ cImg ? { image: cImg, width: 20, height: 20 } : { text: '•', color: 'white'} ] },
                        { width: '*', text: cert.title, color: 'white', fontSize: 10, margin: [0, 2, 0, 10] }
                    ],
                    margin: [20, 0, 10, 0]
                });
            });
        }

        // --- 6. RIGHT COLUMN CONTENT ---
        const rightContent = [];

        // Header Text Block
        // We use margin [0, 20, 0, 70].
        // 20px Top = pushes text slightly down from the 40px page margin (aligns nicely in blue banner).
        // 70px Bottom = Ensures the NEXT element starts BELOW the 180px blue banner.
        rightContent.push({
            stack: [
                { text: data.profile.name.toUpperCase(), fontSize: 36, bold: true, color: 'white', letterSpacing: 1 },
                { text: data.profile.role.toUpperCase(), fontSize: 14, color: 'white', letterSpacing: 3, margin: [0, 5, 0, 0] }
            ],
            margin: [0, 20, 0, 70] 
        });

        if (data.experience) {
            rightContent.push(createPill('Experience', 'main'));
            data.experience.forEach(job => {
                rightContent.push({
                    stack: [
                        { text: job.company, fontSize: 14, bold: true, color: colors.textDark },
                        {
                            columns: [
                                { text: job.role, fontSize: 12, bold: true, width: '*' },
                                { text: job.date, fontSize: 11, italics: true, color: 'gray', alignment: 'right', width: 'auto' }
                            ]
                        },
                        { text: job.desc, fontSize: 11, color: '#555', margin: [0, 5, 0, 15], lineHeight: 1.4 }
                    ]
                });
            });
        }

        if (data.education) {
            rightContent.push(createPill('Education', 'main'));
            data.education.forEach(edu => {
                rightContent.push({
                    stack: [
                        { text: edu.school, fontSize: 13, bold: true, color: colors.textDark },
                        { text: edu.degree, fontSize: 12, margin: [0, 2, 0, 2] },
                        { text: edu.date, fontSize: 11, color: 'gray', italics: true }
                    ],
                    margin: [0, 0, 0, 10]
                });
            });
        }

        if (data.projects) {
            rightContent.push(createPill('Projects', 'main'));
            data.projects.forEach(proj => {
                 rightContent.push({
                    stack: [
                        { text: proj.title, fontSize: 13, bold: true, color: colors.textDark },
                        { text: proj.desc, fontSize: 11, color: '#555' },
                        { text: 'View Code', link: proj.repo, color: colors.blue, fontSize: 10, decoration: 'underline', margin: [0, 2, 0, 10]}
                    ]
                 });
            });
        }

        // --- 7. DOCUMENT DEFINITION ---
        const docDefinition = {
            pageSize: 'A4',
            
            // GLOBAL MARGINS (Top/Bottom 40px)
            // This ensures Page 2+ starts 40px down, and Page 1 ends 40px up.
            pageMargins: [0, 40, 0, 40], 
            
            // BACKGROUND LAYERS (Ignore Margins)
            background: function(currentPage, pageSize) {
                const bgs = [];
                // 1. Sidebar Background (All Pages)
                bgs.push({
                    type: 'rect', x: 0, y: 0, w: pageSize.width * 0.35, h: pageSize.height, color: colors.sidebar
                });

                // 2. Blue Header Banner (Page 1 Only)
                if (currentPage === 1) {
                    bgs.push({
                        type: 'rect', x: pageSize.width * 0.35, y: 0, w: pageSize.width * 0.65, h: 180, color: colors.blue
                    });
                }
                return { canvas: bgs };
            },

            content: [
                {
                    columns: [
                        // Left Column (Sidebar)
                        {
                            width: '35%',
                            stack: leftContent,
                            // Internal Left/Right Padding
                            margin: [15, 0, 15, 0] 
                        },
                        // Right Column (Main)
                        {
                            width: '65%',
                            stack: rightContent,
                            // Internal Left/Right Padding
                            margin: [40, 0, 40, 0] 
                        }
                    ]
                }
            ],
            
            styles: {
                h3_white: { fontSize: 16, color: 'white', margin: [0, 0, 0, 5], bold: true },
                p_grey: { fontSize: 11, color: colors.textGrey, lineHeight: 1.4 },
                list_style: { fontSize: 11, color: colors.textGrey, markerColor: colors.blue }
            },
            defaultStyle: { font: 'Roboto' }
        };

        pdfMake.createPdf(docDefinition).download(`${data.profile.name.replace(/\s+/g, '_')}_CV.pdf`);

    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("Error generating PDF. Check console.");
    } finally {
        if (loading) loading.style.display = 'none';
    }
}