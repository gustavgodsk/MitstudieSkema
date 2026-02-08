let CONFIG = {};

function setup() {
    //
    // YOUR CODE HERE
    //
}

window.addEventListener("configReady", (e) => {
    CONFIG = e.detail;
    setup();
});

if (window.CONFIG) {
    CONFIG = e.detail;
    setup();
}
