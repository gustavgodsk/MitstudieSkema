// Listens for extension icon click event (to open options page)
chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});
