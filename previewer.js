var activated = true;

setInterval(() => {
    const askforstatus = browser.runtime.sendMessage({request:"get-status"})
    askforstatus.then((response) => {
        activated = response.activated;
    });
}, 1000);

let prevdiv = document.createElement("div");
prevdiv.id = "media-preview-div";
let previmg = document.createElement("img");
previmg.addEventListener("error", () => {
    prevdiv.style.display = "none";
});
prevdiv.appendChild(previmg);
document.body.appendChild(prevdiv);
var timeout;


function hidePreview() {
    previmg.src = "";
    prevdiv.style.display = "none";
}


function onhoverupdate(event) {
    clearTimeout(timeout);
    let hovel = event.target;
    if (!(hovel.localName == "a" || hovel.id == "media-preview-div" || (hovel.offsetParent && hovel.offsetParent.id == "media-preview-div"))) {
        hidePreview();
        return;
    }
    let posx = event.clientX;
    let posy = event.clientY;
    localStorage.setItem("posx", posx);
    localStorage.setItem("posy", posy);
    timeout = setTimeout(() => {
        let displayed = false;
        if (/^.*\.(png|jpg|jpeg|webp)$/.test(hovel.href.toLowerCase()) && activated) { // If URL ends with image extensions and extension activated
            previmg.src = hovel.href;
            prevdiv.style.position = "fixed";
            prevdiv.style.top = (posy + 10).toString() + "px";
            prevdiv.style.left = (posx + 10).toString() + "px";
            prevdiv.style.background = "repeating-conic-gradient(#404040 0% 25%, #ffffff 0% 50%) 50% / " + 10 + "px " + 10 + "px";
            prevdiv.style.display = "block";
            displayed = true;
        }
    }, 300);
}

document.addEventListener("mousemove", onhoverupdate);