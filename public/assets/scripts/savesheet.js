// ==============================
// CONSTANTS
// ==============================
const LOCAL_STORAGE_KEY = "utopia_character_sheet_autosave";

// ==============================
// WAIT FOR DOM
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    assignContextualIds();

    // 🔹 Auto-load from localStorage
    const saved = loadFromLocalStorage();
    if (saved) {
        applyLoadedData(saved);
    }
});

// ==============================
// STRING SANITIZER
// ==============================
function sanitizeId(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase();
}

// ==============================
// CONTEXT-AWARE ID ASSIGNMENT
// ==============================
function assignContextualIds() {
    const elements = document.querySelectorAll("input, select, textarea");
    const usedIds = new Set();
    const fallbackCounters = {};

    elements.forEach(el => {
        if (el.id) {
            usedIds.add(el.id);
            return;
        }

        let newId = null;

        if (el.name) {
            newId = sanitizeId(el.name);
        }

        if (newId) {
            let uniqueId = newId;
            let counter = 1;

            while (usedIds.has(uniqueId)) {
                uniqueId = `${newId}_${counter++}`;
            }

            el.id = uniqueId;
            usedIds.add(uniqueId);
            return;
        }

        let type = el.tagName.toLowerCase() === "input"
            ? el.type || "text"
            : el.tagName.toLowerCase();

        fallbackCounters[type] = (fallbackCounters[type] || 0) + 1;
        el.id = `field_${type}_${fallbackCounters[type]}`;
        usedIds.add(el.id);
    });

    console.log(`Contextual IDs assigned to ${elements.length} fields`);
}

// ==============================
// COLLECT FORM DATA
// ==============================
function collectFormData() {
    const elements = document.querySelectorAll("input, select, textarea");
    const data = {};

    elements.forEach(el => {
        if (!el.id) return;

        if (el.type === "checkbox") {
            data[el.id] = {
                checked: el.checked,
                raceGranted: el.dataset.raceGranted === "true"
            };
        } else {
            data[el.id] = el.value;
        }
    });

    return data;
}

// ==============================
// SAVE TO LOCAL STORAGE
// ==============================
function saveToLocalStorage(data) {
    try {
        localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(data)
        );
    } catch (e) {
        console.warn("Failed to save to localStorage", e);
    }
}

// ==============================
// LOAD FROM LOCAL STORAGE
// ==============================
function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.warn("Failed to load from localStorage", e);
        return null;
    }
}

// ==============================
// APPLY LOADED DATA
// ==============================
function applyLoadedData(data) {
    Object.entries(data).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (!el) return;

        if (el.type === "checkbox") {
            // Backward compatibility
            if (typeof value === "boolean") {
                el.checked = value;
                el.removeAttribute("data-race-granted");
            } else {
                el.checked = value.checked;
                if (value.raceGranted) {
                    el.dataset.raceGranted = "true";
                } else {
                    el.removeAttribute("data-race-granted");
                }
            }
        } else {
            el.value = value;
        }
    });

    // 🔁 Force recalculations
    document.getElementById("raca")
        ?.dispatchEvent(new Event("change", { bubbles: true }));

    [
        "blockBonus",
        "dodgeBonus",
        "conBonus",
        "effBonus",
        "resBonus",
    ].forEach(id =>
        document.getElementById(id)
            ?.dispatchEvent(new Event("input", { bubbles: true }))
    );
}

// ==============================
// SAVE DATA (JSON + LOCAL)
// ==============================
function saveData() {
    const data = collectFormData();

    // 🔹 save to localStorage
    saveToLocalStorage(data);

    // 🔹 save to file
    const json = JSON.stringify(data, null, 2);
    downloadJSON(json, "utopia_character_sheet.json");
}

// ==============================
// LOAD DATA (FILE)
// ==============================
function loadData() {
    const fileInput = document.getElementById("fileInput");
    fileInput.value = "";
    fileInput.click();

    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            const data = JSON.parse(e.target.result);

            applyLoadedData(data);

            // 🔹 also store in localStorage
            saveToLocalStorage(data);
        };

        reader.readAsText(file);
    };
}

// ==============================
// AUTO-SAVE ON CHANGE
// ==============================
document.addEventListener("input", () => {
    saveToLocalStorage(collectFormData());
});

document.addEventListener("change", () => {
    saveToLocalStorage(collectFormData());
});

// ==============================
// HELPER: DOWNLOAD FILE
// ==============================
function downloadJSON(content, filename) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}