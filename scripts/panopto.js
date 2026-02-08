let CONFIG = {};
const url = new URL(window.location.href);

function redirectToEmbed() {
    if (CONFIG.redirect_to_embed && url.pathname.includes("Viewer.aspx")) {
        let newPath = url.href.replace("Viewer.aspx", "Embed.aspx");

        window.location.href = newPath;
    }
}

window.addEventListener("configReady", (e) => {
    CONFIG = e.detail.panopto;
    redirectToEmbed();
});

if (window.CONFIG) {
    CONFIG = e.detail.panopto;
    redirectToEmbed();
}
