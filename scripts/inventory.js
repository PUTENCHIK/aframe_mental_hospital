class InventorySystem {
    constructor(notification) {
        this.notification = notification;
        this.loadInventory();
        this.setupEventListeners();
        this.createInventorySlots();
        this.updateInventoryUI();
        this.removeTakenItemsFromScene();
    }

    loadInventory() {
        const saved = sessionStorage.getItem('inventory');
        this.inventory = saved ? JSON.parse(saved) : [];
    }

    hasItem(itemName) {

        let flag = false;

        this.inventory.forEach(item => {
            if (item["name"] == itemName) {
                flag = true;
            }
        });

        return flag
    }

    saveInventory() {
        sessionStorage.setItem('inventory', JSON.stringify(this.inventory));
        this.updateInventoryUI();
    }

    addItem(itemName, itemIcon) {
        if (!this.inventory.find(item => item.name === itemName)) {
            this.inventory.push({
                name: itemName,
                icon: itemIcon
            });
            this.saveInventory();
            this.notification.showNotification(`Получен: ${itemName}`);
        }
    }

    createInventorySlots() {
        const inventoryUI = document.getElementById('inventory-ui');
        inventoryUI.innerHTML = '';
        
        for (let i = 0; i < 6; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.id = `slot-${i}`;
            inventoryUI.appendChild(slot);
        }
    }

    updateInventoryUI() {
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.className = 'inventory-slot';
            slot.innerHTML = '';
        });
        
        this.inventory.forEach((item, index) => {
            const slot = document.getElementById(`slot-${index}`);
            if (slot) {
                slot.className = 'inventory-slot filled';
                slot.innerHTML = `<span class="item-icon">${item.icon}</span>`;
                slot.title = item.name;
            }
        });
    }

    setupEventListeners() {
        const scene = document.querySelector('a-scene');
        
        scene.addEventListener('click', (event) => {
            const target = event.target;

            if (target.classList.contains('collectable')) {
                const itemName = target.getAttribute('data-name');
                const itemIcon = target.getAttribute('data-icon');
                
                if (itemName) {
                    this.addItem(itemName, itemIcon);
                    target.parentNode.removeChild(target);
                }
            }
        });
    }

    removeTakenItemsFromScene() {
        this.inventory.forEach(item => {
            const itemElement = document.getElementById(item.name);
            if (itemElement) {
                itemElement.parentNode.removeChild(itemElement);
            }
        });
    }
};