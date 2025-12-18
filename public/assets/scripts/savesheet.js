// ==============================
// WAIT FOR DOM
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    assignContextualIds();
});


// ==============================
// STRING SANITIZER
// ==============================
function sanitizeId(str) {
    return str
        .normalize("NFD")                 // remove accents
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")   // non-alphanum → _
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

        // 1️⃣ Use name attribute if available
        if (el.name) {
            newId = sanitizeId(el.name);
        }

        // 2️⃣ Ensure uniqueness
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

        // 3️⃣ Fallback auto-generated ID
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
// SAVE DATA
// ==============================
function saveData() {
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

    const json = JSON.stringify(data, null, 2);
    downloadJSON(json, "utopia_character_sheet.json");
}


// ==============================
// LOAD DATA
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

            Object.entries(data).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (!el) return;

                if (el.type === "checkbox") {
        // Backward compatibility with old saves
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

            // Force recalculation after loading
            document.getElementById("raca")?.dispatchEvent(new Event("change", { bubbles: true }));

            [
                "blockBonus",
                "dodgeBonus",
                "conBonus",
                "effBonus",
                "resBonus",
            ].forEach(id => {
            document.getElementById(id)?.dispatchEvent(new Event("input", { bubbles: true }));
            });
        };

        reader.readAsText(file);
    };
}


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