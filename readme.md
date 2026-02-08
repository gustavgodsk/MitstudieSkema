# <img src="./icons/2icon48.png" style="vertical-align: middle;"> DAT2AU (browser extension)

Quality of life improvements til datalogi på AU. Virker på Chrome og Firefox.

* **Mitstudie:** forbedret skema på [mitstudie.au.dk](https://mitstudie.au.dk)
* **Panopto:** automatisk redirect til Embed view på [panopto](https://au.cloud.panopto.eu/Panopto/Pages/)
* **Vim motions:** basic vim motions i browseren

<img width="1893" height="1035" alt="image" src="https://github.com/user-attachments/assets/cb55f845-f577-43ad-8d6c-8ff53c0f8c5f" />

# Download guide

Download filerne og gem i mappe

### Chrome
1. Gå til chrome://extensions i Chrome
2. Sæt *Udviklertilstand* til oppe i højre hjørne
3. Tryk *Indlæs upakket*
4. Vælg mappen
5. Tryk på genindlæs-pilen

### Firefox
1. Gå til about:debugging#/runtime/this-firefox i Firefox
2. Tryk *Læs midlertidig tilføjelse*
3. Find mappen og vælg *manifest.json*
4. Tryk *Genindlæs*

# Tilpasning

Tryk på extension-ikonet for at gå til config-siden.

# Contributing


**1.** Opret ny fil `myscript.js` i `scripts/` mappen

Brug `scripts/template.js` til at komme i gang:
```javascript
let CONFIG = {};

function setup() {
    if (!CONFIG.enabled) return;
    //
    // YOUR CODE HERE
    //
}

window.addEventListener("configReady", (e) => {
    CONFIG = e.detail.myscript;
    setup();
});

if (window.CONFIG) {
    CONFIG = e.detail.myscript;
    setup();
}
```

**2.** Tilføj default config i `config/config.default.js`:

```javascript
const DEFAULT_CONFIG = {
    // ...
    myscript: {
        enabled: true,
        // add more options...
    }
}
```

**3.** Registrer script og URL matches i `manifest.json`
```json
"content_scripts": [
    // previous scripts...
    {
        "js": [
            "config/config.default.js",
            "config/config.loader.js",
            "scripts/myscript.js"
        ],
        "matches": ["https://example.com/*"]
    },
],
```
> Vigtigt: `config/config.default.js` og `config/config.loader.js` skal altid inkluderes i den rækkefølge for at dit script får adgang til config-filen

**4.** Lav pull request på GitHub
