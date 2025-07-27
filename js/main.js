// Inizializzazione della scena 3D
function init3DScene() {
    // Verifica che Three.js sia caricato
    if (!window.THREE || !THREE.OrbitControls) {
        console.error('Three.js non è stato caricato correttamente');
        return;
    }
    
    const OrbitControls = THREE.OrbitControls;
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Dimensioni del canvas
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Creazione della scena
    const scene = new THREE.Scene();
    scene.background = null;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Luci
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Modello 3D (sfera con effetto wireframe)
    const geometry = new THREE.IcosahedronGeometry(1.5, 2);
    const material = new THREE.MeshPhongMaterial({
        color: 0x4f46e5,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
        shininess: 100
    });
    
    // Sfera principale
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Semplice sfera wireframe senza effetti aggiuntivi
    
    // Clock per l'animazione
    const clock = new THREE.Clock();

    // Controlli per la rotazione (disabilitati i controlli interattivi)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false; // Disabilita completamente la rotazione
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5; // Ridotta velocità di rotazione

    // Gestione del ridimensionamento della finestra
    window.addEventListener('resize', onWindowResize);
    
    function onWindowResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // Inizializzazione variabili per l'animazione
    let lastTime = performance.now();
    
    // Animazione
    function animate() {
        try {
            if (!scene || !camera || !renderer) {
                console.error('Scene, camera, or renderer not initialized');
                return;
            }
            
            requestAnimationFrame(animate);
            
            // Calcola il delta time in modo sicuro
            const now = performance.now();
            const deltaTime = Math.min((now - lastTime) / 1000, 0.1); // Limita a 100ms e converte in secondi
            lastTime = now;
            
            // Animazione sfera (rotazione lenta e costante)
            if (sphere) {
                sphere.rotation.x += 0.1 * deltaTime;
                sphere.rotation.y += 0.1 * deltaTime;
            }
            
            if (controls) controls.update();
            renderer.render(scene, camera);
        } catch (error) {
            console.error('Errore durante l\'animazione:', error);
        }
    }

    animate();
}

// Gestione dello scorrimento fluido
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Chiudi il menu mobile se aperto
                if (document.querySelector('.nav-links').classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });
}

// Gestione del menu mobile
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const bars = document.querySelectorAll('.menu-toggle .bar');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            
            // Animazione dell'icona hamburger
            if (menuToggle.classList.contains('active')) {
                bars[0].style.transform = 'translateY(9px) rotate(45deg)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'translateY(-9px) rotate(-45deg)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
        
        // Chiudi il menu quando si clicca su un link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            });
        });
    }
}

// Gestione del tema chiaro/scuro
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-checkbox');
    if (!themeToggle) return;
    
    // Controlla il tema salvato o preferenza del sistema
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Imposta lo stato inizale del toggle in base al tema
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark-theme');
        themeToggle.checked = true;
    }
    
    // Aggiorna l'icona del tema
    updateThemeIcon(themeToggle.checked);
    
    // Gestione del cambio tema
    themeToggle.addEventListener('change', (e) => {
        const isDark = e.target.checked;
        document.documentElement.classList.toggle('dark-theme', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
        
        // Aggiungi un'animazione al click
        const thumb = document.querySelector('.theme-toggle-thumb');
        if (thumb) {
            thumb.style.transform = isDark 
                ? 'translateX(31px) scale(1.1)' 
                : 'translateX(3px) scale(1.1)';
            
            setTimeout(() => {
                thumb.style.transform = isDark 
                    ? 'translateX(31px)' 
                    : 'translateX(3px)';
            }, 200);
        }
    });
    
    // Aggiungi effetto hover
    const themeToggleLabel = document.querySelector('.theme-toggle');
    if (themeToggleLabel) {
        themeToggleLabel.addEventListener('mouseenter', () => {
            const thumb = themeToggleLabel.querySelector('.theme-toggle-thumb');
            if (thumb) {
                thumb.style.transform = themeToggle.checked 
                    ? 'translateX(31px) scale(1.1)' 
                    : 'translateX(3px) scale(1.1)';
            }
        });
        
        themeToggleLabel.addEventListener('mouseleave', () => {
            const thumb = themeToggleLabel.querySelector('.theme-toggle-thumb');
            if (thumb) {
                thumb.style.transform = themeToggle.checked 
                    ? 'translateX(31px)' 
                    : 'translateX(3px)';
            }
        });
    }
    
    function updateThemeIcon(isDark) {
        // L'icona viene gestita dal CSS con le classi
        // Questa funzione è mantenuta per compatibilità
    }
}

// Animazioni al caricamento della pagina
function initAnimations() {
    // Aggiungi la classe 'loaded' al body dopo il caricamento
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
    
    // Animazione di apparizione degli elementi al caricamento
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.service-card, .portfolio-item, .form-group');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Applica le animazioni allo scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Esegui una prima volta all'avvio
    animateOnScroll();
}

// Gestione del form di contatto
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Qui puoi aggiungere la logica per l'invio del form
        // Ad esempio, utilizzando Fetch API per inviare i dati a un server
        
        // Esempio di feedback all'utente
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.textContent = 'Invio in corso...';
        submitButton.disabled = true;
        
        // Simulazione di invio
        setTimeout(() => {
            submitButton.textContent = 'Messaggio inviato!';
            contactForm.reset();
            
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 3000);
        }, 1500);
    });
}

// Inizializzazione della scena 3D per lo sfondo dei servizi
function initServices3DBackground() {
    const container = document.getElementById('services-3d-bg');
    if (!container) return;

    // Dimensioni del container
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Creazione della scena
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Aggiungi luci
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x4f46e5, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Crea geometrie 3D fluttuanti
    const geometries = [
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16),
        new THREE.OctahedronGeometry(1, 0)
    ];

    // Materiale trasparente
    const material = new THREE.MeshPhongMaterial({
        color: 0x4f46e5,
        transparent: true,
        opacity: 0.2,
        wireframe: true,
        shininess: 100,
        specular: 0x4f46e5
    });

    // Aggiungi oggetti 3D alla scena
    const objects = [];
    const count = 100; // Aumentato da 8 a 20 elementi
    
    // Aggiungi più tipi di geometrie
    const moreGeometries = [
        ...geometries,
        new THREE.TorusGeometry(0.6, 0.2, 16, 32),
        new THREE.ConeGeometry(0.8, 1.5, 6),
        new THREE.DodecahedronGeometry(1, 0),
        new THREE.TetrahedronGeometry(1, 0),
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16),
        new THREE.OctahedronGeometry(1, 0)
    ];
    
    for (let i = 0; i < count; i++) {
        const geometry = moreGeometries[Math.floor(Math.random() * moreGeometries.length)];
        const mesh = new THREE.Mesh(geometry, material.clone());
        
        // Aumenta l'area di spawn
        const spreadX = 60;
        const spreadY = 30;
        const spreadZ = 30;
        
        // Posizione casuale con distribuzione più ampia
        mesh.position.x = (Math.random() - 0.5) * spreadX * 2;
        mesh.position.y = (Math.random() - 0.5) * spreadY;
        mesh.position.z = (Math.random() - 0.5) * spreadZ - 10; // Sposta indietro per più profondità
        
        // Rotazione casuale
        mesh.rotation.x = Math.random() * Math.PI * 2;
        mesh.rotation.y = Math.random() * Math.PI * 2;
        
        // Scala casuale con più varietà
        const scale = 0.3 + Math.random() * 2.5;
        mesh.scale.set(scale, scale, scale);
        
        // Aggiungi animazione con più varietà
        const speed = 0.05 + Math.random() * 0.2;
        const rotationSpeed = 0.01 + Math.random() * 0.05;
        
        mesh.userData = {
            speed: speed,
            rotation: new THREE.Euler(
                (Math.random() - 0.5) * rotationSpeed,
                (Math.random() - 0.5) * rotationSpeed,
                (Math.random() - 0.5) * rotationSpeed
            ),
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 0.08,
                (Math.random() - 0.5) * 0.08,
                (Math.random() - 0.5) * 0.04
            ),
            initialPosition: mesh.position.clone(),
            timeOffset: Math.random() * Math.PI * 2
        };
        
        // Aggiungi un po' di colore casuale
        mesh.material.color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
        
        scene.add(mesh);
        objects.push(mesh);
    }

    // Posiziona la telecamera
    camera.position.z = 15;
    camera.lookAt(0, 0, 0);

    // Animazione
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;
        
        // Aggiorna la posizione e rotazione degli oggetti
        objects.forEach((obj, i) => {
            // Rotazione fluida
            obj.rotation.x += obj.userData.rotation.x;
            obj.rotation.y += obj.userData.rotation.y;
            obj.rotation.z += obj.userData.rotation.z;
            
            // Movimento fluttuante con onde sinusoidali
            const timeOffset = obj.userData.timeOffset;
            const floatSpeed = obj.userData.speed * 0.5;
            
            obj.position.x = obj.userData.initialPosition.x + Math.sin(time * 0.3 + timeOffset * 2) * 5;
            obj.position.y = obj.userData.initialPosition.y + Math.cos(time * 0.4 + timeOffset) * 3;
            
            // Movimento in avanti e indietro per la profondità
            obj.position.z = obj.userData.initialPosition.z + Math.sin(time * 0.2 + timeOffset * 1.5) * 10;
            
            // Piccole variazioni di scala per effetto pulsante
            const scaleVariation = 0.2;
            const scale = 1 + Math.sin(time * 0.5 + timeOffset) * scaleVariation * obj.userData.speed;
            obj.scale.set(scale, scale, scale);
            
            // Opacità variabile per profondità
            const depthFactor = (obj.position.z + 25) / 50; // Normalizza tra 0 e 1
            obj.material.opacity = 0.1 + depthFactor * 0.2; // Opacità tra 0.1 e 0.3
            
            // Cambia direzione se si avvicina troppo ai bordi
            if (Math.abs(obj.position.x - obj.userData.initialPosition.x) > 30) {
                obj.userData.initialPosition.x *= -0.9;
            }
            if (Math.abs(obj.position.y - obj.userData.initialPosition.y) > 15) {
                obj.userData.initialPosition.y *= -0.9;
            }
        });
        
        renderer.render(scene, camera);
    }
    
    // Gestisci il ridimensionamento della finestra
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
    
    animate();
}

// Inizializza il filtro del portfolio
function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    // Filtra i progetti in base alla categoria selezionata
    function filterProjects(category) {
        portfolioItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
                // Aggiungi animazione
                item.style.animation = 'fadeIn 0.5s ease forwards';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Gestisci il click sui pulsanti di filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Rimuovi la classe active da tutti i pulsanti
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Aggiungi la classe active al pulsante cliccato
            button.classList.add('active');
            // Filtra i progetti
            filterProjects(button.dataset.filter);
        });
    });
}

// Inizializza le anteprime dei progetti
function initPortfolioPreviews() {
    const previewButtons = document.querySelectorAll('.portfolio-preview-btn');
    const modal = document.getElementById('preview-modal');
    const closeModal = document.querySelector('.close-modal');
    const previewContent = document.getElementById('preview-content');
    
    // Dati delle anteprime (da personalizzare con i tuoi progetti)
    const previews = {
        'app-preview-1': {
            type: 'app',
            title: 'App Mobile',
            description: 'Un\'applicazione mobile innovativa con funzionalità avanzate.',
            content: `
                <h3>App Mobile</h3>
                <p>Un'applicazione mobile sviluppata con React Native per offrire un'esperienza utente fluida su entrambi i dispositivi iOS e Android.</p>
                <div class="preview-device">
                    <img src="https://via.placeholder.com/300x600/4f46e5/ffffff?text=App+Preview" alt="App Preview" class="preview-img">
                </div>
                <div class="preview-actions">
                    <a href="#" class="btn btn-primary"><i class="fas fa-download"></i> Scarica App</a>
                    <a href="#" class="btn btn-secondary"><i class="fas fa-code"></i> Codice Sorgente</a>
                </div>
            `
        },
        'app-preview-2': {
            type: 'app',
            title: 'App Produttività',
            description: 'Uno strumento di produttività per migliorare la tua efficienza.',
            content: `
                <h3>App Produttività</h3>
                <p>Un'applicazione per la gestione delle attività con funzionalità di pianificazione e tracciamento del tempo.</p>
                <div class="preview-device">
                    <img src="https://via.placeholder.com/300x600/3b82f6/ffffff?text=App+Preview" alt="Productivity App Preview" class="preview-img">
                </div>
                <div class="preview-actions">
                    <a href="#" class="btn btn-primary"><i class="fas fa-download"></i> Scarica App</a>
                    <a href="#" class="btn btn-secondary"><i class="fas fa-code"></i> Codice Sorgente</a>
                </div>
            `
        },
        'ux-gallery-1': {
            type: 'ux',
            title: 'UI/UX Design',
            description: 'Design di un\'interfaccia utente moderna e intuitiva.',
            content: `
                <h3>UI/UX Design</h3>
                <p>Una raccolta di schermate che mostrano il processo di progettazione dell'interfaccia utente.</p>
                <div class="preview-gallery">
                    <img src="https://via.placeholder.com/800x500/10b981/ffffff?text=UI+Design+1" alt="UI Design 1" class="preview-img">
                    <div class="gallery-thumbnails">
                        <img src="https://via.placeholder.com/100x60/10b981/ffffff?text=1" alt="Thumb 1" class="gallery-thumb active">
                        <img src="https://via.placeholder.com/100x60/10b981/ffffff?text=2" alt="Thumb 2" class="gallery-thumb">
                        <img src="https://via.placeholder.com/100x60/10b981/ffffff?text=3" alt="Thumb 3" class="gallery-thumb">
                    </div>
                </div>
                <div class="preview-actions">
                    <a href="#" class="btn btn-primary"><i class="fas fa-folder-open"></i> Vedi Tutti i Dettagli</a>
                </div>
            `
        },
        'ux-gallery-2': {
            type: 'ux',
            title: 'Mobile App Design',
            description: 'Design di un\'app mobile con attenzione all\'esperienza utente.',
            content: `
                <h3>Mobile App Design</h3>
                <p>Design di un'app mobile con un'interfaccia utente intuitiva e accattivante.</p>
                <div class="preview-gallery">
                    <img src="https://via.placeholder.com/800x500/10b981/ffffff?text=Mobile+App+Design" alt="Mobile App Design" class="preview-img">
                    <div class="gallery-thumbnails">
                        <img src="https://via.placeholder.com/100x60/10b981/ffffff?text=1" alt="Thumb 1" class="gallery-thumb active">
                        <img src="https://via.placeholder.com/100x60/10b981/ffffff?text=2" alt="Thumb 2" class="gallery-thumb">
                        <img src="https://via.placeholder.com/100x60/10b981/ffffff?text=3" alt="Thumb 3" class="gallery-thumb">
                    </div>
                </div>
                <div class="preview-actions">
                    <a href="#" class="btn btn-primary"><i class="fas fa-folder-open"></i> Vedi Tutti i Dettagli</a>
                </div>
            `
        }
    };
    
    // Apri il modal con l'anteprima
    function openPreview(previewId) {
        const preview = previews[previewId];
        if (!preview) return;
        
        previewContent.innerHTML = preview.content;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Disabilita lo scroll della pagina
        
        // Inizializza la galleria se presente
        initGallery();
    }
    
    // Inizializza la galleria delle anteprime
    function initGallery() {
        const galleryThumbs = document.querySelectorAll('.gallery-thumb');
        const mainImage = document.querySelector('.preview-gallery .preview-img');
        
        if (!galleryThumbs.length || !mainImage) return;
        
        galleryThumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Rimuovi la classe active da tutte le miniature
                galleryThumbs.forEach(t => t.classList.remove('active'));
                // Aggiungi la classe active alla miniatura cliccata
                thumb.classList.add('active');
                // Aggiorna l'immagine principale (qui puoi sostituire con l'URL dell'immagine reale)
                mainImage.src = thumb.src.replace('100x60', '800x500');
            });
        });
    }
    
    // Chiudi il modal
    function closePreview() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Riabilita lo scroll della pagina
    }
    
    // Gestisci il click sui pulsanti di anteprima
    previewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const previewId = button.dataset.preview || button.dataset.gallery;
            if (previewId) {
                openPreview(previewId);
            } else if (button.dataset.type === 'sito') {
                // I siti web si aprono in una nuova scheda (già gestito dal link)
                return;
            }
        });
    });
    
    // Chiudi il modal cliccando sulla X
    closeModal.addEventListener('click', closePreview);
    
    // Chiudi il modal cliccando fuori dal contenuto
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePreview();
        }
    });
    
    // Chiudi il modal con il tasto ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePreview();
        }
    });
}

// Inizializzazione di tutti i componenti
function init() {
    init3DScene();
    initSmoothScroll();
    initMobileMenu();
    initThemeToggle();
    initAnimations();
    initContactForm();
    initServices3DBackground();
    initPortfolioFilter();
    initPortfolioPreviews();
}

// Attendi che il DOM sia completamente caricato
document.addEventListener('DOMContentLoaded', init);
