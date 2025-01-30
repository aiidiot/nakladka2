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

    // Funkcja ładująca szablony
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

    // Funkcja pobierająca aktualne ustawienia
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
            shadow: true, // Zawsze włączony
            overlayScale: overlayImageScale.value
        };
    }
    // Funkcja aplikująca ustawienia szablonu
    function applySettings(settings) {
        // Przywracanie kształtu
        overlayContainer.className = settings.shape;
        shadow.className = settings.shape;

        // Przywracanie rozmiaru
        if (!settings.shape.includes('sklejka') && !settings.shape.includes('skos')) {
            overlayContainer.style.width = settings.overlaySize;
            overlayContainer.style.height = settings.overlaySize;
        }

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

        // Aktualizacja cienia
        updateShadow();
    }

    // Funkcja do ustawiania stylów obrazu nakładki
    function setupOverlayImage(imgElement) {
        // Czekamy na załadowanie obrazu
        imgElement.onload = function() {
            const container = overlayContainer;
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const imgWidth = this.naturalWidth;
            const imgHeight = this.naturalHeight;

            // Obliczamy skalę, aby obraz zmieścił się w całości
            const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
            
            imgElement.style.width = '100%';
            imgElement.style.height = '100%';
            imgElement.style.objectFit = 'contain'; // Zmiana z 'cover' na 'contain'
            imgElement.style.position = 'relative';
            
            // Ustawiamy skalę w kontrolce
            if (overlayImageScale) {
                overlayImageScale.value = Math.round(scale * 100);
                const event = new Event('input');
                overlayImageScale.dispatchEvent(event);
            }
        };
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

    // Inicjalizacja przy starcie
    initializeShadow(); // Cień zawsze włączony
    loadSavedTemplates(); // Ładowanie szablonów
