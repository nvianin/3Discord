class Avatar {
    constructor(x, y) {
        this.dom = document.createElement("div");
        this.dom.classList.add("custom_video");

        this.x = x;
        this.y = y;

        stage.appendChild(this.dom);
    }
}