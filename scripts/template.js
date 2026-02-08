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
