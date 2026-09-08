/* ============================================================
   NEUROPSYCARE - JAVASCRIPT PRINCIPAL
   Funcionalidades: Navegación móvil, Acordeones de blog,
   Búsqueda, Newsletter con Brevo, Carga de artículos desde JSON,
   Últimas publicaciones en Inicio, Artículo completo, FAQ
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initFaqAccordion();
    initBlogSystem();
    initNewsletterForm();
    initSmoothScroll();
    initLatestPublications();
    initArticlePage();
});

/* ========== NAVEGACIÓN MÓVIL ========== */
function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.getElementById('nav-list');
    
    if (!navToggle || !navList) return;
    
    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navList.classList.toggle('nav-open');
        document.body.style.overflow = isExpanded ? '' : 'hidden';
    });
    
    navList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navList.classList.remove('nav-open');
            document.body.style.overflow = '';
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navList.classList.contains('nav-open')) {
            navToggle.setAttribute('aria-expanded', 'false');
            navList.classList.remove('nav-open');
            document.body.style.overflow = '';
            navToggle.focus();
        }
    });
}

/* ========== ACORDEÓN FAQ ========== */
function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            const answerId = question.getAttribute('aria-controls');
            const answer = document.getElementById(answerId);
            
            faqQuestions.forEach(q => {
                if (q !== question) {
                    q.setAttribute('aria-expanded', 'false');
                    const otherAnswerId = q.getAttribute('aria-controls');
                    const otherAnswer = document.getElementById(otherAnswerId);
                    if (otherAnswer) otherAnswer.setAttribute('hidden', '');
                }
            });
            
            question.setAttribute('aria-expanded', !isExpanded);
            if (isExpanded) {
                answer?.setAttribute('hidden', '');
            } else {
                answer?.removeAttribute('hidden');
                setTimeout(() => {
                    answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        });
    });
}

/* ========== CONVERSIÓN DE CURSIVA ========== */
function convertItalic(text) {
    if (!text) return '';
    // Convierte *texto* a <em>texto</em>
    return text.replace(/\*(.+?)\*/g, '<em>$1</em>');
}

/* ========== CARGA DE PUBLICACIONES DESDE JSON ========== */
let publicationsData = [];

async function fetchPublications() {
    try {
        const response = await fetch('json/publicaciones.json');
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.warn('No se pudo cargar json/publicaciones.json:', error);
        return [];
    }
}

/* ========== SISTEMA DE BLOG ========== */
async function initBlogSystem() {
    const blogCategories = document.querySelector('.blog-categories');
    if (!blogCategories) return;
    
    publicationsData = await fetchPublications();
    
    // Acordeón de categorías
    const categoryHeaders = document.querySelectorAll('.blog-category-header');
    categoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', !isExpanded);
            const contentId = header.getAttribute('aria-controls');
            const content = document.getElementById(contentId);
            if (content) {
                content.classList.toggle('open');
            }
        });
    });
    
    // Acordeón de subcategorías
    const subcategoryHeaders = document.querySelectorAll('.blog-subcategory-header');
    subcategoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', !isExpanded);
            const contentId = header.getAttribute('aria-controls');
            const content = document.getElementById(contentId);
            if (content) {
                content.classList.toggle('open');
            }
        });
    });
    
    // Cargar artículos en cada categoría
    renderCategory('neuropsicologia', 'data-grid-neuropsicologia');
    renderCategory('neurociencias', 'data-grid-neurociencias');
    renderCategory('reflexiones', 'data-grid-reflexiones');
    renderCategory('recomendaciones', 'data-grid-recomendaciones');
    
    // Actualizar contador de Divulgación (suma de subcategorías)
    updateDivulgacionCount();
    
    // Búsqueda
    initBlogSearch();
    
    // Abrir categoría desde hash (botones de Inicio)
    openCategoryFromHash();
}

function renderCategory(category, gridSelector) {
    const grid = document.querySelector(`[${gridSelector}]`);
    if (!grid) return;
    
    const articles = publicationsData.filter(p => p.category === category);
    
    // Actualizar contador
    const countEl = document.querySelector(`[data-count-${category}]`);
    if (countEl) {
        countEl.textContent = `${articles.length} artículo${articles.length !== 1 ? 's' : ''}`;
    }
    
    if (articles.length === 0) {
        grid.innerHTML = '<p class="no-articles">Próximamente habrá publicaciones en esta sección.</p>';
        return;
    }
    
    grid.innerHTML = articles.map(article => createBlogCard(article)).join('');
}

function updateDivulgacionCount() {
    const neuropsicologia = publicationsData.filter(p => p.category === 'neuropsicologia').length;
    const neurociencias = publicationsData.filter(p => p.category === 'neurociencias').length;
    const total = neuropsicologia + neurociencias;
    
    const divulgacionCount = document.querySelector('[data-count-divulgacion]');
    if (divulgacionCount) {
        divulgacionCount.textContent = `${total} artículo${total !== 1 ? 's' : ''}`;
    }
}

function createBlogCard(article) {
    // Mostrar imagen de portada (imageUrl)
    const imageHtml = article.imageUrl 
        ? `<img src="${article.imageUrl}" alt="Imagen de portada del artículo">` 
        : '';

    return `
        <article class="blog-card">
            <div class="blog-card-image" aria-hidden="true">
                ${imageHtml}
                <span class="blog-card-category">${getCategoryLabel(article.category)}</span>
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <time datetime="${article.date}">${formatDate(article.date)}</time>
                    <span class="meta-divider"></span>
                    <span>${article.readTime || '5 min'} de lectura</span>
                </div>
                <h3 class="blog-card-title">
                    <a href="articulo.html?id=${article.id}">${article.title}</a>
                </h3>
                <p class="blog-card-excerpt">${convertItalic(article.excerpt)}</p>
                <div class="blog-card-tags">
                    ${(article.tags || []).map(tag => `<span>${tag}</span>`).join('')}
                </div>
                <div class="blog-card-footer">
                    <a href="articulo.html?id=${article.id}" class="blog-card-link" aria-label="Leer artículo: ${article.title}">
                        Leer más <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
        </article>
    `;
}

function initBlogSearch() {
    const searchInput = document.getElementById('blog-search-input');
    const searchResultsCount = document.getElementById('search-results-count');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            searchResultsCount.textContent = '';
            document.querySelectorAll('.blog-category, .blog-subcategory').forEach(el => {
                el.style.display = '';
            });
            return;
        }
        
        const results = publicationsData.filter(p => 
            p.title.toLowerCase().includes(query) ||
            p.excerpt.toLowerCase().includes(query) ||
            (p.content && p.content.toLowerCase().includes(query)) ||
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
        );
        
        searchResultsCount.textContent = `${results.length} resultado${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`;
        
        document.querySelectorAll('.blog-category').forEach(cat => {
            const catGrids = cat.querySelectorAll('.blog-grid');
            let hasResults = false;
            catGrids.forEach(grid => {
                const cards = grid.querySelectorAll('.blog-card');
                cards.forEach(card => {
                    const title = card.querySelector('.blog-card-title')?.textContent.toLowerCase() || '';
                    const excerpt = card.querySelector('.blog-card-excerpt')?.textContent.toLowerCase() || '';
                    if (title.includes(query) || excerpt.includes(query)) {
                        card.style.display = '';
                        hasResults = true;
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
            if (!hasResults) {
                cat.style.display = 'none';
            } else {
                cat.style.display = '';
                cat.querySelectorAll('.blog-subcategory').forEach(sub => {
                    const subCards = sub.querySelectorAll('.blog-card');
                    const visibleCards = Array.from(subCards).filter(card => card.style.display !== 'none');
                    if (visibleCards.length === 0) {
                        sub.style.display = 'none';
                    } else {
                        sub.style.display = '';
                    }
                });
            }
        });
    });
}

function openCategoryFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    
    setTimeout(() => {
        const target = document.getElementById(hash);
        if (target) {
            const header = target.querySelector('.blog-category-header');
            if (header) {
                header.setAttribute('aria-expanded', 'true');
                const content = document.getElementById(header.getAttribute('aria-controls'));
                if (content) content.classList.add('open');
            }
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 500);
}

/* ========== ÚLTIMAS PUBLICACIONES EN INICIO ========== */
async function initLatestPublications() {
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;
    
    publicationsData = await fetchPublications();
    
    const sorted = [...publicationsData].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sorted.slice(0, 3);
    
    if (latest.length === 0) return;
    
    const cards = servicesGrid.querySelectorAll('.service-card');
    
    cards.forEach((card, index) => {
        if (latest[index]) {
            const article = latest[index];
            card.querySelector('h3').textContent = article.title;
            card.querySelector('p').textContent = article.excerpt;
            card.querySelector('.service-link').href = `articulo.html?id=${article.id}`;
        }
    });
}

/* ========== PÁGINA DE ARTÍCULO ========== */
async function initArticlePage() {
    const articleTitle = document.getElementById('article-title');
    if (!articleTitle) return;
    
    publicationsData = await fetchPublications();
    
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');
    
    if (!articleId) {
        articleTitle.textContent = 'Artículo no encontrado';
        document.getElementById('article-content').innerHTML = '<p>No se ha especificado ningún artículo.</p>';
        return;
    }
    
    const article = publicationsData.find(p => String(p.id) === articleId);
    
    if (!article) {
        articleTitle.textContent = 'Artículo no encontrado';
        document.getElementById('article-content').innerHTML = '<p>El artículo que buscas no existe o ha sido eliminado.</p>';
        return;
    }
    
    // Título
    articleTitle.textContent = article.title;
    
    // Metadatos
    const metaEl = document.getElementById('article-meta');
    if (metaEl) {
        metaEl.innerHTML = `
            <time datetime="${article.date}">${formatDate(article.date)}</time>
            <span class="meta-divider"></span>
            <span>${getCategoryLabel(article.category)}</span>
            <span class="meta-divider"></span>
            <span>${article.readTime || '5 min'} de lectura</span>
        `;
    }
    
    // Imagen interior (innerImage)
    const imageEl = document.getElementById('article-image-sticky');
    if (imageEl) {
        if (article.innerImage) {
            imageEl.innerHTML = `<img src="${article.innerImage}" alt="Imagen de la publicación">`;
        } else if (article.imageUrl) {
            imageEl.innerHTML = `<img src="${article.imageUrl}" alt="Imagen de la publicación">`;
        } else {
            imageEl.style.display = 'none';
        }
    }
    
    // Contenido (con conversión de cursiva)
    const contentEl = document.getElementById('article-content');
    if (contentEl) {
        if (article.content) {
            const paragraphs = article.content.split('\n\n');
            contentEl.innerHTML = paragraphs.map(paragraph => `<p>${convertItalic(paragraph)}</p>`).join('');
        } else {
            contentEl.innerHTML = `<p>${convertItalic(article.excerpt)}</p>`;
        }
    }
    
    // Autor (dentro del cuadro de contenido)
    const authorEl = document.getElementById('article-author');
    if (authorEl) {
        authorEl.innerHTML = `<cite>${article.author || 'Corina C. Munteanu'}</cite>`;
    }
    
    // Bibliografía (con conversión de cursiva)
    const bibliographyEl = document.getElementById('bibliography-content');
    if (bibliographyEl) {
        if (article.bibliography) {
            bibliographyEl.innerHTML = convertItalic(article.bibliography).replace(/\n/g, '<br>');
        } else {
            bibliographyEl.textContent = 'No hay bibliografía disponible.';
        }
    }
    
    // Actualizar título de la página
    document.title = `${article.title} | Neuropsycare`;
}

/* ========== NEWSLETTER ========== */
function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (!newsletterForm) return;
    
    const emailInput = document.getElementById('newsletter-email');
    const errorEl = document.getElementById('newsletter-error');
    const successEl = document.getElementById('newsletter-success');
    
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (errorEl) errorEl.textContent = '';
        successEl?.setAttribute('hidden', '');
        
        const email = emailInput?.value.trim();
        
        if (!email) {
            if (errorEl) errorEl.textContent = 'Por favor, introduce tu email.';
            return;
        }
        
        if (!isValidEmail(email)) {
            if (errorEl) errorEl.textContent = 'Por favor, introduce un email válido.';
            return;
        }
        
        const submitBtn = newsletterForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
        }
        
        try {
            await fetch(newsletterForm.action, {
                method: 'POST',
                body: new FormData(newsletterForm),
                mode: 'no-cors'
            });
            
            newsletterForm.reset();
            successEl?.removeAttribute('hidden');
            
            setTimeout(() => {
                successEl?.setAttribute('hidden', '');
            }, 6000);
            
        } catch (error) {
            if (errorEl) errorEl.textContent = 'Error al suscribir. Inténtalo de nuevo.';
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Suscribirme';
            }
        }
    });
}

/* ========== SCROLL SUAVE ========== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    });
}

/* ========== FUNCIONES AUXILIARES ========== */
function getCategoryLabel(category) {
    const labels = {
        'neuropsicologia': 'Neuropsicología',
        'neurociencias': 'Neurociencias',
        'reflexiones': 'Reflexiones',
        'recomendaciones': 'Recomendaciones',
        'divulgacion-neuropsicologia': 'Neuropsicología',
        'divulgacion-neurociencias': 'Neurociencias'
    };
    return labels[category] || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ========== DETECCIÓN DE PÁGINA ========== */
console.log('🧠 Neuropsycare - JavaScript cargado correctamente');
console.log('📄 Página actual:', document.title);
