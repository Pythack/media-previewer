if (typeof browser === "undefined") {
    var browser = chrome;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.request) {
        case "get-status":
            sendResponse(new Promise(async function (resolve, reject) {
                let storage = await browser.storage.local.get();
                if (storage.disactivated) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }));
            break;
    }
});

function sendToAllTabs(object) {
    browser.tabs.query({}).then((result) => {
        result.forEach((tab) => {
            browser.tabs.sendMessage(tab.id, object);
        });
    });
}

browser.browserAction.onClicked.addListener(() => {
    var getstorage = browser.storage.local.get();
    getstorage.then(response => {
        if (response.disactivated) {
            browser.storage.local.set({disactivated: false});
            sendToAllTabs({request: "update-enable",activated: true});
            browser.browserAction.setIcon({path: browser.runtime.getURL('./iconactive.png')});
        } else {
            browser.storage.local.set({disactivated: true});
            sendToAllTabs({request: "update-enable",activated: false});
            browser.browserAction.setIcon({path: browser.runtime.getURL('./icondisabled.png')});
        }
    });
});