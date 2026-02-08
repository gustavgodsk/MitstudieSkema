// merges two configs, user config overrides default
// also merges nested properties
function deepMerge(target, source) {
    // 1. Create a shallow copy of the target to avoid mutating it
    const result = { ...target };

    // 2. Iterate over source keys
    for (const key in source) {
        const sourceValue = source[key];
        const targetValue = result[key];

        // 3. If both are objects (and not null/arrays), recurse
        if (
            sourceValue &&
            typeof sourceValue === "object" &&
            !Array.isArray(sourceValue) &&
            targetValue &&
            typeof targetValue === "object" &&
            !Array.isArray(targetValue)
        ) {
            // Assign the RESULT of the merge to the key (don't use Object.assign on the value)
            result[key] = deepMerge(targetValue, sourceValue);
        } else {
            // Otherwise, simple overwrite
            result[key] = sourceValue;
        }
    }

    return result;
}

async function saveDeepSetting(path, value) {
    const storage = await chrome.storage.sync.get("DAT2Config");
    let DAT2Config = storage.DAT2Config || {};

    const parts = path.split(".");
    let current = DAT2Config;

    // Traverse the object until we reach the last key
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current)) current[part] = {};
        current = current[part];
    }

    // Set the final value
    current[parts[parts.length - 1]] = value;

    await chrome.storage.sync.set({ DAT2Config });
    console.log(`Updated storage at ${path} to:`, value);
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.DAT2Config) {
        const newOverrides = changes.DAT2Config.newValue || {};
        window.CONFIG = deepMerge(DEFAULT_CONFIG, newOverrides);

        // refresh UI (optional)
        window.dispatchEvent(
            new CustomEvent("configUpdated", { detail: window.CONFIG })
        );
    }
});

async function initializeGlobalConfig() {
    try {
        const storage = await chrome.storage.sync.get("DAT2Config");
        const userOverrides = storage.DAT2Config || {};

        let mergedConfig = deepMerge(DEFAULT_CONFIG, userOverrides);

        window.CONFIG = mergedConfig;
        window.dispatchEvent(
            new CustomEvent("configReady", { detail: mergedConfig })
        );
    } catch (error) {
        console.error("Failed to load DAT2 config: ", error);
    }
}

initializeGlobalConfig();
