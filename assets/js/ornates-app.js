const STORAGE_KEY = "ffxiv-legacy-tracker-quantities-v1";
const APP_MODE = document.body.dataset.mode || "edit";
const SNAPSHOT_FILE = document.body.dataset.snapshot || "collection-data.json";
const FALLBACK_ICON = "assets/images/blank.png";

const itemTitleModal = document.querySelector("#itemTitle h2");
const quantityInput = document.querySelector("#num");
const modalIconImage = document.querySelector("#modalIconImage");
const modalHqGlow = document.querySelector("#modalHqGlow");
const itemMeta = document.querySelector("#itemMeta");
const universalisLink = document.querySelector("#universalisLink");
const modal = document.querySelector(".modal");
const closeModalButton = document.querySelector("#closeModal");
const decrementButton = document.querySelector("#decrementQuantity");
const incrementButton = document.querySelector("#incrementQuantity");
const saveStatus = document.querySelector("#saveStatus");
const readonlyCount = document.querySelector("#readonlyCount");
const exportButton = document.querySelector("#exportSaveFile");
const importButton = document.querySelector("#importSaveFile");
const importInput = document.querySelector("#importSaveInput");
const ornateSets = document.querySelector("#ornateSets");
const ownedSummary = document.querySelector("#ownedSummary");
const quantitySummary = document.querySelector("#quantitySummary");

let activeItem = null;
let activeButton = null;
let activeCounter = null;
let savedQuantities = {};
const displayRecords = new Map();
const groupRecords = new Map();

function sanitizeQuantities(source) {
    const input = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
    const clean = {};
    Object.entries(input).forEach(([key, value]) => {
        const quantity = Number.parseInt(value, 10);
        if (Number.isFinite(quantity) && quantity > 0) clean[key] = quantity;
    });
    return clean;
}

function getItemKey(item) {
    return `ornate:${item.id}`;
}

function normalizeQuantity(value) {
    const quantity = Number.parseInt(value, 10);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
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

function saveQuantity(item) {
    const key = getItemKey(item);
    if (item.quantity > 0) savedQuantities[key] = item.quantity;
    else delete savedQuantities[key];
    persistBrowserSave();
}

function applySavedQuantity(item) {
    item.quantity = normalizeQuantity(savedQuantities[getItemKey(item)]);
}

function iconUrl(iconId) {
    const id = String(iconId).padStart(6, '0');
    const folder = `${id.slice(0, 3)}000`;
    const path = `ui/icon/${folder}/${id}_hr1.tex`;
    return `https://v2.xivapi.com/api/asset?path=${encodeURIComponent(path)}&format=png`;
}

function localIconUrl(item) {
    return `assets/images/ornates/${item.icon}.png`;
}

function setIconSource(image, item) {
    let triedRemote = false;
    image.onerror = () => {
        if (!triedRemote) {
            triedRemote = true;
            image.src = iconUrl(item.icon);
            return;
        }
        image.onerror = null;
        image.src = FALLBACK_ICON;
    };
    image.src = localIconUrl(item);
}

function isHighQualityItem(item) {
    return item.name.startsWith('Ornate ');
}

function shortCaption(item) {
    return item.name
        .replace(/^Augmented Ala Mhigan /, '')
        .replace(/^Ornate /, '')
        .replace(/^Ironworks /, '')
        .replace(/^Neo-Ishgardian /, '')
        .replace(/^Archeo Kingdom /, '')
        .replace(/^Courtly Lover's /, '');
}

function updateItemDisplay(item, button, counter, hqGlow) {
    const isOwned = item.quantity > 0;
    const showHighQuality = isOwned && isHighQualityItem(item);
    const qualityLabel = showHighQuality ? ' High Quality.' : '';
    button.classList.toggle('owned', isOwned);
    button.classList.toggle('unowned', !isOwned);
    button.classList.toggle('high-quality', showHighQuality);
    button.setAttribute('aria-label', `${item.name}. Item level ${item.ilevel}. Quantity ${item.quantity}.${qualityLabel}`);
    button.title = `${item.name} — Item level ${item.ilevel} — Quantity: ${item.quantity}${showHighQuality ? ' — HQ' : ''}`;
    counter.textContent = isOwned ? item.quantity : '';
    hqGlow.hidden = !showHighQuality;
    if (activeItem?.id === item.id) {
        modalHqGlow.hidden = !showHighQuality;
        readonlyCount.textContent = `Count: ${item.quantity}`;
        itemMeta.textContent = `Item level ${item.ilevel} • ${item.group}${showHighQuality ? ' • High Quality' : ''}`;
    }
    updateSummaries();
}

function updateSummaries() {
    const obtained = ornateItems.filter(item => item.quantity > 0).length;
    const totalQuantity = ornateItems.reduce((total, item) => total + item.quantity, 0);
    ownedSummary.textContent = `${obtained} of ${ornateItems.length} items obtained`;
    quantitySummary.textContent = `${totalQuantity} total ${totalQuantity === 1 ? 'piece' : 'pieces'}`;
    groupRecords.forEach((record, groupId) => {
        const groupItems = ornateItems.filter(item => item.groupId === groupId);
        const groupOwned = groupItems.filter(item => item.quantity > 0).length;
        record.textContent = `${groupOwned} / ${groupItems.length}`;
    });
}

function setQuantity(value) {
    if (!activeItem || APP_MODE === 'readonly') return;
    activeItem.quantity = normalizeQuantity(value);
    quantityInput.value = activeItem.quantity;
    const record = displayRecords.get(activeItem.id);
    updateItemDisplay(activeItem, activeButton, activeCounter, record.hqGlow);
    saveQuantity(activeItem);
}

function openItemEditor(item, button, counter) {
    activeItem = item;
    activeButton = button;
    activeCounter = counter;
    const showHighQuality = item.quantity > 0 && isHighQualityItem(item);
    itemTitleModal.textContent = item.name;
    itemMeta.textContent = `Item level ${item.ilevel} • ${item.group}${showHighQuality ? ' • High Quality' : ''}`;
    modalHqGlow.hidden = !showHighQuality;
    quantityInput.value = item.quantity;
    readonlyCount.textContent = `Count: ${item.quantity}`;
    readonlyCount.hidden = APP_MODE !== 'readonly';
    setIconSource(modalIconImage, item);
    universalisLink.href = `https://universalis.app/market/${item.id}`;
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
}

function renderItems() {
    ornateSets.innerHTML = '';
    displayRecords.clear();
    groupRecords.clear();
    const byLevel = new Map();
    ornateItems.forEach(item => {
        applySavedQuantity(item);
        if (!byLevel.has(item.ilevel)) byLevel.set(item.ilevel, new Map());
        const groups = byLevel.get(item.ilevel);
        if (!groups.has(item.groupId)) groups.set(item.groupId, []);
        groups.get(item.groupId).push(item);
    });
    [...byLevel.entries()].sort(([a], [b]) => a - b).forEach(([ilevel, groups]) => {
        const levelSection = document.createElement('section');
        levelSection.className = 'ilevel-section';
        const levelHeading = document.createElement('h2');
        levelHeading.className = 'ilevel-heading';
        levelHeading.textContent = `Item Level ${ilevel}`;
        levelSection.appendChild(levelHeading);
        groups.forEach((groupItems, groupId) => {
            groupItems.sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
            const panel = document.createElement('section');
            panel.className = 'set-panel';
            const header = document.createElement('div');
            header.className = 'set-header';
            const title = document.createElement('h3');
            title.className = 'set-title';
            title.textContent = groupItems[0].group;
            const progress = document.createElement('span');
            progress.className = 'set-progress';
            progress.setAttribute('aria-label', 'Set collection progress');
            groupRecords.set(groupId, progress);
            header.append(title, progress);
            const grid = document.createElement('div');
            grid.className = 'ornate-grid';
            groupItems.forEach(item => {
                const tile = document.createElement('div');
                tile.className = 'ornate-tile';
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'ornate-item-button';
                const image = document.createElement('img');
                image.alt = '';
                image.loading = 'lazy';
                image.decoding = 'async';
                setIconSource(image, item);
                const hqGlow = document.createElement('span');
                hqGlow.className = 'ornate-hq-glow';
                hqGlow.hidden = true;
                hqGlow.setAttribute('aria-hidden', 'true');
                const counter = document.createElement('span');
                counter.className = 'ornate-counter';
                counter.setAttribute('aria-hidden', 'true');
                const caption = document.createElement('span');
                caption.className = 'item-caption';
                caption.textContent = shortCaption(item);
                button.append(image, hqGlow, counter);
                tile.append(button, caption);
                grid.appendChild(tile);
                displayRecords.set(item.id, { button, counter, hqGlow });
                updateItemDisplay(item, button, counter, hqGlow);
                button.addEventListener('click', () => openItemEditor(item, button, counter));
            });
            panel.append(header, grid);
            levelSection.appendChild(panel);
        });
        ornateSets.appendChild(levelSection);
    });
    updateSummaries();
}

function bindEvents() {
    if (quantityInput) {
        quantityInput.addEventListener('input', event => setQuantity(event.target.value));
        quantityInput.addEventListener('change', event => setQuantity(event.target.value));
    }
    if (decrementButton) decrementButton.addEventListener('click', () => setQuantity((activeItem?.quantity || 0) - 1));
    if (incrementButton) incrementButton.addEventListener('click', () => setQuantity((activeItem?.quantity || 0) + 1));
    if (closeModalButton) closeModalButton.addEventListener('click', closeItemEditor);
    if (modal) modal.addEventListener('click', event => { if (event.target === modal) closeItemEditor(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('is-open')) closeItemEditor(); });
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
