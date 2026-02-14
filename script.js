// ========== GESTION DES ONGLETS ==========
function openTab(event, tabId) {
    // Masquer tous les contenus d'onglets
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // DÃ©sactiver la timeline si active
    const timelineWrappers = document.querySelectorAll('.timeline-wrapper, .timeline-wrapper-dual');
    timelineWrappers.forEach(wrapper => {
        if (wrapper.classList.contains('active')) {
            wrapper.classList.remove('active');
        }
    });
    
    // RÃ©initialiser les Ã©tats
    isTimelineActive = false;
    isTimelineDualActive = false;
    showAllPoints();

    // DÃ©sactiver tous les boutons d'onglets
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));

    // Afficher le contenu de l'onglet sÃ©lectionnÃ© et activer le bouton
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// ========== CODE DE LA CARTE ==========
let lastClickedElement = null;

function showInfo(event, title, leader, geo, min_year, max_year, des, imageSrc) {
    if (lastClickedElement === event.target) {
        resetInfo();
        return;
    }

    lastClickedElement = event.target;

    // Trouver le container parent
    const container = event.target.closest('.map-container') || event.target.closest('.map-container-dual');
    const containerRect = container.getBoundingClientRect();
    const pointRect = event.target.getBoundingClientRect();

    // Créer la boîte d'info
    const newBox = document.createElement("div");
    newBox.className = "info-box";
    const yearText = max_year == min_year ? min_year : `${min_year} - ${max_year}`;
    newBox.innerHTML = `<b>${title}</b><des>القادة: ${leader}<br>الإطار المكاني: ${geo}<br>الإطار الزماني: ${yearText}<br>${des}</des>`;
    
    // Calculer la position optimale
    container.appendChild(newBox);
    
    // Laisser le temps au navigateur de calculer les dimensions
    requestAnimationFrame(() => {
        const boxRect = newBox.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Position par défaut (centrée sur le point)
        let left = parseFloat(event.target.style.left);
        let top = parseFloat(event.target.style.top);
        
        // Vérifier les débordements horizontaux
        const pointLeftPx = (left / 100) * containerRect.width;
        const boxWidth = boxRect.width;
        
        // Ajuster si la boîte dépasse à droite
        if (pointLeftPx + boxWidth / 2 > containerRect.width) {
            left = ((containerRect.width - boxWidth - 10) / containerRect.width) * 100;
        }
        // Ajuster si la boîte dépasse à gauche
        else if (pointLeftPx - boxWidth / 2 < 0) {
            left = (10 / containerRect.width) * 100;
        }
        
        // Ajustement vertical (éviter que la boîte ne sorte en haut/bas)
        const pointTopPx = (top / 100) * containerRect.height;
        const boxHeight = boxRect.height;
        
        if (pointTopPx + boxHeight / 2 > containerRect.height) {
            top = ((containerRect.height - boxHeight - 10) / containerRect.height) * 100;
        } else if (pointTopPx - boxHeight / 2 < 0) {
            top = (10 / containerRect.height) * 100;
        }
        
        newBox.style.left = left + '%';
        newBox.style.top = top + '%';
        
        // Gestion de l'image
        if (imageSrc) {
            const newImage = document.createElement("img");
            newImage.className = "point-image";
            newImage.src = imageSrc;
            newImage.style.width = window.innerWidth <= 768 ? "200px" : "300px";
            newImage.style.height = window.innerWidth <= 768 ? "200px" : "300px";
            
            // Positionner l'image à gauche du point
            const imageLeft = left - (parseFloat(newImage.style.width) / containerRect.width) * 100 - 2;
            newImage.style.left = Math.max(0, imageLeft) + '%';
            newImage.style.top = top + '%';
            
            container.appendChild(newImage);
            requestAnimationFrame(() => newImage.classList.add("show"));
        }
        
        requestAnimationFrame(() => newBox.classList.add("show"));
    });

    // Supprimer les anciennes boîtes et images
    const oldBoxes = document.querySelectorAll(".info-box:not(:last-child)");
    const oldImages = document.querySelectorAll(".point-image");

    oldBoxes.forEach(box => {
        box.classList.remove("show");
        box.classList.add("hide");
        box.addEventListener("transitionend", () => box.remove(), { once: true });
    });

    oldImages.forEach(img => {
        img.classList.remove("show");
        img.classList.add("hide");
        img.addEventListener("transitionend", () => img.remove(), { once: true });
    });
}

function resetInfo() {
    const boxes = document.querySelectorAll(".info-box");
    const images = document.querySelectorAll(".point-image");

    boxes.forEach(box => {
        box.classList.remove("show");
        box.classList.add("hide");
        box.addEventListener("transitionend", () => box.remove(), { once: true });
    });

    images.forEach(img => {
        img.classList.remove("show");
        img.classList.add("hide");
        img.addEventListener("transitionend", () => img.remove(), { once: true });
    });

    lastClickedElement = null;
}

// ========== GESTION DE LA TIMELINE (GÃ‰NÃ‰RIQUE) ==========
let isTimelineActive = false;
let isTimelineDualActive = false;

function toggleTimeline(isDual = false) {
    const wrapperClass = isDual ? ".timeline-wrapper-dual" : ".timeline-wrapper";
    const sliderId = isDual ? "timeline-dual" : "timeline";
    const pointSelector = isDual ? "#tab1 .point" : ".point";
    
    const timelineWrapper = document.querySelector(wrapperClass);
    const slider = document.getElementById(sliderId);
    
    if (isDual) {
        isTimelineDualActive = !isTimelineDualActive;
    } else {
        isTimelineActive = !isTimelineActive;
    }
    
    const isActive = isDual ? isTimelineDualActive : isTimelineActive;
    
    if (isActive) {
        timelineWrapper.classList.add("active");
        if (slider) {
            filterPointsByYear(parseInt(slider.value), pointSelector);
        }
    } else {
        timelineWrapper.classList.remove("active");
        showAllPoints(pointSelector);
    }
}

function showAllPoints(selector = ".point") {
    resetInfo();
    const points = document.querySelectorAll(selector);
    points.forEach(point => point.style.display = "block");
}

function filterPointsByYear(selectedYear, selector = ".point") {
    resetInfo();
    const points = document.querySelectorAll(selector);
    
    points.forEach(point => {
        const minYear = parseInt(point.getAttribute("data-min-year"));
        const maxYear = parseInt(point.getAttribute("data-max-year"));
        point.style.display = (selectedYear >= minYear && selectedYear <= maxYear) ? "block" : "none";
    });
}

// Wrappers pour compatibilitÃ©
function toggleTimelineDual() {
    toggleTimeline(true);
}

// ========== INITIALISATION ==========
window.addEventListener("DOMContentLoaded", () => {
    showAllPoints();
    
    // Timeline standard
    const slider = document.getElementById("timeline");
    const year = document.getElementById("year");
    
    if (slider && year) {
        slider.addEventListener("input", () => {
            const selectedYear = parseInt(slider.value);
            year.textContent = selectedYear;
            if (isTimelineActive) {
                filterPointsByYear(selectedYear);
            }
        });
    }
    
    // Timeline dual
    const sliderDual = document.getElementById("timeline-dual");
    const yearDual = document.getElementById("year-dual");
    
    if (sliderDual && yearDual) {
        sliderDual.addEventListener("input", () => {
            const selectedYear = parseInt(sliderDual.value);
            yearDual.textContent = selectedYear;
            if (isTimelineDualActive) {
                filterPointsByYear(selectedYear, "#tab1 .point");
            }
        });
    }
});

// ========== JAVASCRIPT POUR LES ACCORDÃ‰ONS - TAB3 ==========

function toggleAccordion(header) {
    const item = header.parentElement;
    const isActive = item.classList.contains('active');
    
    // Fermer tous les accordÃ©ons
    document.querySelectorAll('.accordion-item').forEach(acc => {
        acc.classList.remove('active');
    });
    
    // Ouvrir l'accordÃ©on cliquÃ© (sauf s'il Ã©tait dÃ©jÃ  ouvert)
    if (!isActive) {
        item.classList.add('active');
    }
}