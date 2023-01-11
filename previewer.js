if (typeof browser === "undefined") {
    var browser = chrome;
}

var activated = true; // Variable indicating if extension is enabled or not

const askforstatus = browser.runtime.sendMessage({request:"get-status"}) // Ask for extension status
askforstatus.then(async (response) => {
    activated = await response; // Set activated to status
});

browser.runtime.onMessage.addListener((message) => { // Listen for messages
    switch (message.request) {
        case "update-enable": // If extension has been enabled/disabled
            activated = message.activated? true:false; // Update activated
            break;
        default:
            break;
    }
});

// Create preview element
var prevdiv = document.createElement("div");
prevdiv.id = "media-preview-div";
var prevdims = document.createElement("p");
var previmgdiv = document.createElement("div");
previmgdiv.id = "media-preview-img-div";
var previmg = document.createElement("img");
previmg.addEventListener("error", (event) => {
    if (event.target.style.display == "block") {
        prevdiv.style.display = "none";
    }
});
var prevvid = document.createElement("video");
prevvid.controls = true;
prevvid.addEventListener("error", (event) => {
    if (event.target.style.display == "block") {
        prevdiv.style.display = "none";
    }
});
var prevvidsrc = document.createElement("source");
var prevpdf = document.createElement("object");
prevpdf.type = "application/pdf";
prevvid.appendChild(prevvidsrc);
previmgdiv.appendChild(previmg);
previmgdiv.appendChild(prevvid);
previmgdiv.appendChild(prevpdf);
prevdiv.appendChild(prevdims);
prevdiv.appendChild(previmgdiv);
document.body.appendChild(prevdiv);
var timeout;
var timeouthide;


function hidePreview() { // Function to hide the preview
    previmg.src = "";
    prevdiv.style.display = "none";
}

function updateDimensions(event) { // Adds the dimensions of the image on the preview
    const width = event.target.naturalWidth;
    const height = event.target.naturalHeight;
    prevdims.innerText = width.toString() + "x" + height.toString();
}

async function getMIME(url) { // Make a HTTP request to get Mime type of file
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

function getTheLink(el) {
    if (!el) {
        return null;
    }
    if (el.tagName == "A") {
        return el;
    }
    return getTheLink(el.parentNode);
}

function onhoverupdate(event) { // When mouse hovers an element
    clearTimeout(timeout); // Clear the previous timeout
    let hovel = getTheLink(event.target); // Get the hovered element
    if (!((hovel != null && hovel.tagName == "A") || event.target.id == "media-preview-div" || (event.target.offsetParent != null && event.target.offsetParent.id == "media-preview-div"))) { // If the hovered element is neither a link, or an element on the preview
        if (timeouthide == null) { // If timeout to hiding the previous is not set
            timeouthide = setTimeout(hidePreview, 300); // Set timeout to hide preview
        }
        return; // Abort
    }
    clearTimeout(timeouthide); // If the element passed the tests: abort hide preview timeout
    timeouthide = null; // Set it to null
    if (hovel == null || hovel.tagName != "A") { // If it is not a link, abort
        return;
    }
    let posx = event.clientX; // Get position of mouse
    let posy = event.clientY;
    timeout = setTimeout(async () => { // Set timeout to show preview
        const url = hovel.href; // Get the url the link points to
        getMIME(url).then(mimetype => { // Get mime type of file
            if ((prevdiv.style.display == "none" || localStorage.prevlink != url) && activated) { // If the preview is not hidden or the link changed and the extension is activated
                const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0); // Get dimensions of the viewport
                const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
                hidePreview(); // Hide the preview while it is updated
                prevdiv.style.position = "fixed"; // Set position to fixed
                // Decide where to place the preview depending on the position of the mouse in the viewport
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
                previmg.style.display = "none"; // Hide image previewer
                prevvid.style.display = "none"; // Hide video previewer
                prevpdf.style.display = "none"; // Hide pdf previewer
                if (/^image\/(png|jpg|jpeg|webp)$/.test(mimetype.toLowerCase())) { // If file is an image
                    previmg.src = url; // Set the source to the url
                    previmg.onload = updateDimensions; // Update the dimensions
                    previmg.style.display = "block"; // Display image previewer
                    prevdiv.style.display = "block"; // Display preview
                    localStorage.prevlink = url; // Store link to compare later
                } else if (/^video\/(mp4|x-matroska|avi)$/.test(mimetype.toLowerCase())) { // If file is a video
                    prevvidsrc.src = url; // Set the source to the url
                    prevvidsrc.type = mimetype; // Set the type to the MIME type
                    prevvid.load(); // Load video
                    prevdims.innerText = ""; // Hide dimensions (because dimension feature for video is not available yet)
                    prevvid.style.display = "block"; // Display video previewer
                    prevdiv.style.display = "block"; // Display preview
                    localStorage.prevlink = url; // Store link to compare later
                } else if (/^application\/(pdf)$/.test(mimetype.toLowerCase())) {
                    prevpdf.data = url;
                    prevpdf.type = mimetype;
                    prevpdf.width = Math.round(vw/2).toString() + "px";
                    prevpdf.height = Math.round(vh/2).toString() + "px";
                    prevdims.innerText = "";
                    prevpdf.style.display = "block";
                    prevdiv.style.display = "block";
                    localStorage.prevlink = url;
                }
            }
        }).catch(error => {});
    }, 300);
}

document.addEventListener("mousemove", onhoverupdate);