var activated = true;

const askforstatus = browser.runtime.sendMessage({request:"get-status"})
askforstatus.then(async (response) => {
    activated = await response;
});

browser.runtime.onMessage.addListener((message) => {
    switch (message.request) {
        case "update-enable":
            activated = message.activated? true:false;
            break;
        default:
            break;
    }
});

var prevdiv = document.createElement("div");
prevdiv.id = "media-preview-div";
var prevdims = document.createElement("p");
var previmgdiv = document.createElement("div");
previmgdiv.id = "media-preview-img-div";
var previmg = document.createElement("img");
previmg.addEventListener("error", () => {
    prevdiv.style.display = "none";
});
previmgdiv.appendChild(previmg);
prevdiv.appendChild(prevdims);
prevdiv.appendChild(previmgdiv);
document.body.appendChild(prevdiv);
var timeout;
var timeouthide;


function hidePreview() {
    previmg.src = "";
    prevdiv.style.display = "none";
}

function updateDimensions(event) {
    const width = event.target.naturalWidth;
    const height = event.target.naturalHeight;
    prevdims.innerText = width.toString() + "x" + height.toString();
}

async function getMIME(url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('HEAD', url, true);

        xhr.onload = function() {
            var contentType = xhr.getResponseHeader('Content-Type');
            resolve(contentType);
        };

        xhr.onerror = function () {
            reject();
        }

        xhr.send();
    });
}

function onhoverupdate(event) {
    clearTimeout(timeout);
    let hovel = event.target;
    if (!(hovel.localName == "a" || hovel.id == "media-preview-div" || (hovel.offsetParent && hovel.offsetParent.id == "media-preview-div"))) {
        if (timeouthide == null) {
            timeouthide = setTimeout(hidePreview, 300);
        }
        return;
    }
    clearTimeout(timeouthide);
    timeouthide = null;
    if (hovel.localName != "a") {
        return;
    }
    let posx = event.clientX;
    let posy = event.clientY;
    timeout = setTimeout(async () => {
        const url = hovel.href;
        let mimetype = await getMIME(url);
        if (/^image\/(png|jpg|jpeg|webp)$/.test(mimetype.toLowerCase()) && (prevdiv.style.display == "none" || localStorage.prevlink != url) && activated) { // If URL ends with image extensions and extension activated
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            hidePreview();
            previmg.src = url;
            previmg.onload = updateDimensions;
            prevdiv.style.position = "fixed";
            const offset = 10;
            if (posy >= vh/2) {
                prevdiv.style.bottom = (vh - posy + offset).toString() + "px";
                prevdiv.style.top = "";
            } else {
                prevdiv.style.top = (posy + offset).toString() + "px";
                prevdiv.style.bottom = "";
            }
            if (posx >= vw/2) {
                prevdiv.style.right = (vw - posx + offset).toString() + "px";
                prevdiv.style.left = "";
            } else {
                prevdiv.style.left = (posx + offset).toString() + "px";
                prevdiv.style.right = "";
            }
            // prevdiv.style.background = "repeating-conic-gradient(#404040 0% 25%, #ffffff 0% 50%) 50% / " + 10 + "px " + 10 + "px";
            prevdiv.style.display = "block";
            localStorage.prevlink = url;
        }
    }, 300);
}

document.addEventListener("mousemove", onhoverupdate);