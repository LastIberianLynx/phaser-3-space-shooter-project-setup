

export class GunComponent {
    constructor(parentContainer, gunSpriteKey, offset = {x: 0, y: 0}, scale = 0.2) {
        this.parent = parentContainer;
        this.gun = parentContainer.scene.add.sprite(offset.x, offset.y, gunSpriteKey);
        this.gun.setOrigin(0.5, 0.5);
        parentContainer.add(this.gun);
        parentContainer.bringToTop(this.gun);
        this.offset = offset;
        this.gun.setDepth(4);
        this.gun.setScale(scale);


    }

    rotateTowards(target) {
    // Get the gun's world position
        const gunWorldX = this.parent.x + this.gun.x;
        const gunWorldY = this.parent.y + this.gun.y;

        const dx = target.x - gunWorldX;
        const dy = target.y - gunWorldY;
        const angleToTarget = Math.atan2(dy, dx);

        // Subtract the parent's rotation so the gun's local rotation is correct
        this.gun.rotation = angleToTarget - this.parent.rotation;
    }

    getGunDirection() {
        // Returns a normalized direction vector the gun is facing
        return {
            x: Math.cos(this.gun.rotation),
            y: Math.sin(this.gun.rotation)
        };
    }
}