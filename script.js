// Główne zmienne
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    // Podstawowe elementy
    const overlayContainer = document.getElementById('overlayContainer');
    const shadow = document.getElementById('shadow');
    const mainImage = document.getElementById('mainImage');
    const overlayImage = document.getElementById('overlayImage');

    // Elementy sterujące
    const mainImageInput = document.getElementById('mainImageInput');
    const overlayImageInput = document.getElementById('overlayImageInput');
    const mainImageLink = document.getElementById('mainImageLink');
    const overlayImageLink = document.getElementById('overlayImageLink');
    const overlayLibrary = document.getElementById('overlayLibrary');
    const borderColorInput = document.getElementById('borderColor');
    const colorPresets = document.querySelectorAll('.color-btn');
    const shapeButtons = document.querySelectorAll('.btn[data-shape]');
    const shadowToggle = document.getElementById('shadowToggle');

 // Znajdź sekcję inicjalizacji cienia i zamień ją na:

function initializeShadow() {
    shadow.style.position = 'absolute';
    shadow.style.backgroundColor = 'rgba(0, 0, 0, 0.66)';
    shadow.style.filter = 'blur(10px)';
    shadow.style.display = 'block'; // Domyślnie włączony
    shadow.className = overlayContainer.className; // Dodaj to
    updateShadow();
    shadowToggle.checked = true; // Zaznacz checkbox
}

// Zamień funkcję updateShadow na:
function updateShadow() {
    const borderWidth = parseInt(getComputedStyle(overlayContainer).borderWidth);
    
    shadow.style.width = (overlayContainer.offsetWidth + borderWidth * 2) + 'px';
    shadow.style.height = (overlayContainer.offsetHeight + borderWidth * 2) + 'px';
    shadow.style.left = (overlayContainer.offsetLeft - borderWidth) + 'px';
    shadow.style.top = (overlayContainer.offsetTop - borderWidth) + 'px';
    shadow.className = overlayContainer.className;
    
    if (overlayContainer.classList.contains('sklejka')) {
        shadow.classList.add('sklejka');
        shadow.classList.remove('skos');
    } else if (overlayContainer.classList.contains('skos')) {
        shadow.classList.add('skos');
        shadow.classList.remove('sklejka');
        
        // Kopiujemy dokładnie te same transformacje co ma nakładka
        const overlayTransform = getComputedStyle(overlayContainer).transform;
        shadow.style.transform = overlayTransform;
        
        // Upewniamy się, że wymiary i pozycja są prawidłowe
        const rect = overlayContainer.getBoundingClientRect();
        shadow.style.width = rect.width + 'px';
        shadow.style.height = rect.height + 'px';
        shadow.style.left = (overlayContainer.offsetLeft - borderWidth) + 'px';
        shadow.style.top = (overlayContainer.offsetTop - borderWidth) + 'px';
    } else {
        shadow.classList.remove('sklejka', 'skos');
    }
}

    // Funkcja do ustawiania stylów obrazu nakładki
    function setupOverlayImage(imgElement) {
    imgElement.style.width = '100%';
    imgElement.style.height = '100%';
    imgElement.style.objectFit = 'cover';
    imgElement.style.position = 'relative'; // Dodaj to
    // Usuwamy aspectRatio, żeby nie kolidował z kadrowaniem
}

    // Przeciąganie nakładki
    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target === overlayContainer || overlayContainer.contains(e.target)) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, overlayContainer);
            if (shadow.style.display === 'block') {
                setTranslate(currentX + 3, currentY + 3, shadow); // Dodane przesunięcie dla efektu cienia
            }
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

   // Zamień obsługę przeciągania w funkcji setTranslate:
function setTranslate(xPos, yPos, el) {
    if (el === overlayContainer) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
        if (shadow.style.display === 'block') {
            updateShadow();
        }
    } else {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
}

    // Dodawanie listenerów dla drag & drop
    overlayContainer.addEventListener('touchstart', dragStart, false);
    overlayContainer.addEventListener('touchend', dragEnd, false);
    overlayContainer.addEventListener('touchmove', drag, false);

    overlayContainer.addEventListener('mousedown', dragStart, false);
    document.addEventListener('mousemove', drag, false);
    document.addEventListener('mouseup', dragEnd, false);

    // Obsługa zdjęć
    mainImageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                mainImage.src = e.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
            mainImageLink.value = '';
        }
    });

    overlayImageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                overlayImage.src = e.target.result;
                setupOverlayImage(overlayImage);
            };
            reader.readAsDataURL(e.target.files[0]);
            overlayImageLink.value = '';
            overlayLibrary.value = 'custom';
        }
    });

    // Obsługa kolorów
    borderColorInput.addEventListener('input', function() {
        overlayContainer.style.borderColor = this.value;
    });

    colorPresets.forEach(btn => {
        btn.addEventListener('click', function() {
            const color = this.dataset.color;
            borderColorInput.value = color;
            overlayContainer.style.borderColor = color;
        });
    });

    // Obsługa kształtów
    shapeButtons.forEach(button => {
        button.addEventListener('click', function() {
            shapeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const shape = this.dataset.shape;
            overlayContainer.className = shape;
            if (shadow.style.display === 'block') {
                shadow.className = shape;
                updateShadow();
            }
        });
    });

    // Obsługa grubości ramki
    const borderWidthInput = document.getElementById('borderWidth');
    const borderWidthNumberInput = document.getElementById('borderWidthInput');

    function updateBorderWidth(value) {
        overlayContainer.style.borderWidth = `${value}px`;
        borderWidthInput.value = value;
        borderWidthNumberInput.value = value;
        updateShadow();
    }

    borderWidthInput.addEventListener('input', () => {
        updateBorderWidth(borderWidthInput.value);
    });

    borderWidthNumberInput.addEventListener('input', () => {
        updateBorderWidth(borderWidthNumberInput.value);
    });

    // Obsługa rozmiaru
    const overlaySizeInput = document.getElementById('overlaySize');
    const overlaySizeNumberInput = document.getElementById('overlaySizeInput');

    function updateOverlaySize(value) {
        if (!overlayContainer.classList.contains('sklejka') && !overlayContainer.classList.contains('skos')) {
            overlayContainer.style.width = `${value}px`;
            overlayContainer.style.height = `${value}px`;
            updateShadow();
        }
        overlaySizeInput.value = value;
        overlaySizeNumberInput.value = value;
    }

    overlaySizeInput.addEventListener('input', () => {
        updateOverlaySize(overlaySizeInput.value);
    });

    overlaySizeNumberInput.addEventListener('input', () => {
        updateOverlaySize(overlaySizeNumberInput.value);
    });

   // Obsługa obrotu
const rotationAngleInput = document.getElementById('rotationAngle');
const rotationAngleNumberInput = document.getElementById('rotationAngleInput');
const rotateLeft = document.getElementById('rotateLeft');
const rotateRight = document.getElementById('rotateRight');

function updateRotation(value) {
    // Get current translation values if they exist
    const currentTransform = overlayContainer.style.transform || '';
    const translateMatch = currentTransform.match(/translate\(([-\d.]+px),\s*([-\d.]+px)\)/);
    const translateX = translateMatch ? translateMatch[1] : '0px';
    const translateY = translateMatch ? translateMatch[2] : '0px';

    // Apply both rotation and translation to overlayContainer
    overlayContainer.style.transform = `translate(${translateX}, ${translateY}) rotate(${value}deg)`;
    
    // Update shadow rotation
    if (shadow.style.display === 'block') {
        const shadowTranslateMatch = shadow.style.transform.match(/translate\(([-\d.]+px),\s*([-\d.]+px)\)/);
        const shadowTranslateX = shadowTranslateMatch ? shadowTranslateMatch[1] : '0px';
        const shadowTranslateY = shadowTranslateMatch ? shadowTranslateMatch[2] : '0px';
        shadow.style.transform = `translate(${shadowTranslateX}, ${shadowTranslateY}) rotate(${value}deg)`;
    }
    
    // Update input values
    rotationAngleInput.value = value;
    rotationAngleNumberInput.value = value;
}

// Funkcja do aktualizacji obrotu o zadany kąt
function rotateBy(degrees) {
    const currentRotation = parseInt(rotationAngleInput.value) || 0;
    let newRotation = currentRotation + degrees;
    
    // Zapewnienie że wartość jest w zakresie 0-360
    newRotation = ((newRotation % 360) + 360) % 360;
    
    // Aktualizacja interfejsu i obrotu
    updateRotation(newRotation);
}

// Also modify setTranslate function to preserve rotation
function setTranslate(xPos, yPos, el) {
    const currentRotation = rotationAngleInput.value || '0';
    
    if (el === overlayContainer) {
        el.style.transform = `translate(${xPos}px, ${yPos}px) rotate(${currentRotation}deg)`;
        if (shadow.style.display === 'block') {
            shadow.style.transform = `translate(${xPos + 3}px, ${yPos + 3}px) rotate(${currentRotation}deg)`;
        }
    }
}

rotationAngleInput.addEventListener('input', () => {
    updateRotation(rotationAngleInput.value);
});

rotationAngleNumberInput.addEventListener('input', () => {
    updateRotation(rotationAngleNumberInput.value);
});

// Obsługa przycisków obrotu
rotateLeft.addEventListener('click', () => rotateBy(-10));
rotateRight.addEventListener('click', () => rotateBy(10));

    // Obsługa cienia
    shadowToggle.addEventListener('change', () => {
        if (shadowToggle.checked) {
            shadow.style.display = 'block';
            initializeShadow();
            updateShadow();
        } else {
            shadow.style.display = 'none';
        }
    });

    // Obsługa skalowania
    const mainImageScale = document.getElementById('mainImageScale');
    const overlayImageScale = document.getElementById('overlayImageScale');

    mainImageScale.addEventListener('input', function() {
        const scale = this.value / 100;
        mainImage.style.transform = `translate(-50%, -50%) scale(${scale})`;
        this.nextElementSibling.textContent = `${this.value}%`;
    });

    overlayImageScale.addEventListener('input', function() {
        const scale = this.value / 100;
        const currentRotation = rotationAngleInput.value;
        overlayImage.style.transform = `rotate(${currentRotation}deg) scale(${scale})`;
        this.nextElementSibling.textContent = `${this.value}%`;
    });

    // Obsługa przycisku autodopasowania
    const autoFitBtn = document.getElementById('autoFitBtn');
    autoFitBtn.addEventListener('click', () => {
        const containerWidth = mainImage.parentElement.offsetWidth;
        const containerHeight = mainImage.parentElement.offsetHeight;
        const imgWidth = mainImage.naturalWidth;
        const imgHeight = mainImage.naturalHeight;
        
        const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
        
        mainImageScale.value = Math.round(scale * 100);
        mainImage.style.transform = `translate(-50%, -50%) scale(${scale})`;
        mainImageScale.nextElementSibling.textContent = `${Math.round(scale * 100)}%`;
    });

    // Obsługa URL obrazów
    mainImageLink.addEventListener('input', function() {
        if (this.value.trim()) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = function() {
                mainImage.src = this.src;
            };
            img.src = this.value.trim();
        }
    });

    overlayImageLink.addEventListener('input', function() {
        if (this.value.trim()) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = function() {
                overlayImage.src = this.src;
                setupOverlayImage(overlayImage);
            };
            img.src = this.value.trim();
            overlayLibrary.value = 'custom';
        }
    });

    // Obsługa biblioteki nakładek
    overlayLibrary.addEventListener('change', function() {
        if (this.value !== 'custom') {
            const baseUrl = 'https://raw.githubusercontent.com/aiidiot/nakladka/main/';
            const overlayUrl = baseUrl + this.value;
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = function() {
                overlayImage.src = this.src;
                setupOverlayImage(overlayImage);
            };
            img.src = overlayUrl;
            overlayImageInput.value = '';
            overlayImageLink.value = '';
        }
    });

    // Obsługa zapisywania
    const saveAsBtn = document.getElementById('saveAsBtn');
    saveAsBtn.addEventListener('click', () => {
        domtoimage.toBlob(document.getElementById('editorContainer'))
            .then(function(blob) {
                const link = document.createElement('a');
                link.download = 'edited-image.png';
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            });
    });

    // Obsługa kopiowania do schowka
    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');
    copyToClipboardBtn.addEventListener('click', () => {
        domtoimage.toBlob(document.getElementById('editorContainer'))
            .then(function(blob) {
                navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]).then(function() {
                    alert('Skopiowano do schowka!');
                });
            });
    });
    // Funkcja pobierająca aktualne ustawienia nakładki
function getCurrentSettings() {
    return {
        shape: overlayContainer.className, // Zapisujemy pełną nazwę klasy
        overlaySize: overlayContainer.style.width,
        borderWidth: overlayContainer.style.borderWidth,
        borderColor: overlayContainer.style.borderColor,
        position: {
            x: xOffset,
            y: yOffset
        },
        rotation: rotationAngleInput.value,
        shadow: shadowToggle.checked,
        overlayScale: overlayImageScale.value
    };
}

// Funkcja aplikująca zapisane ustawienia
function applySettings(settings) {
    // Przywracanie kształtu
    overlayContainer.className = settings.shape;
    if (shadow.style.display === 'block') {
        shadow.className = settings.shape;
    }

    // Przywracanie rozmiaru
    overlayContainer.style.width = settings.overlaySize;
    overlayContainer.style.height = settings.overlaySize;

    // Przywracanie ramki
    overlayContainer.style.borderWidth = settings.borderWidth;
    overlayContainer.style.borderColor = settings.borderColor;
    borderColorInput.value = settings.borderColor;
    borderWidthInput.value = parseInt(settings.borderWidth);
    borderWidthNumberInput.value = parseInt(settings.borderWidth);

    // Przywracanie pozycji
    xOffset = settings.position.x;
    yOffset = settings.position.y;
    setTranslate(xOffset, yOffset, overlayContainer);

    // Przywracanie obrotu
    updateRotation(settings.rotation);
    
    // Przywracanie skali
    overlayImageScale.value = settings.overlayScale;
    const scale = settings.overlayScale / 100;
    overlayImage.style.transform = `rotate(${settings.rotation}deg) scale(${scale})`;

    // Przywracanie cienia
    shadowToggle.checked = settings.shadow;
    shadow.style.display = settings.shadow ? 'block' : 'none';
    if (settings.shadow) {
        updateShadow();
    }
}

// Funkcja ładująca zapisane szablony do selecta
function loadSavedTemplates() {
    const select = document.getElementById('templateSelect');
    select.innerHTML = ''; // Czyszczenie selecta
    
    // Dodawanie zapisanych szablonów
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('template_')) {
            const templateName = key.replace('template_', '');
            const option = new Option(templateName, templateName);
            select.add(option);
        }
    }
}

// Event Listenery dla przycisków
document.getElementById('loadTemplateBtn').addEventListener('click', function() {
    const templateName = document.getElementById('templateSelect').value;
    if (!templateName) {
        alert('Wybierz szablon do wczytania');
        return;
    }
    
    const template = localStorage.getItem('template_' + templateName);
    if (template) {
        applySettings(JSON.parse(template));
    } else {
        alert('Nie znaleziono szablonu');
    }
});

document.getElementById('saveTemplateBtn').addEventListener('click', function() {
    const newTemplateName = document.getElementById('newTemplateName').value.trim();
    if (!newTemplateName) {
        alert('Wprowadź nazwę szablonu');
        return;
    }
    
    const settings = getCurrentSettings();
    localStorage.setItem('template_' + newTemplateName, JSON.stringify(settings));
    
    // Dodawanie nowej opcji do selecta
    const select = document.getElementById('templateSelect');
    const exists = Array.from(select.options).some(option => option.value === newTemplateName);
    
    if (!exists) {
        const option = new Option(newTemplateName, newTemplateName);
        select.add(option);
    }
    
    document.getElementById('newTemplateName').value = '';
    alert('Szablon został zapisany');
});

document.getElementById('deleteTemplateBtn').addEventListener('click', function() {
    const select = document.getElementById('templateSelect');
    if (select.selectedIndex === -1) {
        alert('Wybierz szablon do usunięcia');
        return;
    }
    
    const templateName = select.value;
    if (confirm(`Czy na pewno chcesz usunąć szablon "${templateName}"?`)) {
        localStorage.removeItem('template_' + templateName);
        select.remove(select.selectedIndex);
        alert('Szablon został usunięty');
    }
});

    // Funkcja ładująca szablony do selecta
function loadSavedTemplates() {
    const select = document.getElementById('templateSelect');
    
    // Wyczyść select
    select.innerHTML = '';
    
    // Przeszukaj localStorage i dodaj wszystkie znalezione szablony
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('template_')) {
            const templateName = key.replace('template_', '');
            const option = new Option(templateName, templateName);
            select.add(option);
        }
    }
}

// Dodanie inicjalizacji szablonów do istniejącego event listenera DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // ... (istniejący kod)
    


    // Setup nawigacji
    function setupNavigation(navId, targetImage) {
        const nav = document.getElementById(navId);
        const step = 10;
        
        nav.querySelector('.up').addEventListener('click', () => {
            const currentTop = parseInt(getComputedStyle(targetImage).top) || 0;
            targetImage.style.top = `${currentTop - step}px`;
        });
        
        nav.querySelector('.down').addEventListener('click', () => {
            const currentTop = parseInt(getComputedStyle(targetImage).top) || 0;
            targetImage.style.top = `${currentTop + step}px`;
        });
        
        nav.querySelector('.left').addEventListener('click', () => {
            const currentLeft = parseInt(getComputedStyle(targetImage).left) || 0;
            targetImage.style.left = `${currentLeft - step}px`;
        });
        
        nav.querySelector('.right').addEventListener('click', () => {
            const currentLeft = parseInt(getComputedStyle(targetImage).left) || 0;
            targetImage.style.left = `${currentLeft + step}px`;
        });
    }

    setupNavigation('mainImageNav', mainImage);
    setupNavigation('overlayImageNav', overlayImage);

    // Inicjalizacja początkowa
    initializeShadow();

        // Inicjalizacja szablonów
    loadSavedTemplates();
});
});
