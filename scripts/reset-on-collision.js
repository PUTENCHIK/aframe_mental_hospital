(function() {
    AFRAME.registerComponent('reset-on-collision', {
        schema: {
            // Selector to collide with
            with: {default: '.collision'},
            // Collider size
            colliderSize: {default: 0.5},
            // Smooth movement back when collision occurs
            smoothRecovery: {default: true},
            // How far to push back from collision
            pushBackDistance: {default: 0}
        },

        init: function() {
            // Set up collision geometry
            this.el.setAttribute('geometry', `width: ${this.data.colliderSize}; depth: ${this.data.colliderSize}; height: ${this.data.colliderSize}`);
            
            this.mesh = this.el.getObject3D('mesh');
            this.boundingBox = new THREE.Box3();
            this.collideWiths = this.el.sceneEl.querySelectorAll(this.data.with);
            
            this.lastKnownGoodPosition = new THREE.Vector3().copy(this.el.object3D.position);
            this.isColliding = false;
            this.collisionRecoverySpeed = 0.3;
        },

        tick: function () {
            if (!this.mesh) return;

            this.boundingBox.setFromObject(this.mesh);
            var thisMin = this.boundingBox.min;
            var thisMax = this.boundingBox.max;

            var currentPosition = new THREE.Vector3().copy(this.el.object3D.position);
            var collisionResult = this.checkCollision(thisMin, thisMax);

            if (collisionResult.colliding) {
                // Calculate push back direction
                var pushBackPosition = this.calculatePushBackPosition(currentPosition, collisionResult);
                
                if (this.data.smoothRecovery) {
                    // Smooth interpolation to push back position
                    var newPosition = new THREE.Vector3();
                    newPosition.lerpVectors(currentPosition, pushBackPosition, this.collisionRecoverySpeed);
                    this.el.setAttribute('position', newPosition);
                } else {
                    // Immediate push back
                    this.el.setAttribute('position', pushBackPosition);
                }
                
                // Update last known good position to push back position
                this.lastKnownGoodPosition.copy(pushBackPosition);
                this.isColliding = true;
            } else {
                // Only update last known good position if we're not recovering from collision
                if (!this.isColliding) {
                    this.lastKnownGoodPosition.copy(currentPosition);
                }
                this.isColliding = false;
            }
        },

        checkCollision: function(thisMin, thisMax) {
            for (var i = 0; i < this.collideWiths.length; i++) {
                var collideWith = this.collideWiths[i];
                var collideWithMesh = collideWith.getObject3D('mesh');
                
                if (!collideWithMesh) continue;

                var collideWithBoundingBox = new THREE.Box3().setFromObject(collideWithMesh);
                var collideWithMin = collideWithBoundingBox.min;
                var collideWithMax = collideWithBoundingBox.max;

                // AABB collision detection with small tolerance
                var tolerance = 0.01;
                var isColliding = (thisMin.x <= collideWithMax.x + tolerance && thisMax.x >= collideWithMin.x - tolerance) &&
                                 (thisMin.y <= collideWithMax.y + tolerance && thisMax.y >= collideWithMin.y - tolerance) &&
                                 (thisMin.z <= collideWithMax.z + tolerance && thisMax.z >= collideWithMin.z - tolerance);

                if (isColliding) {
                    return {
                        colliding: true,
                        collideWithBox: collideWithBoundingBox,
                        playerBox: new THREE.Box3().set(thisMin, thisMax)
                    };
                }
            }
            return {colliding: false};
        },

        calculatePushBackPosition: function(currentPosition, collision) {
            var pushBack = new THREE.Vector3().copy(currentPosition);
            var playerBox = collision.playerBox;
            var obstacleBox = collision.collideWithBox;
            
            // Calculate penetration depths in all directions
            var penX = Math.min(playerBox.max.x - obstacleBox.min.x, obstacleBox.max.x - playerBox.min.x);
            var penZ = Math.min(playerBox.max.z - obstacleBox.min.z, obstacleBox.max.z - playerBox.min.z);
            
            // Determine the direction with minimum penetration (the way we came from)
            if (Math.abs(penX) < Math.abs(penZ)) {
                // Push back in X direction
                if (playerBox.max.x - obstacleBox.min.x === penX) {
                    // Collision from right, push left
                    pushBack.x = obstacleBox.min.x - (playerBox.max.x - playerBox.min.x) / 2 - this.data.pushBackDistance;
                } else {
                    // Collision from left, push right
                    pushBack.x = obstacleBox.max.x + (playerBox.max.x - playerBox.min.x) / 2 + this.data.pushBackDistance;
                }
            } else {
                // Push back in Z direction
                if (playerBox.max.z - obstacleBox.min.z === penZ) {
                    // Collision from front, push back
                    pushBack.z = obstacleBox.min.z - (playerBox.max.z - playerBox.min.z) / 2 - this.data.pushBackDistance;
                } else {
                    // Collision from back, push forward
                    pushBack.z = obstacleBox.max.z + (playerBox.max.z - playerBox.min.z) / 2 + this.data.pushBackDistance;
                }
            }
            
            return pushBack;
        }
    });
})();