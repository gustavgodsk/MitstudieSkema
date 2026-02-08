let CONFIG = {};

const SCROLL_AMOUNT = 100;
const keyMap = new Map();
const incrementedPointers = new Set();
let lastKeyPressedTimer = null;

class Keybinding {
    constructor(keys) {
        this.keys = keys;
        this.pointer = 0;
    }

    reset() {
        this.pointer = 0;
    }

    next() {
        return this.keys[this.pointer];
    }
}

//splits keybind string (specified in cofig) into its individual keys
//side effect: keys inside <key> are pushed to the front of the sequence
function getKeys(str) {
    // split by < >
    const regex = /<([^>]+)>/g;
    const extracted = [];
    const cleanedStr = str.replace(regex, (_, p1) => {
        extracted.push(p1);
        return "";
    });

    // split by letter
    const keys = extracted.concat(cleanedStr.split(""));

    return keys;
}

function handleKeyPress(e) {
    clearTimeout(lastKeyPressedTimer);
    lastKeyPressedTimer = setTimeout(() => {
        resetIncrementedPointers();
    }, 3000);

    if (document.activeElement.tagName.toUpperCase() == "BODY") {
        handleActiveBodyExclusiveEvents(e);
    }

    if (e.key == keyMap.get("remove_focus").next()) {
        handleKeyHit(keyMap.get("remove_focus"), () =>
            document.activeElement.blur()
        );
    }
}

function handleActiveBodyExclusiveEvents(e) {
    switch (e.key) {
        case keyMap.get("left").next():
            handleKeyHit(keyMap.get("left"), () => fnLeft(e));
            break;
        case keyMap.get("down").next():
            handleKeyHit(keyMap.get("down"), () => fnDown(e));
            break;
        case keyMap.get("up").next():
            handleKeyHit(keyMap.get("up"), () => fnUp(e));
            break;
        case keyMap.get("right").next():
            handleKeyHit(keyMap.get("right"), () => fnRight(e));
            break;
        case keyMap.get("history_back").next():
            handleKeyHit(keyMap.get("history_back"), () => history.back());
            break;
        case keyMap.get("history_forward").next():
            handleKeyHit(keyMap.get("history_forward"), () =>
                history.forward()
            );
            break;
        case keyMap.get("top").next():
            handleKeyHit(keyMap.get("top"), () => fnTopOrBot());
            break;
        case keyMap.get("bottom").next():
            handleKeyHit(keyMap.get("bottom"), () => fnTopOrBot(true));
            break;
    }
}

const fnLeft = (e) => {
    scrollByDirection(-1, 0, e.repeat);
};

const fnDown = (e) => {
    scrollByDirection(0, 1, e.repeat);
};

const fnUp = (e) => {
    scrollByDirection(0, -1, e.repeat);
};

const fnRight = (e) => {
    scrollByDirection(1, 0, e.repeat);
};

const fnTopOrBot = (bottom = false) => {
    let opts = {
        top: bottom ? document.body.scrollHeight : 0,
        left: 0,
        behavior: "instant"
    };

    window.scrollTo(opts);
};

function resetIncrementedPointers() {
    for (const kb of incrementedPointers) {
        kb.reset();
    }
    incrementedPointers.clear();
}

function handleKeyHit(kb, cb) {
    kb.pointer++;
    const isTerminatingKey = kb.pointer >= kb.keys.length;

    incrementedPointers.add(kb);

    if (!isTerminatingKey) return;

    resetIncrementedPointers();
    cb();
}

function scrollByDirection(xDir, yDir, isRepeating) {
    let behavior = isRepeating ? "instant" : "smooth";
    let top = yDir * SCROLL_AMOUNT;
    let left = xDir * SCROLL_AMOUNT;
    window.scrollBy({ top, left, behavior });
}

function setup() {
    if (!CONFIG.enabled) return;

    keyMap.clear();
    for (const [key, value] of Object.entries(CONFIG.keybindings)) {
        keyMap.set(key, new Keybinding(getKeys(value)));
    }

    document.addEventListener("keydown", (e) => {
        handleKeyPress(e);
    });
}

window.addEventListener("configReady", (e) => {
    CONFIG = e.detail.vim_motions;
    setup();
});

if (window.CONFIG) {
    CONFIG = e.detail.vim_motions;
    setup();
}
