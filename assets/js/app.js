const STORAGE_KEY = "ffxiv-legacy-tracker-quantities-v1";
const APP_MODE = document.body.dataset.mode || "edit";
const SNAPSHOT_FILE = document.body.dataset.snapshot || "collection-data.json";

const itemTitleModal = document.querySelector("#itemTitle h2");
const quantityInput = document.querySelector("#num");
const itemIconModal = document.querySelector("#icon");
const modalHqGlow = document.querySelector("#modalHqGlow");
const modal = document.querySelector(".modal");
const closeModalButton = document.querySelector("#closeModal");
const decrementButton = document.querySelector("#decrementQuantity");
const incrementButton = document.querySelector("#incrementQuantity");
const saveStatus = document.querySelector("#saveStatus");
const readonlyCount = document.querySelector("#readonlyCount");
const exportButton = document.querySelector("#exportSaveFile");
const importButton = document.querySelector("#importSaveFile");
const importInput = document.querySelector("#importSaveInput");

const backgroundImage = "url(assets/images/spritesheetOne.png)";
const backgroundImageTwo = "url(assets/images/spritesheetTwo.png)";
const fallbackImage = "url(assets/images/blank.png)";

let activeItem = null;
let activeButton = null;
let activeCounter = null;
let activeHqGlow = null;
let activeRedZero = null;
let savedQuantities = {};

const ITEMS_PER_ROW = 5;
const HIDDEN_GEAR_NAMES = new Set([
    "Cracked Shepherd's Belt",
    "Frayed Chef's Belt",
    "Greasy Half Apron",
    "Sylvan Silk Belt",
    "Explorer's Belt",
    "Mage's Rope Belt",
    "Scarlet Sash",
    "Veteran's Field Belt"
]);
const SEASONAL_FROM_MEALS = new Set([
    "Bitter Heart Chocolate",
    "Pure Heart Chocolate",
    "Demonic Cookie"
]);
const MEAL_MEDICINE_ORDER = [
    "Slow Ward Potion",
    "Silence Ward Potion",
    "Blind Ward Potion",
    "Poison Ward Potion",
    "Stun Ward Potion",
    "Sleep Ward Potion",
    "Bind Ward Potion",
    "Heavy Ward Potion",
    "Red Drop",
    "Blue Drop",
    "Clear Drop",
    "Purple Drop",
    "White Drop",
    "Black Drop",
    "Yellow Drop",
    "Green Drop",
    "Starlight Log",
    "Roast Dodo",
    "Snowflake Peak",
    "White Chocolate",
    "Heart Chocolate",
    "Spriggan Chocolate",
    "Sweet Rice Cake",
    "Consecrated Chocolate",
    "Zoni",
    "Ore Fruitcake",
    "Years-old Pumpkin Cookie",
    "Princess Pudding",
    "Mizzenmast Biscuit",
    "Roost Biscuit",
    "Hourglass Biscuit",
    "Over-aspected Crystal"
];
const SEASONAL_BARDING_NAMES = new Set(["Egg Harness", "Starlight Barding", "Paramour Barding"]);
const SEASONAL_FURNITURE_ITEMS = [
    ["Eerie Wallpaper", 8829], ["Starlight Interior Wall", 8830], ["Bombard Lamp", 8017], ["Ornamental Bamboo", 7991],
    ["Wooden Bucket", 8003], ["Kadomatsu", 8828], ["Eastern Cherry Tree", 9741], ["Crimson Felt Mat", 9742],
    ["Flame of Passion", 9743], ["Archon Egg Tower", 14062], ["Moonfire Lantern", 7990], ["Pumpkin Candlestand", 8822],
    ["Star-Topped Starlight Sentinel", 8823], ["Moon-Topped Starlight Sentinel", 8824], ["Sun-Topped Starlight Sentinel", 8825], ["Snowman", 8826],
    ["Empty Gift Boxes", 8827], ["Egg Floor Lamp", 9725], ["Empty Twinkleboxes", 8792], ["Starlight Sentinel", 13066],
    ["Broken Heart Chair (Right)", 13080], ["Broken Heart Chair (Left)", 13081], ["Pumpkin Chair", 13079], ["Paramour Bed", 13082],
    ["Pumpkin Desk", 13063], ["Thorne Dynasty Mantelshelf", 13285], ["Hard Rice Cakes", 8800], ["Pumpkin Basket", 8803],
    ["Sheep Dolls", 8799], ["Stuffed Qiqirn", 8801], ["Stuffed Succubus", 13062], ["Oriental Orange Basket", 13067],
    ["Oriental Wind Chime", 12093], ["Starlight Wreath", 8810], ["Starlight Ornament", 13064], ["Twin Star Ornament", 13065]
].map(([name, id], index) => ({
    name,
    id,
    localIcon: `assets/images/legacy-extra/${id}.png`,
    remoteIcon: `https://universalis-ffxiv.github.io/universalis-assets/icon2x/${id}.png`,
    category: 17,
    priority: index + 1,
    quantity: 0,
    saveKey: `seasonal-furniture:${id}`
}));
const SEASONAL_FURNITURE_BARDING_ORDER = [...SEASONAL_FURNITURE_ITEMS.map(item => item.name), "Egg Harness", "Starlight Barding", "Paramour Barding"];
const EXPLICIT_HQ_NAMES = new Set(["Heart Chocolate", "White Chocolate"]);
const RED_AT_ZERO_NAMES = new Set([
    "Zoni", "Sweet Rice Cake", "Ratstool", "Black Mor Dhonan Slag", "Grey Mor Dhonan Slag", "Red Mor Dhonan Slag",
    "White Mor Dhonan Slag", "Yellow Mor Dhonan Slag", "Cherry Branch", "Lauan Branch", "Teak Branch", "Spruce Plank",
    "Teak Plank", "Rosewood Plank", "Ebony Plank", "Nakki Skin", "Hellhound Hide", "Redtide Psashp", "Goldtide Psashp", "Greentide Psashp"
]);

function sanitizeQuantities(source) {
    const input = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
    const clean = {};
    Object.entries(input).forEach(([key, value]) => {
        const quantity = Number.parseInt(value, 10);
        if (Number.isFinite(quantity) && quantity > 0) clean[key] = quantity;
    });
    return clean;
}

function loadSavedQuantities() {
    try {
        return sanitizeQuantities(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch (error) {
        console.warn('Saved collection data could not be read.', error);
        return {};
    }
}

async function loadSnapshotQuantities() {
    try {
        const response = await fetch(SNAPSHOT_FILE, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return sanitizeQuantities(data.quantities || data);
    } catch (error) {
        console.warn('Snapshot collection data could not be loaded.', error);
        return {};
    }
}

function persistBrowserSave() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedQuantities));
        if (saveStatus && APP_MODE !== 'readonly') {
            saveStatus.textContent = 'Saved.';
            saveStatus.classList.remove('save-error');
        }
        return true;
    } catch (error) {
        console.warn('Collection data could not be saved.', error);
        if (saveStatus && APP_MODE !== 'readonly') {
            saveStatus.textContent = 'Save failed.';
            saveStatus.classList.add('save-error');
        }
        return false;
    }
}

function createExportPayload() {
    return {
        version: 2,
        app: 'ffxiv-legacy-tracker',
        exportedAt: new Date().toISOString(),
        quantities: savedQuantities
    };
}

function triggerExport() {
    const payload = JSON.stringify(createExportPayload(), null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'collection-data.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    if (saveStatus) saveStatus.textContent = 'Exported.';
}

function handleImportFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(String(reader.result || '{}'));
            savedQuantities = sanitizeQuantities(data.quantities || data);
            persistBrowserSave();
            window.location.reload();
        } catch (error) {
            console.warn('Collection import failed.', error);
            if (saveStatus) {
                saveStatus.textContent = 'Import failed.';
                saveStatus.classList.add('save-error');
            }
        }
    };
    reader.readAsText(file);
}

function getItemsForCategory(category) {
    return items.filter(item => item.category === category).sort(comparePriority);
}

function buildSections() {
    const mealCategoryItems = getItemsForCategory(9);
    const mealItemsByName = new Map(mealCategoryItems.map(item => [item.name, item]));
    const requestedMealNames = new Set(MEAL_MEDICINE_ORDER);
    const meals = [
        ...MEAL_MEDICINE_ORDER.map(name => mealItemsByName.get(name)).filter(Boolean),
        ...mealCategoryItems.filter(item => !SEASONAL_FROM_MEALS.has(item.name) && !requestedMealNames.has(item.name))
    ];

    const seasonalMovedItems = new Map(
        mealCategoryItems.filter(item => SEASONAL_FROM_MEALS.has(item.name)).map(item => [item.name, item])
    );
    const seasonal = [];
    for (const item of getItemsForCategory(14).filter(item => !SEASONAL_BARDING_NAMES.has(item.name))) {
        seasonal.push(item);
        if (item.name === 'Thorne Dynasty Map') {
            seasonal.push(seasonalMovedItems.get('Bitter Heart Chocolate'), seasonalMovedItems.get('Pure Heart Chocolate'));
        }
        if (item.name === 'Wet Bombard Ash') {
            seasonal.push(seasonalMovedItems.get('Demonic Cookie'));
        }
    }

    const cleanedSeasonal = seasonal.filter(Boolean);
    const seasonalFurnitureAndBardingsByName = new Map([
        ...SEASONAL_FURNITURE_ITEMS,
        ...items.filter(item => SEASONAL_BARDING_NAMES.has(item.name))
    ].map(item => [item.name, item]));
    const seasonalFurnitureAndBardings = SEASONAL_FURNITURE_BARDING_ORDER.map(name => seasonalFurnitureAndBardingsByName.get(name)).filter(Boolean);
    const gear = getItemsForCategory(4).filter(item => !HIDDEN_GEAR_NAMES.has(item.name));

    return [
        getItemsForCategory(15), getItemsForCategory(10), getItemsForCategory(7), getItemsForCategory(2),
        getItemsForCategory(6), getItemsForCategory(1), getItemsForCategory(12), getItemsForCategory(16),
        gear, meals, getItemsForCategory(13), cleanedSeasonal, seasonalFurnitureAndBardings,
        getItemsForCategory(5), getItemsForCategory(8), getItemsForCategory(11)
    ].map(sectionItems => ({ itemPerRow: ITEMS_PER_ROW, items: sectionItems }));
}

const itemArray = buildSections();

function getItemKey(item) {
    return item.saveKey || `${item.category}:${item.priority}`;
}

function normalizeQuantity(value) {
    const quantity = Number.parseInt(value, 10);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

function saveQuantity(item) {
    const key = getItemKey(item);
    if (item.quantity > 0) savedQuantities[key] = item.quantity;
    else delete savedQuantities[key];
    persistBrowserSave();
}

function comparePriority(first, second) {
    return first.priority - second.priority;
}

function applySavedQuantity(item) {
    item.quantity = normalizeQuantity(savedQuantities[getItemKey(item)]);
}

function isHighQualityTracked(item) {
    if (item.hqOnly === true) return true;
    if (EXPLICIT_HQ_NAMES.has(item.name)) return true;
    if (item.name.endsWith(' Drop')) return true;
    if (item.name.endsWith(' Ward Potion')) return true;
    return false;
}

function applyItemIcon(element, item, isModal = false) {
    if (item.localIcon || item.remoteIcon) {
        const iconSize = isModal ? '78px 78px' : '100% 100%';
        element.classList.add('direct-item-icon');
        element.style.backgroundPosition = 'center';
        element.style.backgroundRepeat = 'no-repeat';
        element.style.backgroundSize = iconSize;
        element.style.backgroundImage = fallbackImage;
        const useSource = source => {
            element.style.backgroundImage = `url("${source}"), ${fallbackImage}`;
            element.style.backgroundPosition = 'center, center';
            element.style.backgroundRepeat = 'no-repeat, no-repeat';
            element.style.backgroundSize = `${iconSize}, auto`;
        };
        const remoteCandidates = [
            item.remoteIcon,
            item.id ? `https://cdn.jsdelivr.net/gh/Universalis-FFXIV/universalis-assets@master/icon2x/${item.id}.png` : null
        ].filter((source, index, all) => source && all.indexOf(source) === index);
        const tryRemote = (index = 0) => {
            if (index >= remoteCandidates.length) {
                element.style.backgroundImage = fallbackImage;
                return;
            }
            const source = remoteCandidates[index];
            const remote = new Image();
            remote.onload = () => useSource(source);
            remote.onerror = () => tryRemote(index + 1);
            remote.src = source;
        };
        if (item.localIcon) {
            const local = new Image();
            local.onload = () => useSource(item.localIcon);
            local.onerror = () => tryRemote(0);
            local.src = item.localIcon;
        } else {
            tryRemote(0);
        }
        return;
    }

    element.classList.remove('direct-item-icon');
    element.style.backgroundImage = item.secondSheet !== undefined ? backgroundImageTwo : backgroundImage;
    element.style.backgroundPosition = `${item.backgroundPosX}px ${item.backgroundPosY}px`;
    element.style.backgroundSize = 'auto';
}

function updateItemDisplay(item, button, counter, hqGlow, redZero) {
    const isOwned = item.quantity > 0;
    const showHighQuality = isOwned && isHighQualityTracked(item);
    const showRedZero = !isOwned && RED_AT_ZERO_NAMES.has(item.name);
    button.classList.toggle('owned', isOwned);
    button.classList.toggle('unowned', !isOwned);
    button.classList.toggle('high-quality', showHighQuality);
    button.classList.toggle('red-zero-item', showRedZero);
    button.setAttribute('aria-label', `${item.name}. Quantity ${item.quantity}.${showHighQuality ? ' High Quality.' : ''}${showRedZero ? ' Highlighted missing item.' : ''}`);
    button.title = `${item.name} — Quantity: ${item.quantity}${showHighQuality ? ' — HQ' : ''}${showRedZero ? ' — Missing priority item' : ''}`;
    counter.textContent = isOwned ? item.quantity : '';
    hqGlow.hidden = !showHighQuality;
    redZero.hidden = !showRedZero;
    if (activeItem === item) modalHqGlow.hidden = !showHighQuality;
}

function setQuantity(value) {
    if (!activeItem || APP_MODE === 'readonly') return;
    activeItem.quantity = normalizeQuantity(value);
    quantityInput.value = activeItem.quantity;
    updateItemDisplay(activeItem, activeButton, activeCounter, activeHqGlow, activeRedZero);
    saveQuantity(activeItem);
}

function openItemEditor(item, button, counter, hqGlow, redZero) {
    activeItem = item;
    activeButton = button;
    activeCounter = counter;
    activeHqGlow = hqGlow;
    activeRedZero = redZero;

    itemTitleModal.textContent = item.name;
    applyItemIcon(itemIconModal, item, true);
    modalHqGlow.hidden = !(item.quantity > 0 && isHighQualityTracked(item));
    readonlyCount.textContent = `Count: ${item.quantity}`;
    readonlyCount.hidden = APP_MODE !== 'readonly';

    if (APP_MODE === 'readonly') {
        quantityInput.value = item.quantity;
    } else {
        quantityInput.value = item.quantity;
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    window.setTimeout(() => {
        if (APP_MODE === 'readonly') closeModalButton.focus();
        else {
            quantityInput.focus();
            quantityInput.select();
        }
    }, 0);
}

function closeItemEditor() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (activeButton) activeButton.focus();
    activeItem = null;
    activeButton = null;
    activeCounter = null;
    activeHqGlow = null;
    activeRedZero = null;
}

function renderItems() {
    itemArray.forEach((category, categoryIndex) => {
        const innerDiv = document.querySelector(`#inner-${categoryIndex + 1}`);
        if (!innerDiv) return;
        innerDiv.innerHTML = '';
        const categoryItems = [...category.items];
        const rowCount = Math.ceil(categoryItems.length / category.itemPerRow);
        const totalSlots = rowCount * category.itemPerRow;
        while (categoryItems.length < totalSlots) categoryItems.push({ name: 'blankItem', quantity: 0 });
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
            const row = document.createElement('div');
            row.className = 'item-row';
            innerDiv.appendChild(row);
            const start = rowIndex * category.itemPerRow;
            const rowItems = categoryItems.slice(start, start + category.itemPerRow);
            rowItems.forEach(item => {
                const wrapper = document.createElement('div');
                wrapper.className = 'btn-wrapper';
                const button = document.createElement('button');
                button.type = 'button';
                const hqGlow = document.createElement('span');
                hqGlow.className = 'legacy-hq-glow';
                hqGlow.hidden = true;
                hqGlow.setAttribute('aria-hidden', 'true');
                const redZero = document.createElement('span');
                redZero.className = 'legacy-red-zero';
                redZero.hidden = true;
                redZero.setAttribute('aria-hidden', 'true');
                const counter = document.createElement('span');
                counter.className = 'counter';
                counter.setAttribute('aria-hidden', 'true');
                if (item.name === 'blankItem') {
                    button.className = 'item-button blank-item';
                    button.disabled = true;
                    button.setAttribute('aria-hidden', 'true');
                } else {
                    applySavedQuantity(item);
                    button.className = 'item-button';
                    applyItemIcon(button, item);
                    updateItemDisplay(item, button, counter, hqGlow, redZero);
                    button.addEventListener('click', () => openItemEditor(item, button, counter, hqGlow, redZero));
                }
                wrapper.append(button, redZero, hqGlow, counter);
                row.appendChild(wrapper);
            });
        }
    });
}

function bindEvents() {
    if (quantityInput) {
        quantityInput.addEventListener('input', event => setQuantity(event.target.value));
        quantityInput.addEventListener('change', event => setQuantity(event.target.value));
    }
    if (decrementButton) decrementButton.addEventListener('click', () => setQuantity((activeItem?.quantity || 0) - 1));
    if (incrementButton) incrementButton.addEventListener('click', () => setQuantity((activeItem?.quantity || 0) + 1));
    if (closeModalButton) closeModalButton.addEventListener('click', closeItemEditor);
    if (modal) {
        modal.addEventListener('click', event => { if (event.target === modal) closeItemEditor(); });
    }
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) closeItemEditor();
    });
    if (APP_MODE !== 'readonly') {
        if (exportButton) exportButton.addEventListener('click', triggerExport);
        if (importButton && importInput) importButton.addEventListener('click', () => importInput.click());
        if (importInput) importInput.addEventListener('change', event => {
            const [file] = event.target.files || [];
            if (file) handleImportFile(file);
            event.target.value = '';
        });
    } else {
        document.body.classList.add('read-only-mode');
    }
}

async function initializeApp() {
    savedQuantities = APP_MODE === 'readonly' ? await loadSnapshotQuantities() : loadSavedQuantities();
    if (APP_MODE === 'readonly' && saveStatus) saveStatus.textContent = 'Read-only hosted view.';
    renderItems();
    bindEvents();
}

initializeApp();
