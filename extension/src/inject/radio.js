let src = `<iframe width="560" height="315" src="https://www.youtube.com/embed/5qap5aO4i9A" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`


window.addEventListener('load', () => {
    let vid = document.createElement('iframe');
    vid.innerHTML = src;
    vid.width = 560
    vid.height = 315
    vid.src = "https://www.youtube.com/embed/5qap5aO4i9A?"
    vid.baseURL = vid.src
    console.log(vid.baseURL);
    vid.frameborder = "0"

    vid.style.pointerEvents = "none"
    vid.style.userSelect = "none"
    vid.style.zIndex = -1000;
    vid.volume = .2;
    document.body.appendChild(vid)
})