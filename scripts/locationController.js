class LocationController {

    constructor(currentLocation) {
        this.currentLocation = currentLocation;
        this.loadLastLocation(currentLocation);
    }

    loadLastLocation(currentLocation) {
        const saved = sessionStorage.getItem('lastLocation');
        this.lastLocation = saved ? JSON.parse(saved) : currentLocation;
    }

    updateLastLocation() {
        sessionStorage.setItem('lastLocation', JSON.stringify(this.currentLocation));
    }
}