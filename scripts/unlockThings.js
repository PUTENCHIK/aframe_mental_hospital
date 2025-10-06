class UnlockThings {
    constructor(inventorySystem, interactiveThings, notification) {
        this.notification = notification;
        this.inventorySystem = inventorySystem;
        this.interactiveThings = interactiveThings;
    }

    checkUnlock(checkElement) {
        const target = checkElement;

        if (target.classList.contains('unlock')) {
            const items = target.getAttribute('data-inventory-items').split(" ");
            let successItem = true;
            let neededItem = "";
            let itemForInteractive;
            items.forEach(item => {
                itemForInteractive = Object.values(this.inventorySystem.inventory).find((packItem) => packItem.name == item)
                
                if (!itemForInteractive) {
                    successItem = false;
                    neededItem = item;
                }

            });

            if (!successItem) {
                this.notification.showNotification(`Вам нужен: ${neededItem}`);
                return false;
            }

            const interactive = target.getAttribute('data-interactive-things').split(" ");
            let successInteractive = true;
            let neededInteractive = "";
            let interactiveThing;

            interactive.forEach(thing => {
                interactiveThing = Object.values(this.interactiveThings.usedThings).find((interactiveItem) => interactiveItem.name == thing)
                
                if (!interactiveThing) {
                    successInteractive = false;
                    neededInteractive = thing;
                }

            });


            if (!successInteractive) {
                this.notification.showNotification(`Вам нужно провзаимодействовать с ${neededInteractive}`);
                return false;
            }

            return true;
        }

        return false;
    }
}