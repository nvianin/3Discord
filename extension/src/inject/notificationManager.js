class NotificationManager {
    constructor(stage) {
        this.stage = stage;

        this.notifications = []

    }
}

class Notification {
    constructor(text, type = "") {
        this.text = text;
        this.type = type;
    }
}