{
    function setup() {
        if (!CONFIG.myscript.enabled) return;
        //
        // YOUR CODE HERE
        //
    }

    window.addEventListener("configReady", () => {
        setup();
    });

    if (window.CONFIG) {
        setup();
    }
}
