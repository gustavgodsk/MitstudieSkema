{
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

    /**
     * Splits keybind string (specified in cofig) into its individual keys
     */
    function getKeys(str) {
        const regex = /<([^>]+)>/g;
        const extracted = [];
        const cleanedStr = str.replace(regex, (_, p1) => {
            // Chord = contains a '-', meaning combined keypresses eg. Ctrl-c
            if (p1.includes("-")) {
                const parts = p1.split("-");
                extracted.push({
                    chord: true,
                    ctrl: parts.includes("Ctrl"),
                    alt: parts.includes("Alt"),
                    shift: parts.includes("Shift"),
                    key: parts[parts.length - 1].toLowerCase()
                });
            } else {
                extracted.push(p1); // Normal single key like <Enter>
            }
            return "";
        });

        return extracted.concat(cleanedStr.split(""));
    }

    function isMatch(event, expected) {
        if (typeof expected === "string") {
            return event.key === expected;
        }

        if (expected.chord) {
            return (
                event.ctrlKey === expected.ctrl &&
                event.altKey === expected.alt &&
                event.shiftKey === expected.shift &&
                event.key.toLowerCase() === expected.key
            );
        }
        return false;
    }

    function handleKeyPress(e) {
        clearTimeout(lastKeyPressedTimer);
        lastKeyPressedTimer = setTimeout(() => {
            resetIncrementedPointers();
        }, 3000);

        if (document.activeElement.tagName.toUpperCase() == "BODY") {
            handleActiveBodyExclusiveEvents(e);
        }

        if (isMatch(e, keyMap.get("remove_focus").next())) {
            handleKeyHit(keyMap.get("remove_focus"), () =>
                document.activeElement.blur()
            );
        }
    }

    function handleActiveBodyExclusiveEvents(e) {
        const bodyCommands = [
            { id: "left", fn: () => fnLeft(e) },
            { id: "down", fn: () => fnDown(e) },
            { id: "up", fn: () => fnUp(e) },
            { id: "right", fn: () => fnRight(e) },
            { id: "history_back", fn: () => history.back() },
            { id: "history_forward", fn: () => history.forward() },
            { id: "top", fn: () => fnTopOrBot() },
            { id: "bottom", fn: () => fnTopOrBot(true) },
            { id: "reload", fn: () => window.location.reload() }
        ];

        for (const cmd of bodyCommands) {
            const kb = keyMap.get(cmd.id);
            if (!kb) continue;

            const expected = kb.next();

            if (isMatch(e, expected)) {
                handleKeyHit(kb, cmd.fn);
                break;
            }
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
        if (!CONFIG.vim_motions.enabled) return;

        keyMap.clear();
        for (const [key, value] of Object.entries(
            CONFIG.vim_motions.keybindings
        )) {
            keyMap.set(key, new Keybinding(getKeys(value)));
        }

        document.addEventListener("keydown", (e) => {
            handleKeyPress(e);
        });
    }

    window.addEventListener("configReady", () => {
        setup();
    });

    if (window.CONFIG) {
        setup();
    }
}
