document.addEventListener("DOMContentLoaded", () => {
    const charLvl = document.getElementById("charLvl");
    const corpoVal = document.getElementById("corpoVal");
    const menteVal = document.getElementById("menteVal");
    const almaVal = document.getElementById("almaVal");

    const pointsLeft = document.getElementById("pointsLeft");
    const maxEXP = document.getElementById("maxEXP");
    const maxTraitValue = document.getElementById("maxTraitValue");
    const currentTraitValue = document.getElementById("currentTraitValue");

    const traitBonus = document.getElementById("traitBonus");

    const conFinal = document.getElementById("conFinal");
    const effFinal = document.getElementById("effFinal");
    const resFinal = document.getElementById("resFinal");

    const maxSHP = document.getElementById("maxSHP");
    const maxSTAM = document.getElementById("maxSTAM");
    const maxDHP = document.getElementById("maxDHP");

    const TRAIT_INPUT_IDS = [
        "bonusvel", "bonusdes", "bonuspoder", "bonusfort",
        "bonuseng", "bonusmem", "bonusdeter", "bonusperce",
        "bonusport", "bonusfac", "bonusbel", "bonusling",
    ];

    const traitInputs = TRAIT_INPUT_IDS
        .map(id => document.getElementById(id))
        .filter(Boolean);

    const TRAIT_MAP = [
        { key: "Vel", bonus: "bonusvel" },
        { key: "Des", bonus: "bonusdes" },
        { key: "Poder", bonus: "bonuspoder" },
        { key: "Fort", bonus: "bonusfort" },
        { key: "Eng", bonus: "bonuseng" },
        { key: "Mem", bonus: "bonusmem" },
        { key: "Deter", bonus: "bonusdeter" },
        { key: "Perce", bonus: "bonusperce" },
        { key: "Port", bonus: "bonusport" },
        { key: "Fac", bonus: "bonusfac" },
        { key: "Bel", bonus: "bonusbel" },
        { key: "Ling", bonus: "bonusling" },
    ];

    const VAL_MAP = [
        { val: "valAgi", a: "bonusvel", b: "bonusdes" },
        { val: "valFor", a: "bonuspoder", b: "bonusfort" },
        { val: "valInt", a: "bonuseng", b: "bonusmem" },
        { val: "valVon", a: "bonusdeter", b: "bonusperce" },
        { val: "valApa", a: "bonusport", b: "bonusfac" },
        { val: "valCha", a: "bonusbel", b: "bonusling" },
    ];

    const MAIN_MOD_MAP = [
        { val: "valAgi", mod: "modAgi" },
        { val: "valFor", mod: "modFor" },
        { val: "valInt", mod: "modInt" },
        { val: "valVon", mod: "modVon" },
        { val: "valApa", mod: "modApa" },
        { val: "valCha", mod: "modCha" },
    ];

    const RESIST_MAP = [
        { final: "geloResFinal", bonus: "geloResBonus" },
        { final: "choqueResFinal", bonus: "choqueResBonus" },
        { final: "fogoResFinal", bonus: "fogoResBonus" },
        { final: "fisicoResFinal", bonus: "fisicoResBonus" },
        { final: "menteResFinal", bonus: "menteResBonus" },
    ];

    if (!charLvl || !corpoVal || !menteVal || !almaVal) return;

    const num = v => Number(v || 0);

    function signed(v) {
        if (v > 0) return `+${v}`;
        if (v < 0) return `-${Math.abs(v)}`;
        return "0";
    }

    function updatePointsLeft() {
        if (!pointsLeft) return;
        pointsLeft.textContent =
            num(charLvl.value) -
            (num(corpoVal.value) + num(menteVal.value) + num(almaVal.value));
    }

    function updateMaxEXP() {
        if (!maxEXP) return;
        maxEXP.textContent = `EXP Max: ${num(charLvl.value) * 100}`;
    }

    function updateMaxPools() {
        const lvl = num(charLvl.value);

        if (maxSHP)
            maxSHP.textContent =
                `SHP Max: ${(num(conFinal?.textContent) * num(corpoVal.value)) + lvl}`;

        if (maxSTAM)
            maxSTAM.textContent =
                `Stamina Max: ${(num(effFinal?.textContent) * num(menteVal.value)) + lvl}`;

        if (maxDHP)
            maxDHP.textContent =
                `DHP Max: ${(num(resFinal?.textContent) * num(almaVal.value)) + lvl}`;
    }

    function updateMaxTraitValue() {
        if (!maxTraitValue) return;
        maxTraitValue.textContent =
            17 + num(charLvl.value) + num(traitBonus?.value);
    }

    function updateCurrentTraitValue() {
        if (!currentTraitValue) return;
        currentTraitValue.textContent =
            traitInputs.reduce((s, el) => s + num(el.value), 0);
    }

    function updateValStats() {
        VAL_MAP.forEach(({ val, a, b }) => {
            const el = document.getElementById(val);
            if (!el) return;
            el.textContent =
                num(document.getElementById(a)?.value) +
                num(document.getElementById(b)?.value);
        });
    }

    function updateTraitMods() {
        TRAIT_MAP.forEach(({ key, bonus }) => {
            const bonusEl = document.getElementById(bonus);
            const giftEl = document.getElementById(`Gift${key}`);
            const modEl = document.getElementById(`mod${key}`);

            if (!bonusEl || !modEl) return;

            let mod = num(bonusEl.value) - 4;
            if (giftEl?.checked && mod < 0) mod = 0;

            modEl.textContent = signed(mod);
        });
    }

    function updateMainTraitMods() {
        MAIN_MOD_MAP.forEach(({ val, mod }) => {
            const valEl = document.getElementById(val);
            const modEl = document.getElementById(mod);
            if (!valEl || !modEl) return;

            modEl.textContent = signed(num(valEl.textContent) - 4);
        });
    }

    // ✅ NOVA FUNÇÃO: RESISTÊNCIAS
    function updateResistances() {
        RESIST_MAP.forEach(({ final, bonus }) => {
            const finalEl = document.getElementById(final);
            const bonusEl = document.getElementById(bonus);
            if (!finalEl || !bonusEl) return;

            finalEl.textContent = 1 + num(bonusEl.value);
        });
    }

    function recalcAllSimple() {
        updatePointsLeft();
        updateMaxEXP();
        updateMaxPools();
        updateMaxTraitValue();
        updateCurrentTraitValue();
        updateValStats();
        updateTraitMods();
        updateMainTraitMods();
        updateResistances(); // ← NOVO
        // futuras contas simples aqui
    }

    [
        charLvl,
        corpoVal,
        menteVal,
        almaVal,
        traitBonus,
        ...traitInputs,
        ...TRAIT_MAP.map(t => document.getElementById(`Gift${t.key}`)),
        ...RESIST_MAP.map(r => document.getElementById(r.bonus)),
    ].filter(Boolean).forEach(el => {
        el.addEventListener("input", recalcAllSimple);
        el.addEventListener("change", recalcAllSimple);
    });

    const observer = new MutationObserver(recalcAllSimple);
    [conFinal, effFinal, resFinal].filter(Boolean).forEach(el =>
        observer.observe(el, { childList: true, subtree: true })
    );

    recalcAllSimple();
});
