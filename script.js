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

    // CrÃ©er la boÃ®te d'info
    const newBox = document.createElement("div");
    newBox.className = "info-box";
    const yearText = max_year == min_year ? min_year : `${min_year} - ${max_year}`;
    newBox.innerHTML = `<b>${title}</b><des>القادة: ${leader}<br>الإطار المكاني: ${geo}<br>الإطار الزماني: ${yearText}<br>${des}</des>`;
    newBox.style.top = event.target.style.top;
    newBox.style.left = event.target.style.left;
    container.appendChild(newBox);

    // CrÃ©er l'image si fournie
    let newImage = null;
    if (imageSrc) {
        newImage = document.createElement("img");
        newImage.className = "point-image";
        newImage.src = imageSrc;
        newImage.style.width = "300px";
        newImage.style.height = "300px";
        newImage.style.top = event.target.style.top;

        const containerWidth = container.offsetWidth;
        const pointLeftPercent = parseFloat(event.target.style.left);
        const pointLeftPx = (pointLeftPercent / 100) * containerWidth;
        const imageLeftPx = pointLeftPx - 310; // 150px + 10px gap
        const imageLeftPercent = (imageLeftPx / containerWidth) * 100;

        newImage.style.left = imageLeftPercent + '%';
        container.appendChild(newImage);
        requestAnimationFrame(() => newImage.classList.add("show"));
    }

    requestAnimationFrame(() => newBox.classList.add("show"));

    // Supprimer les anciennes boÃ®tes et images
    const oldBoxes = document.querySelectorAll(".info-box");
    const oldImages = document.querySelectorAll(".point-image");

    oldBoxes.forEach(box => {
        if (box !== newBox) {
            box.classList.remove("show");
            box.classList.add("hide");
            box.addEventListener("transitionend", () => box.remove(), { once: true });
        }
    });

    oldImages.forEach(img => {
        if (img !== newImage) {
            img.classList.remove("show");
            img.classList.add("hide");
            img.addEventListener("transitionend", () => img.remove(), { once: true });
        }
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