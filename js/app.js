document.addEventListener('DOMContentLoaded', () => {
    initPortfolio();
    initLightbox();
});

// Render the portfolio grid
function initPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    renderGallery(portfolioData);

    const filterBtns = document.querySelectorAll('.filter-btn');
    if(filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.getAttribute('data-filter');
                
                if (category === 'all') {
                    renderGallery(portfolioData);
                } else {
                    const filtered = portfolioData.filter(item => item.category.toLowerCase() === category.toLowerCase());
                    renderGallery(filtered);
                }
            });
        });
    }
}

function renderGallery(data) {
    const grid = document.getElementById('portfolioGrid');
    grid.innerHTML = '';
    
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="gallery-overlay" onclick="openLightbox('${item.image}', '${item.title}')">
                <div class="overlay-text">
                    <h3>${item.title}</h3>
                    <p>${item.category}</p>
                </div>
            </div>
        `;
        grid.appendChild(div);
    });
}

// Lightbox logic
function initLightbox() {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <img class="lightbox-content" id="lightboxImg">
        <div id="lightboxCaption"></div>
    `;
    document.body.appendChild(lightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target !== document.getElementById('lightboxImg')) {
            lightbox.classList.remove('active');
            setTimeout(() => { lightbox.style.display = 'none'; }, 300);
        }
    });
}

window.openLightbox = function(src, caption) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    
    lightbox.style.display = 'flex';
    // trigger reflow
    void lightbox.offsetWidth;
    lightbox.classList.add('active');
    
    img.src = src;
    cap.innerText = caption;
};
