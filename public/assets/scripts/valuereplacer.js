document.addEventListener("DOMContentLoaded", () => {
    const raca = document.getElementById("raca");
    if (!raca) return;

    const elements = {
        blockFinal: document.getElementById("blockFinal"),
        dodgeFinal: document.getElementById("dodgeFinal"),
        conFinal: document.getElementById("conFinal"),
        effFinal: document.getElementById("effFinal"),
        resFinal: document.getElementById("resFinal"),

        blockBonus: document.getElementById("blockBonus"),
        dodgeBonus: document.getElementById("dodgeBonus"),
        conBonus: document.getElementById("conBonus"),
        effBonus: document.getElementById("effBonus"),
        resBonus: document.getElementById("resBonus"),
    };

    const ALL_BONUS_CHECKBOXES = [
        "GiftVel",
        "GiftDes",
        "GiftPoder",
        "GiftFort",
        "GiftEng",
        "GiftMem",
        "GiftDeter",
        "GiftPerce",
        "GiftPort",
        "GiftFac",
        "GiftBel",
        "GiftLing",
    ].map(id => document.getElementById(id)).filter(Boolean);

    ALL_BONUS_CHECKBOXES.forEach(cb => {
        cb.addEventListener("change", () => {
            // If user interacts, it becomes a user choice
            cb.removeAttribute("data-race-granted");
        });
    });

    const DEFAULT = {
        block: "0d4",
        dodge: "0d12",
        con: 0,
        eff: 0,
        res: 0
    };

    const RACE_TABLE = {
        //base
        1: { block: "0d4", dodge: "0d12", con: 0, eff: 0, res: 0 },
        2: { block: "2d4", dodge: "2d12", con: 4, eff: 5, res: 3 },
        3: { block: "2d4", dodge: "2d12", con: 7, eff: 4, res: 3 },

        //anoes
        4: { block: "3d4", dodge: "1d12", con: 4, eff: 6, res: 3 },
        5: { block: "3d4", dodge: "1d12", con: 4, eff: 6, res: 3 },

        //ciborgues
        6: { block: "2d4", dodge: "2d12", con: 4, eff: 5, res: 3 },
        7: { block: "2d4", dodge: "2d12", con: 4, eff: 5, res: 3 },

        //oxtus
        8: { block: "2d4", dodge: "2d12", con: 4, eff: 4, res: 3 },
        9: { block: "2d4", dodge: "2d12", con: 4, eff: 4, res: 3 },
        10:{ block: "2d4", dodge: "2d12", con: 4, eff: 4, res: 3 },

        //elfos
        11:{ block: "2d4", dodge: "2d12", con: 3, eff: 7, res: 2 },
        12:{ block: "2d4", dodge: "2d12", con: 3, eff: 7, res: 2 },
        13:{ block: "2d4", dodge: "2d12", con: 3, eff: 7, res: 2 },

        //cambions
        14:{ block: "2d4", dodge: "2d12", con: 4, eff: 6, res: 2 },
        15:{ block: "2d4", dodge: "2d12", con: 4, eff: 6, res: 2 },
        16:{ block: "2d4", dodge: "2d12", con: 4, eff: 6, res: 2 },
    };

    const RACE_CHECKBOX_TABLE = {
        // base
        1: [],
        2: [],
        3: [],

        //anoes
        4: ["GiftEng", "GiftMem", "GiftDeter"],
        5: ["GiftMem", "GiftDeter", "GiftPerce"],

        // ciborgues
        6: ["GiftEng", "GiftMem", "GiftPerce"],
        7: ["GiftPoder", "GiftEng", "GiftMem"],

        //oxtus
        8: ["GiftMem", "GiftPort", "GiftBel"],
        9: ["GiftPoder", "GiftMem", "GiftPort"],
        10: ["GiftEng", "GiftMem", "GiftPort"],

        //elfos
        11: ["GiftVel", "GiftPort", "GiftFac"],
        12: ["GiftVel", "GiftPort", "GiftBel"],
        13: ["GiftVel", "GiftPort", "GiftLing"],

        //cambions
        14: ["GiftPoder", "GiftFac", "GiftBel"],
        15: ["GiftPoder", "GiftPort", "GiftBel"],
        16: ["GiftPoder", "GiftMem", "GiftBel"],
    };

    function parseDice(dice) {
        const [count, sides] = dice.split("d").map(Number);
        return { count, sides };
    }

    function applyRaceValues() {
        const raceData = RACE_TABLE[Number(raca.value)] || DEFAULT;

        const blockBonus = Number(elements.blockBonus?.value || 0);
        const dodgeBonus = Number(elements.dodgeBonus?.value || 0);
        const conBonus = Number(elements.conBonus?.value || 0);
        const effBonus = Number(elements.effBonus?.value || 0);
        const resBonus = Number(elements.resBonus?.value || 0);

        if (elements.blockFinal) {
            const base = parseDice(raceData.block);
            elements.blockFinal.textContent =
                `${Math.max(0, base.count + blockBonus)}d${base.sides}`;
        }

        if (elements.dodgeFinal) {
            const base = parseDice(raceData.dodge);
            elements.dodgeFinal.textContent =
                `${Math.max(0, base.count + dodgeBonus)}d${base.sides}`;
        }

        if (elements.conFinal)
            elements.conFinal.textContent = raceData.con + conBonus;

        if (elements.effFinal)
            elements.effFinal.textContent = raceData.eff + effBonus;

        if (elements.resFinal)
            elements.resFinal.textContent = raceData.res + resBonus;
    }

    function applyRaceCheckboxes() {
    const raceId = Number(raca.value);
    const allowed = RACE_CHECKBOX_TABLE[raceId] || [];

    ALL_BONUS_CHECKBOXES.forEach(cb => {
        const isRaceGranted = cb.dataset.raceGranted === "true";
        const shouldBeGranted = allowed.includes(cb.id);

        // Remove race-granted traits no longer allowed
        if (isRaceGranted && !shouldBeGranted) {
            cb.checked = false;
            cb.removeAttribute("data-race-granted");
        }
    });

    // Add new race-granted traits
    allowed.forEach(id => {
        const cb = document.getElementById(id);
        if (!cb) return;

        if (!cb.checked) {
            cb.checked = true;
            cb.dataset.raceGranted = "true";
        }
    });
}


    function recalculateAll() {
        applyRaceValues();
        applyRaceCheckboxes();
    }

    

    // Events
    raca.addEventListener("change", recalculateAll);

    [
        elements.blockBonus,
        elements.dodgeBonus,
        elements.conBonus,
        elements.effBonus,
        elements.resBonus,
    ].forEach(el => {
        if (el) el.addEventListener("input", applyRaceValues);
    });

    // Initial run
    recalculateAll();
});
