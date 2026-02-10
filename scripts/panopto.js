{
    const url = new URL(window.location.href);

    function redirectToEmbed() {
        if (
            CONFIG.panopto.redirect_to_embed &&
            url.pathname.includes("Viewer.aspx")
        ) {
            let newPath = url.href.replace("Viewer.aspx", "Embed.aspx");

            window.location.href = newPath;
        }
    }

    window.addEventListener("configReady", () => {
        redirectToEmbed();
    });

    if (window.CONFIG) {
        redirectToEmbed();
    }
}
