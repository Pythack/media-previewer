browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.request) {
        case "get-status":
            if (localStorage.activated == "true") {
                sendResponse({activated: true});
            } else {
                sendResponse({activated: false});
            }
            break;
    }
});

setInterval(() => {
    var getstorage = browser.storage.local.get();
    getstorage.then(response => {
        if (response.disactivated) {
            localStorage.activated = false;
        } else {
            localStorage.activated = true;
        }
    });
}, 100);

browser.browserAction.onClicked.addListener(() => {
    var getstorage = browser.storage.local.get();
    getstorage.then(response => {
        if (response.disactivated) {
            browser.storage.local.set({disactivated: false});
            browser.browserAction.setIcon({path: browser.runtime.getURL('./iconactive.png')});
        } else {
            browser.storage.local.set({disactivated: true});
            browser.browserAction.setIcon({path: browser.runtime.getURL('./icondisabled.png')});
        }
    });
});