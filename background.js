if (typeof browser === "undefined") {
    var browser = chrome;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.request) {
        case "get-status": // When a new page is loaded
            sendResponse(new Promise(async function (resolve, reject) {
                let storage = await browser.storage.local.get(); // Get local storage to see if extension is enabled or not
                if (storage.deactivated) { // If deactivated
                    resolve(false); // Send back activated as false
                } else {
                    resolve(true); // Send back activated as true
                }
            }));
            break;
    }
});

function sendToAllTabs(object) {
    browser.tabs.query({}).then((result) => { // Get all tabs
        result.forEach((tab) => { // For each tab
            if (/^((chrome|about):\/\/.*|$|https:\/\/chrome\.google\.com\/webstore.*|undefined)/.test(tab.url)) {
            } else {
                browser.tabs.sendMessage(tab.id, object); // Send message to tab
            }
        });
    });
}

browser.action.onClicked.addListener(() => { // When the browser action is clicked
    var getstorage = browser.storage.local.get(); // Get storage
    getstorage.then(response => {
        if (response.deactivated) { // If deactivated
            browser.storage.local.set({deactivated: false}); // Set to false
            sendToAllTabs({request: "update-enable",activated: true}); // Send update to tabs
            browser.action.setIcon({path: browser.runtime.getURL('./iconactive.png')}); // Update icon
        } else {
            browser.storage.local.set({deactivated: true}); // Set to true
            sendToAllTabs({request: "update-enable",activated: false}); // Send update to tabs
            browser.action.setIcon({path: browser.runtime.getURL('./icondisabled.png')}); // Update icon
        }
    });
});