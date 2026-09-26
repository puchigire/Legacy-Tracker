const STORAGE_KEY = "ffxiv-legacy-tracker-quantities-v1";
const APP_MODE = document.body.dataset.mode || "edit";
const SNAPSHOT_FILE = document.body.dataset.snapshot || "collection-data.json";
const ORNATE_SPRITESHEET = "url(assets/images/ornates-spritesheet.png)";
const ORNATE_SPRITES = Object.freeze({
    41320: [5, 5],
    42511: [93, 5],
    44447: [181, 5],
    45780: [269, 5],
    46609: [357, 5],
    41322: [445, 5],
    42513: [533, 5],
    44449: [621, 5],
    45782: [709, 5],
    46611: [797, 5],
    48109: [5, 93],
    48110: [93, 93],
    43304: [181, 93],
    43306: [269, 93],
    43305: [357, 93],
    43725: [445, 93],
    43724: [533, 93],
    41740: [621, 93],
    42620: [709, 93],
    44657: [797, 93],
    47475: [5, 181],
    49190: [93, 181],
    41739: [181, 181],
    42619: [269, 181],
    44656: [357, 181],
    47474: [445, 181],
    49189: [533, 181],
    43345: [621, 181],
    43346: [709, 181],
    43347: [797, 181],
    43348: [5, 269],
    43349: [93, 269],
    43795: [181, 269],
    43796: [269, 269],
    41415: [357, 269],
    42603: [445, 269],
    44634: [533, 269],
    47425: [621, 269],
    49870: [709, 269],
    41414: [797, 269],
    42602: [5, 357],
    44633: [93, 357],
    47424: [181, 357],
    49869: [269, 357],
    48165: [357, 357],
    48166: [445, 357],
    42589: [533, 357],
    42591: [621, 357],
    42590: [709, 357],
    43818: [797, 357],
    43819: [5, 445],
    43839: [93, 445],
    43840: [181, 445],
    43841: [269, 445],
    43843: [357, 445],
    43842: [445, 445],
    42617: [533, 445],
    42618: [621, 445],
    48189: [709, 445],
    48190: [797, 445],
    43448: [5, 533],
    43450: [93, 533],
    43449: [181, 533],
    43879: [269, 533],
    43880: [357, 533],
    43511: [445, 533],
    43513: [533, 533],
    43514: [621, 533],
    43516: [709, 533],
    43515: [797, 533],
    43510: [5, 621],
    43512: [93, 621],
    48219: [181, 621],
    48220: [269, 621],
    43547: [357, 621],
    43549: [445, 621],
    43548: [533, 621],
    43928: [621, 621],
    43929: [709, 621],
    42793: [797, 621],
    42819: [5, 709],
    42789: [93, 709],
    42790: [181, 709],
    42792: [269, 709],
    42791: [357, 709],
    42788: [445, 709],
    42899: [533, 709],
    42900: [621, 709],
    42903: [709, 709],
    42902: [797, 709],
    42904: [5, 797],
    42898: [93, 797],
    42901: [181, 797],
    42962: [269, 797],
    42963: [357, 797],
    42967: [445, 797],
    42968: [533, 797],
    42964: [621, 797],
    42966: [709, 797],
    42965: [797, 797],
    57148: [5, 885],
    57149: [93, 885],
    57151: [181, 885],
    57153: [269, 885],
    57152: [357, 885],
    57147: [445, 885],
    57150: [533, 885],
    57217: [621, 885],
    57218: [709, 885],
    57221: [797, 885],
    57223: [5, 973],
    57222: [93, 973],
    57220: [181, 973],
    57219: [269, 973],
    57321: [357, 973],
    57322: [445, 973],
    57325: [533, 973],
    57327: [621, 973],
    57326: [709, 973],
    57324: [797, 973],
    57323: [5, 1061]
});

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
    const loadingCursor = window.LegacyTrackerLoadingCursor;
    loadingCursor?.start();
    try {
        const response = await fetch(SNAPSHOT_FILE, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return sanitizeQuantities(data.quantities || data);
    } catch (error) {
        console.warn('Snapshot collection data could not be loaded.', error);
        return {};
    } finally {
        loadingCursor?.stop();
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

function setIconSource(element, item) {
    const sprite = ORNATE_SPRITES[item.icon];
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundSize = 'auto';
    if (!sprite) {
        element.style.backgroundImage = 'none';
        element.style.backgroundPosition = 'center';
        console.warn(`No local ornate sprite position found for ${item.name}.`);
        return;
    }
    element.style.backgroundImage = ORNATE_SPRITESHEET;
    element.style.backgroundPosition = `-${sprite[0]}px -${sprite[1]}px`;
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
                const image = document.createElement('span');
                image.className = 'ornate-sprite-icon';
                image.setAttribute('aria-hidden', 'true');
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
