class NotificationManager {
    constructor(stage) {
        this.stage = stage;

        this.notifications = []

    }

    notify(type, text = "") {
        this.notifications.push(new Notif(text, type))

    }

}

class Notif {
    constructor(text, type) {
        this.text = text;
        this.type = type;

        this.dom = document.createElement('div');
        this.dom.classList.push("notif");
        let image = document.createElement('img');
        this.dom.appendChild(image);
        let textContent = document.createElement('div');
        textContent.innerText = this.text;

        notificationManager.stage.appendChild(this.dom);
    }
}