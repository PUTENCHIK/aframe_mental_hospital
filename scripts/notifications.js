class Notifications {
    constructor() {
        this.notification = document.getElementById('notification');
    }

    showNotification(message) {
        this.notification.textContent = message;
        this.notification.style.display = 'block';
        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 3000);
    }
}