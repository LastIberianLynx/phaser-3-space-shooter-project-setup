
export class PathMovementComponent {
    constructor(gameObject, checkpoints, speed = 50) {
        this.gameObject = gameObject;
        this.checkpoints = checkpoints; // Array of {x, y}
        this.speed = speed;
        this.currentIndex = 0;
    }

    update() {
        if (!this.checkpoints || this.currentIndex >= this.checkpoints.length) return;

        const target = this.checkpoints[this.currentIndex];
        const dx = target.x - this.gameObject.x;
        const dy = target.y - this.gameObject.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2) {
            // Arrived at checkpoint
            this.gameObject.body.setVelocity(0, 0);
            this.currentIndex++;
            return;
        }

        // Normalize direction and set velocity

        const vx = (dx / distance) * this.speed;
        const vy = (dy / distance) * this.speed;
        this.gameObject.body.setVelocity(vx, vy);

        // Set rotation to face movement direction (Phaser uses radians)
        
        this.gameObject.rotation = Math.atan2(vy, vx) - Math.PI / 2; //
    }
}