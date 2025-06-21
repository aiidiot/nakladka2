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
    const editorContainer = document.getElementById('editorContainer');

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
    const borderWidthInput = document.getElementById('borderWidth');
    const borderWidthNumberInput = document.getElementById('borderWidthInput');

    // POPRAWIONA funkcja createCenterLine - obsługa obu typów linii
    function createCenterLine() {
        // Usuń poprzednią linię
        removeCenterLine();
        
        const borderWidth = parseInt(borderWidthInput.value) || 5;
        const borderColor = borderColorInput.value || '#000000';
        const editorContainer = document.getElementById('editorContainer');
        
        if (overlayContainer.classList.contains('sklejka')) {
            // LINIA PIONOWA dla SKLEJKA
            let centerLine = document.createElement('div');
            centerLine.id = 'centerLine';
            editorContainer.appendChild(centerLine);
            
            centerLine.style.position = 'absolute';
            centerLine.style.left = '50%';
            centerLine.style.top = '0';
            centerLine.style.width = borderWidth + 'px';
            centerLine.style.height = '100%';
            centerLine.style.backgroundColor = borderColor;
            centerLine.style.transform = 'translateX(-50%)';
            centerLine.style.zIndex = '10';
            centerLine.style.pointerEvents = 'none';
            
        } else if (overlayContainer.classList.contains('skos')) {
            // LINIA SKOŚNA dla SKOS
            let centerLine = document.createElement('div');
            centerLine.id = 'centerLine';
            editorContainer.appendChild(centerLine);
            
            const containerHeight = editorContainer.offsetHeight;
            // Oblicz długość przekątnej dla skośnej linii
            const diagonalLength = Math.sqrt(containerHeight * containerHeight + (containerHeight * 0.3) * (containerHeight * 0.3));
            
            centerLine.style.position = 'absolute';
centerLine.style.left = 'calc(50% + 40px)'; // przesuwa o 40px w prawo
            centerLine.style.top = '0';
            centerLine.style.width = borderWidth + 'px';
            centerLine.style.height = diagonalLength + 'px';
            centerLine.style.backgroundColor = borderColor;
            centerLine.style.transformOrigin = 'top center';
            centerLine.style.transform = 'translateX(-50%) rotate(8deg)'; // Taki sam kąt jak kadr
            centerLine.style.zIndex = '10';
            centerLine.style.pointerEvents = 'none';
        }
    }

    // Poprawiona funkcja removeCenterLine
    function removeCenterLine() {
        const centerLine = document.getElementById('centerLine');
        if (centerLine) {
            centerLine.remove();
        }
    }

    // Funkcja inicjalizacji cienia - zawsze włączony
    function initializeShadow() {
        shadow.style.position = 'absolute';
        shadow.style.backgroundColor = 'rgba(0, 0, 0, 0.66)';
        shadow.style.filter = 'blur(10px)';
        shadow.style.display = 'block';
        shadow.className = overlayContainer.className;
        updateShadow();
        shadowToggle.checked = true;
    }

    // POPRAWIONA funkcja updateShadow dla cienia linii
    function updateShadow() {
        const borderWidth = parseInt(getComputedStyle(overlayContainer).borderWidth) || parseInt(borderWidthInput.value) || 5;
        
        if (overlayContainer.classList.contains('sklejka')) {
            shadow.classList.add('sklejka');
            shadow.classList.remove('skos');
            shadow.style.width = borderWidth + 'px';
            shadow.style.height = '100%';
            shadow.style.left = '50%';
            shadow.style.top = '0';
            shadow.style.transform = 'translateX(-40%)';
            shadow.style.backgroundColor = 'rgba(0, 0, 0, 0.66)';
            shadow.style.filter = 'blur(8px)';
        } else if (overlayContainer.classList.contains('skos')) {
            shadow.classList.add('skos');
            shadow.classList.remove('sklejka');
            shadow.style.width = '8px';
            shadow.style.height = '100%';
            shadow.style.left = '50.5%';
            shadow.style.transform = 'translateX(-49%) rotate(8deg)';
            shadow.style.top = '0%';
            shadow.style.backgroundColor = 'rgba(0, 0, 0, 0.92)';
            shadow.style.filter = 'blur(9px)';
        } else {
            shadow.style.transform = 'none';
            shadow.style.width = (overlayContainer.offsetWidth + borderWidth * 2) + 'px';
            shadow.style.height = (overlayContainer.offsetHeight + borderWidth * 2) + 'px';
            shadow.style.left = (overlayContainer.offsetLeft - borderWidth) + 'px';
            shadow.style.top = (overlayContainer.offsetTop - borderWidth) + 'px';
            shadow.classList.remove('sklejka', 'skos');
            shadow.style.backgroundColor = 'rgba(0, 0, 0, 0.66)';
            shadow.style.filter = 'blur(10px)';
        }

        overlayContainer.style.zIndex = '6';
        shadow.style.zIndex = '5';
    }

    // Funkcja do ustawiania stylów obrazu nakładki
    function setupOverlayImage(imgElement) {
        imgElement.onload = function() {
            const container = overlayContainer;
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const imgWidth = this.naturalWidth;
            const imgHeight = this.naturalHeight;

            const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
            
            imgElement.style.width = '100%';
            imgElement.style.height = '100%';
            imgElement.style.objectFit = 'contain';
            imgElement.style.position = 'absolute';
            imgElement.style.top = '0';
            imgElement.style.left = '0';
            imgElement.style.bottom = '0';
            imgElement.style.right = '0';
            
            if (overlayImageScale) {
                overlayImageScale.value = Math.round(scale * 100);
                const event = new Event('input');
                overlayImageScale.dispatchEvent(event);
            }
        };
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
                setTranslate(currentX + 3, currentY + 3, shadow);
            }
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        const currentRotation = rotationAngleInput.value || '0';
        
        if (el === overlayContainer) {
            el.style.transform = `translate(${xPos}px, ${yPos}px) rotate(${currentRotation}deg)`;
            if (shadow.style.display === 'block') {
                shadow.style.transform = `translate(${xPos + 3}px, ${yPos + 3}px) rotate(${currentRotation}deg)`;
            }
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
                mainImage.style.transform = '';
                mainImage.style.width = '100%';
                mainImage.style.height = '100%';
                mainImage.style.objectFit = 'cover';
                mainImage.style.objectPosition = 'center';
                const container = mainImage.parentElement;
                if (getComputedStyle(container).position === 'static') {
                    container.style.position = 'relative';
                }
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

    // POPRAWIONA obsługa kolorów
    borderColorInput.addEventListener('input', function() {
        if (overlayContainer.classList.contains('sklejka') || overlayContainer.classList.contains('skos')) {
            const centerLine = document.getElementById('centerLine');
            if (centerLine) {
                centerLine.style.backgroundColor = this.value;
            }
        } else {
            overlayContainer.style.borderColor = this.value;
        }
    });

    colorPresets.forEach(btn => {
        btn.addEventListener('click', function() {
            const color = this.dataset.color;
            borderColorInput.value = color;
            if (overlayContainer.classList.contains('sklejka') || overlayContainer.classList.contains('skos')) {
                const centerLine = document.getElementById('centerLine');
                if (centerLine) {
                    centerLine.style.backgroundColor = color;
                }
            } else {
                overlayContainer.style.borderColor = color;
            }
        });
    });

    // POPRAWIONA obsługa kształtów
    shapeButtons.forEach(button => {
        button.addEventListener('click', function() {
            shapeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const shape = this.dataset.shape;
            overlayContainer.className = shape;
            
            if (shape === 'sklejka' || shape === 'skos') {
                overlayContainer.style.border = 'none';
                createCenterLine();
            } else {
                const borderWidth = borderWidthInput.value || 5;
                const borderColor = borderColorInput.value || '#000000';
                overlayContainer.style.border = `${borderWidth}px solid ${borderColor}`;
                removeCenterLine();
            }
            
            if (shadow.style.display === 'block') {
                shadow.className = shape;
                updateShadow();
            }
        });
    });

    // POPRAWIONA obsługa grubości ramki
    function updateBorderWidth(value) {
        if (overlayContainer.classList.contains('sklejka') || overlayContainer.classList.contains('skos')) {
            const centerLine = document.getElementById('centerLine');
            if (centerLine) {
                centerLine.style.width = `${value}px`;
            }
        } else {
            overlayContainer.style.borderWidth = `${value}px`;
        }
        
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
        const currentTransform = overlayContainer.style.transform || '';
        const translateMatch = currentTransform.match(/translate\(([-\d.]+px),\s*([-\d.]+px)\)/);
        const translateX = translateMatch ? translateMatch[1] : '0px';
        const translateY = translateMatch ? translateMatch[2] : '0px';

        overlayContainer.style.transform = `translate(${translateX}, ${translateY}) rotate(${value}deg)`;
        
        if (shadow.style.display === 'block') {
            const shadowTranslateMatch = shadow.style.transform.match(/translate\(([-\d.]+px),\s*([-\d.]+px)\)/);
            const shadowTranslateX = shadowTranslateMatch ? shadowTranslateMatch[1] : '0px';
            const shadowTranslateY = shadowTranslateMatch ? shadowTranslateMatch[2] : '0px';
            shadow.style.transform = `translate(${shadowTranslateX}, ${shadowTranslateY}) rotate(${value}deg)`;
        }
        
        rotationAngleInput.value = value;
        rotationAngleNumberInput.value = value;
    }

    function rotateBy(degrees) {
        const currentRotation = parseInt(rotationAngleInput.value) || 0;
        let newRotation = currentRotation + degrees;
        newRotation = ((newRotation % 360) + 360) % 360;
        updateRotation(newRotation);
    }

    rotationAngleInput.addEventListener('input', () => {
        updateRotation(rotationAngleInput.value);
    });

    rotationAngleNumberInput.addEventListener('input', () => {
        updateRotation(rotationAngleNumberInput.value);
    });

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
        const editorContainer = document.getElementById('editorContainer');
        const originalOverflow = editorContainer.style.overflow;
        const originalPosition = editorContainer.style.position;
        
        editorContainer.style.overflow = 'hidden';
        editorContainer.style.position = 'relative';
        
        const options = {
            width: editorContainer.offsetWidth,
            height: editorContainer.offsetHeight,
            style: {
                overflow: 'hidden',
                position: 'relative'
            }
        };
        
        domtoimage.toBlob(editorContainer, options)
            .then(function(blob) {
                const link = document.createElement('a');
                link.download = 'edited-image.png';
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            })
            .finally(() => {
                editorContainer.style.overflow = originalOverflow;
                editorContainer.style.position = originalPosition;
            });
    });

    // Obsługa kopiowania
    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');
    copyToClipboardBtn.addEventListener('click', () => {
        const editorContainer = document.getElementById('editorContainer');
        const originalOverflow = editorContainer.style.overflow;
        const originalPosition = editorContainer.style.position;
        
        editorContainer.style.overflow = 'hidden';
        editorContainer.style.position = 'relative';
        
        const options = {
            width: editorContainer.offsetWidth,
            height: editorContainer.offsetHeight,
            style: {
                overflow: 'hidden',
                position: 'relative'
            }
        };
        
        domtoimage.toBlob(editorContainer, options)
            .then(function(blob) {
                navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]).then(function() {
                    alert('Skopiowano do schowka!');
                });
            })
            .finally(() => {
                editorContainer.style.overflow = originalOverflow;
                editorContainer.style.position = originalPosition;
            });
    });

    // Funkcje obsługi szablonów
    function loadSavedTemplates() {
        const select = document.getElementById('templateSelect');
        select.innerHTML = '<option value="default">Możesz wskazać zapisany przez siebie szablon</option>';
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('template_')) {
                const templateName = key.replace('template_', '');
                const option = new Option(templateName, templateName);
                select.add(option);
            }
        }
    }

    function getCurrentSettings() {
        return {
            shape: overlayContainer.className,
            overlaySize: overlayContainer.style.width,
            borderWidth: overlayContainer.style.borderWidth,
            borderColor: overlayContainer.style.borderColor,
            position: {
                x: xOffset,
                y: yOffset
            },
            rotation: rotationAngleInput.value,
            shadow: true,
            overlayScale: overlayImageScale.value
        };
    }

    function applySettings(settings) {
        overlayContainer.className = settings.shape;
        shadow.className = settings.shape;

        if (!settings.shape.includes('sklejka') && !settings.shape.includes('skos')) {
            overlayContainer.style.width = settings.overlaySize;
            overlayContainer.style.height = settings.overlaySize;
        }

        overlayContainer.style.borderWidth = settings.borderWidth;
        overlayContainer.style.borderColor = settings.borderColor;
        borderColorInput.value = settings.borderColor;
        borderWidthInput.value = parseInt(settings.borderWidth);
        borderWidthNumberInput.value = parseInt(settings.borderWidth);

        xOffset = settings.position.x;
        yOffset = settings.position.y;
        setTranslate(xOffset, yOffset, overlayContainer);

        updateRotation(settings.rotation);
        
        overlayImageScale.value = settings.overlayScale;
        const scale = settings.overlayScale / 100;
        overlayImage.style.transform = `rotate(${settings.rotation}deg) scale(${scale})`;

        updateShadow();
    }

    // Event Listenery dla szablonów
    document.getElementById('loadTemplateBtn').addEventListener('click', function() {
        const templateName = document.getElementById('templateSelect').value;
        if (templateName === 'default') {
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
        const templateName = select.value;
        
        if (templateName === 'default') {
            alert('Wybierz szablon do usunięcia');
            return;
        }
        
        if (confirm(`Czy na pewno chcesz usunąć szablon "${templateName}"?`)) {
            localStorage.removeItem('template_' + templateName);
            select.remove(select.selectedIndex);
            alert('Szablon został usunięty');
        }
    });

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
    loadSavedTemplates();
});
