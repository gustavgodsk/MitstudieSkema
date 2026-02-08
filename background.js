// lytter om du klikker på extension ikonet og åbner options-siden
chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});
