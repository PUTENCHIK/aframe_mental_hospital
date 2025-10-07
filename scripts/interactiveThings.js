class InteractiveThings {
    constructor(inventorySystem, notification) {
        this.notification = notification;
        this.inventorySystem = inventorySystem;
        this.loadUsedThings();
        this.setupEventListeners();
        this.removeUsedThingsFromScene();
    }

    loadUsedThings() {
        const saved = sessionStorage.getItem('usedThings');
        this.usedThings = saved ? JSON.parse(saved) : [];
    }

    saveUsedThings() {
        sessionStorage.setItem('usedThings', JSON.stringify(this.usedThings));
    }

    addThing(thingName) {
        if (!this.usedThings.find(item => item.name === thingName)) {
            this.usedThings.push({
                name: thingName
            });
            this.saveUsedThings();
        }
    }

    setupEventListeners() {
        const scene = document.querySelector('a-scene');
    
        scene.addEventListener('click', (event) => {
            const target = event.target;

            if (target.classList.contains('interactive')) {
                const items = target.getAttribute('data-inventory-items').split(" ");
                let success = true;
                let neededItem = "";
                let itemForInteractive;
                items.forEach(item => {
                    itemForInteractive = Object.values(this.inventorySystem.inventory).find((packItem) => packItem.name == item)
                    
                    if (!itemForInteractive) {
                        success = false;
                        neededItem = item;
                    }

                });

                if (success) {
                    const thingName = target.getAttribute('data-name'); 
                    this.addThing(thingName)
                    target.emit('use');
                    setTimeout(() => {
                        if (target.parentNode) {
                            target.parentNode.removeChild(target);
                        }
                    }, 2000);
                    
                }
                else {
                    this.notification.showNotification(`Вам нужен: ${neededItem}`);
                }
            }
        });
    }

    removeUsedThingsFromScene() {
        this.usedThings.forEach(item => {
            const thingElement = document.getElementById(item.name);
            if (thingElement) {
                thingElement.parentNode.removeChild(thingElement);
            }
        });
    }
}