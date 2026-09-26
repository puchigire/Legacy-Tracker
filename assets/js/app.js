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

const ITEM_SPRITESHEET = "url(assets/images/items-spritesheet.png)";
const ITEM_SPRITES = Object.freeze({
    "Radiant Eye of Fire": [5, 5],
    "Radiant Eye of Ice": [93, 5],
    "Radiant Eye of Wind": [181, 5],
    "Radiant Eye of Earth": [269, 5],
    "Radiant Eye of Lightning": [357, 5],
    "Radiant Eye of Water": [445, 5],
    "Ice Moraine": [533, 5],
    "Wind Moraine": [621, 5],
    "Earth Moraine": [709, 5],
    "Water Moraine": [797, 5],
    "Radiant Ice Moraine": [5, 93],
    "Radiant Wind Moraine": [93, 93],
    "Radiant Earth Moraine": [181, 93],
    "Radiant Water Moraine": [269, 93],
    "Umbral Moraine": [357, 93],
    "Flint Stone": [445, 93],
    "Indigo Quartz": [533, 93],
    "White Quartz": [621, 93],
    "Black Quartz": [709, 93],
    "Uncultured Pearl": [797, 93],
    "Nephrite": [5, 181],
    "Umbral Eye": [93, 181],
    "Red O'Ghomoro Slag": [181, 181],
    "Brown O'Ghomoro Slag": [269, 181],
    "Yellow O'Ghomoro Slag": [357, 181],
    "Grey O'Ghomoro Slag": [445, 181],
    "Black O'Ghomoro Slag": [533, 181],
    "Purple Sagolii Slag": [621, 181],
    "Brown Sagolii Slag": [709, 181],
    "Yellow Sagolii Slag": [797, 181],
    "Grey Sagolii Slag": [5, 269],
    "Black Sagolii Slag": [93, 269],
    "Green Tinolqa Slag": [181, 269],
    "Brown Tinolqa Slag": [269, 269],
    "Yellow Tinolqa Slag": [357, 269],
    "Grey Tinolqa Slag": [445, 269],
    "Black Tinolqa Slag": [533, 269],
    "Red Abalathian Slag": [621, 269],
    "Brown Abalathian Slag": [709, 269],
    "Blue Abalathian Slag": [797, 269],
    "Grey Abalathian Slag": [5, 357],
    "White Abalathian Slag": [93, 357],
    "Red Mor Dhonan Slag": [181, 357],
    "Black Mor Dhonan Slag": [269, 357],
    "Yellow Mor Dhonan Slag": [357, 357],
    "Grey Mor Dhonan Slag": [445, 357],
    "White Mor Dhonan Slag": [533, 357],
    "River Sand": [621, 357],
    "Sea Sand": [709, 357],
    "Gold Nugget": [797, 357],
    "Copper Plate": [5, 445],
    "Brass Plate": [93, 445],
    "Silver Plate": [181, 445],
    "Electrum Plate": [269, 445],
    "Copper Rivets": [357, 445],
    "Brass Rivets": [445, 445],
    "Silver Rivets": [533, 445],
    "Copper Dust": [621, 445],
    "Silver Dust": [709, 445],
    "Gold Dust": [797, 445],
    "Silver Leaf": [5, 533],
    "Lauan Lumber": [93, 533],
    "Willow Lumber": [181, 533],
    "Rattan Lumber": [269, 533],
    "Chestnut Lumber": [357, 533],
    "Lauan Log": [445, 533],
    "Willow Log": [533, 533],
    "Chestnut Log": [621, 533],
    "Arrowwood Branch": [709, 533],
    "Lauan Branch": [797, 533],
    "Willow Branch": [5, 621],
    "Peach Branch": [93, 621],
    "Cherry Branch": [181, 621],
    "Elm Branch": [269, 621],
    "Chestnut Branch": [357, 621],
    "Walnut Branch": [445, 621],
    "Pine Branch": [533, 621],
    "Spruce Branch": [621, 621],
    "Supple Spruce Branch": [709, 621],
    "Mahogany Branch": [797, 621],
    "Teak Branch": [5, 709],
    "Ebony Branch": [93, 709],
    "Lauan Plank": [181, 709],
    "Maple Plank": [269, 709],
    "Willow Plank": [357, 709],
    "Cedar Plank": [445, 709],
    "Ash Plank": [533, 709],
    "Elm Plank": [621, 709],
    "Yew Plank": [709, 709],
    "Chestnut Plank": [797, 709],
    "Walnut Plank": [5, 797],
    "Pine Plank": [93, 797],
    "Oak Plank": [181, 797],
    "Spruce Plank": [269, 797],
    "Mahogany Plank": [357, 797],
    "Teak Plank": [445, 797],
    "Rosewood Plank": [533, 797],
    "Ebony Plank": [621, 797],
    "Dream Hat Materials": [709, 797],
    "Dream Tunic Materials": [797, 797],
    "Cotton Stuffing": [5, 885],
    "Cockatrice Feather": [93, 885],
    "Vulture Feather": [181, 885],
    "Condor Feather": [269, 885],
    "Buffalo Leather": [357, 885],
    "Wolf Leather": [445, 885],
    "Nakki Leather": [533, 885],
    "Basilisk Leather": [621, 885],
    "Rat Pelt": [709, 885],
    "Jackal Hide": [797, 885],
    "Squirrel Pelt": [5, 973],
    "Marmot Pelt": [93, 973],
    "Buffalo Hide": [181, 973],
    "Dormouse Pelt": [269, 973],
    "Nakki Skin": [357, 973],
    "Hog Hide": [445, 973],
    "Hellhound Hide": [533, 973],
    "Wolf Hide": [621, 973],
    "Basilisk Skin": [709, 973],
    "Lindwurm Skin": [797, 973],
    "Drake Skin": [5, 1061],
    "Goobbue Skin": [93, 1061],
    "Biast Skin": [181, 1061],
    "Dream Boots Materials": [269, 1061],
    "Buffalo Horn": [357, 1061],
    "Hippogryph Talon": [445, 1061],
    "Raptor Talon": [533, 1061],
    "Hellhound Fang": [621, 1061],
    "Jackal Fang": [709, 1061],
    "Gnat Wing": [797, 1061],
    "Weevil Elytron": [5, 1149],
    "Ladybug Elytron": [93, 1149],
    "Firefly Elytron": [181, 1149],
    "Tortoiseshell": [269, 1149],
    "Hedgemole Spine": [357, 1149],
    "Lunar Curtain": [445, 1149],
    "Coal Tar": [533, 1149],
    "Rubber Band": [621, 1149],
    "Chalk": [709, 1149],
    "Resin": [797, 1149],
    "Bee Basket": [5, 1237],
    "Raw Urushi": [93, 1237],
    "Black Urushi": [181, 1237],
    "Rubber Sole": [269, 1237],
    "Black Odoshi Cord": [357, 1237],
    "Blue Odoshi Cord": [445, 1237],
    "Kabuto Mask": [533, 1237],
    "Dream Hat": [621, 1237],
    "Dream Tunic": [709, 1237],
    "Dream Boots": [797, 1237],
    "Black Usagi Kabuto": [5, 1325],
    "Silver Usagi Kabuto": [93, 1325],
    "Usagi Kabuto": [181, 1325],
    "Alesone's Songbow": [269, 1325],
    "Aubriest's Allegory": [357, 1325],
    "Aubriest's Whisper": [445, 1325],
    "Chiran Zabran's Tempest": [533, 1325],
    "Gerbald's Redspike": [621, 1325],
    "Sibold's Reach": [709, 1325],
    "Symon's Honeyclaws": [797, 1325],
    "Thormoen's Pride": [5, 1413],
    "Thormoen's Purpose": [93, 1413],
    "Explorer's Bandana": [181, 1413],
    "Explorer's Calot": [269, 1413],
    "Explorer's Tabard": [357, 1413],
    "Explorer's Tunic": [445, 1413],
    "Explorer's Breeches": [533, 1413],
    "Explorer's Moccasins": [621, 1413],
    "Explorer's Sabatons": [709, 1413],
    "Mage's Halfrobe": [797, 1413],
    "Mage's Halfgloves": [5, 1501],
    "Mage's Chausses": [93, 1501],
    "Mage's Pattens": [181, 1501],
    "Red Onion Helm": [269, 1501],
    "Spiked Armguards": [357, 1501],
    "Thormoen's Subligar": [445, 1501],
    "Veteran's Pot Helm": [533, 1501],
    "Veteran's Acton": [621, 1501],
    "Blessed Earrings": [709, 1501],
    "Blessed Ring": [797, 1501],
    "Explorer's Earrings": [5, 1589],
    "Explorer's Choker": [93, 1589],
    "Explorer's Ring": [181, 1589],
    "Mage's Earrings": [269, 1589],
    "Mage's Choker": [357, 1589],
    "Mage's Ring": [445, 1589],
    "Stonewall Earrings": [533, 1589],
    "Stonewall Choker": [621, 1589],
    "Stonewall Ring": [709, 1589],
    "Slow Ward Potion": [797, 1589],
    "Silence Ward Potion": [5, 1677],
    "Blind Ward Potion": [93, 1677],
    "Poison Ward Potion": [181, 1677],
    "Stun Ward Potion": [269, 1677],
    "Sleep Ward Potion": [357, 1677],
    "Bind Ward Potion": [445, 1677],
    "Heavy Ward Potion": [533, 1677],
    "Red Drop": [621, 1677],
    "Blue Drop": [709, 1677],
    "Clear Drop": [797, 1677],
    "Purple Drop": [5, 1765],
    "White Drop": [93, 1765],
    "Black Drop": [181, 1765],
    "Yellow Drop": [269, 1765],
    "Green Drop": [357, 1765],
    "Starlight Log": [445, 1765],
    "Roast Dodo": [533, 1765],
    "Snowflake Peak": [621, 1765],
    "White Chocolate": [709, 1765],
    "Heart Chocolate": [797, 1765],
    "Spriggan Chocolate": [5, 1853],
    "Sweet Rice Cake": [93, 1853],
    "Consecrated Chocolate": [181, 1853],
    "Zoni": [269, 1853],
    "Ore Fruitcake": [357, 1853],
    "Years-old Pumpkin Cookie": [445, 1853],
    "Princess Pudding": [533, 1853],
    "Mizzenmast Biscuit": [621, 1853],
    "Roost Biscuit": [709, 1853],
    "Hourglass Biscuit": [797, 1853],
    "Over-aspected Crystal": [5, 1941],
    "Tricorn": [93, 1941],
    "Young Indigo Herring": [181, 1941],
    "Navigator's Ear": [269, 1941],
    "Box Turtle": [357, 1941],
    "Nether Newt": [445, 1941],
    "Scallop Shell": [533, 1941],
    "Miter Shell": [621, 1941],
    "Nanapasi's Happy Smile Super Wish Bag": [709, 1941],
    "Thorne Dynasty Map": [797, 1941],
    "Bitter Heart Chocolate": [5, 2029],
    "Pure Heart Chocolate": [93, 2029],
    "Pristine Archon Egg": [181, 2029],
    "Vibrant Archon Egg": [269, 2029],
    "Brilliant Archon Egg": [357, 2029],
    "Midnight Archon Egg": [445, 2029],
    "Fire Archon Egg": [533, 2029],
    "Ice Archon Egg": [621, 2029],
    "Wind Archon Egg": [709, 2029],
    "Earth Archon Egg": [797, 2029],
    "Lightning Archon Egg": [5, 2117],
    "Water Archon Egg": [93, 2117],
    "Astral Archon Egg": [181, 2117],
    "Umbral Archon Egg": [269, 2117],
    "Red Archon Egg": [357, 2117],
    "Green Archon Egg": [445, 2117],
    "Yellow Archon Egg": [533, 2117],
    "Violet Archon Egg": [621, 2117],
    "Blue Archon Egg": [709, 2117],
    "Brittle Motley Egg": [797, 2117],
    "Bombard Ash": [5, 2205],
    "Red Bombard Ash": [93, 2205],
    "Green Bombard Ash": [181, 2205],
    "Blue Bombard Ash": [269, 2205],
    "Black Bombard Ash": [357, 2205],
    "Wet Bombard Ash": [445, 2205],
    "Demonic Cookie": [533, 2205],
    "Eerie Wallpaper": [621, 2205],
    "Starlight Interior Wall": [709, 2205],
    "Bombard Lamp": [797, 2205],
    "Ornamental Bamboo": [5, 2293],
    "Wooden Bucket": [93, 2293],
    "Kadomatsu": [181, 2293],
    "Eastern Cherry Tree": [269, 2293],
    "Crimson Felt Mat": [357, 2293],
    "Flame of Passion": [445, 2293],
    "Archon Egg Tower": [533, 2293],
    "Moonfire Lantern": [621, 2293],
    "Pumpkin Candlestand": [709, 2293],
    "Star-Topped Starlight Sentinel": [797, 2293],
    "Moon-Topped Starlight Sentinel": [5, 2381],
    "Sun-Topped Starlight Sentinel": [93, 2381],
    "Snowman": [181, 2381],
    "Empty Gift Boxes": [269, 2381],
    "Egg Floor Lamp": [357, 2381],
    "Empty Twinkleboxes": [445, 2381],
    "Starlight Sentinel": [533, 2381],
    "Broken Heart Chair (Right)": [621, 2381],
    "Broken Heart Chair (Left)": [709, 2381],
    "Pumpkin Chair": [797, 2381],
    "Paramour Bed": [5, 2469],
    "Pumpkin Desk": [93, 2469],
    "Thorne Dynasty Mantelshelf": [181, 2469],
    "Hard Rice Cakes": [269, 2469],
    "Pumpkin Basket": [357, 2469],
    "Sheep Dolls": [445, 2469],
    "Stuffed Qiqirn": [533, 2469],
    "Stuffed Succubus": [621, 2469],
    "Oriental Orange Basket": [709, 2469],
    "Oriental Wind Chime": [797, 2469],
    "Starlight Wreath": [5, 2557],
    "Starlight Ornament": [93, 2557],
    "Twin Star Ornament": [181, 2557],
    "Egg Harness": [269, 2557],
    "Starlight Barding": [357, 2557],
    "Paramour Barding": [445, 2557],
    "Salamander Tail": [533, 2557],
    "Ratstool": [621, 2557],
    "Dalamud Nut": [709, 2557],
    "Moon Nut": [797, 2557],
    "Sunflower Seeds": [5, 2645],
    "Powdered Sugar": [93, 2645],
    "Crownbrush": [181, 2645],
    "Fire Materia VI": [269, 2645],
    "Ice Materia VI": [357, 2645],
    "Wind Materia VI": [445, 2645],
    "Earth Materia VI": [533, 2645],
    "Lightning Materia VI": [621, 2645],
    "Water Materia VI": [709, 2645],
    "Strength Materia VI": [797, 2645],
    "Vitality Materia VI": [5, 2733],
    "Dexterity Materia VI": [93, 2733],
    "Intelligence Materia VI": [181, 2733],
    "Mind Materia VI": [269, 2733],
    "Ixali Willowknot": [357, 2733],
    "Ixali Mapleknot": [445, 2733],
    "Ixali Ebonknot": [533, 2733],
    "Sylphic Brownleaf": [621, 2733],
    "Sylphic Yellowleaf": [709, 2733],
    "Sylphic Redleaf": [797, 2733],
    "Titan Copperpiece": [5, 2821],
    "Titan Mythrilpiece": [93, 2821],
    "Titan Electrumpiece": [181, 2821],
    "Bronze Amalj'ok": [269, 2821],
    "Iron Amalj'ok": [357, 2821],
    "Darksteel Amalj'ok": [445, 2821],
    "Ququroon Doom-die": [533, 2821],
    "Gagaroon Luck-die": [621, 2821],
    "Peperoon Fate-die": [709, 2821],
    "Brass Gobcog": [797, 2821],
    "Silver Gobcog": [5, 2909],
    "Gold Gobcog": [93, 2909],
    "Deaspected Crystal": [181, 2909],
    "Deaspected Cluster": [269, 2909],
    "Faded Page": [357, 2909],
    "Militia Bow": [445, 2909],
    "Militia Sword": [533, 2909],
    "Militia Helm": [621, 2909],
    "Militia Gorget": [709, 2909],
    "Militia Longboots": [797, 2909],
    "Militia Leggings": [5, 2997],
    "Militia Poultice": [93, 2997],
    "Militia Rations": [181, 2997],
    "Rope": [269, 2997],
    "Brass Dish": [357, 2997],
    "Silver Goblet": [445, 2997],
    "Goblin Mask": [533, 2997],
    "Mission Ceruleum": [621, 2997],
    "Mission Ceruleum Voucher": [709, 2997],
    "Grade 2 Clear Prism": [797, 2997],
    "Grade 3 Clear Prism": [5, 3085],
    "Grade 4 Clear Prism": [93, 3085],
    "Grade 5 Clear Prism": [181, 3085],
    "Grade 2 Carbonized Matter": [269, 3085],
    "Grade 3 Carbonized Matter": [357, 3085],
    "Grade 4 Carbonized Matter": [445, 3085],
    "Grade 5 Carbonized Matter": [533, 3085],
    "Apprentice's Practice Materials": [621, 3085],
    "Redtide Psashp": [709, 3085],
    "Goldtide Psashp": [797, 3085],
    "Greentide Psashp": [5, 3173]
});

let activeItem = null;
let activeButton = null;
let activeCounter = null;
let activeHqGlow = null;
let activeRedZero = null;
let savedQuantities = {};

const ITEMS_PER_ROW = 5;
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
    const gear = getItemsForCategory(4);

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

function applyItemIcon(element, item) {
    const sprite = ITEM_SPRITES[item.name];
    element.classList.add('direct-item-icon');
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundSize = 'auto';
    if (!sprite) {
        element.style.backgroundImage = 'none';
        element.style.backgroundPosition = 'center';
        console.warn(`No local sprite position found for ${item.name}.`);
        return;
    }
    element.style.backgroundImage = ITEM_SPRITESHEET;
    element.style.backgroundPosition = `-${sprite[0]}px -${sprite[1]}px`;
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
