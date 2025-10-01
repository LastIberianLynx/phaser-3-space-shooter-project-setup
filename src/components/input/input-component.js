

export class InputComponent {
    _up;
    _down;
    _left;
    _right;
    _shoot;
    constructor() {
        this.reset();
        // this._up = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    }  
    
    get leftIsDown() {
        return this._left;
    }
    get rightIsDown() {
        return this._right;
    }   
    get upIsDown() {
        return this._up;
    }           
    get downIsDown() {
        return this._down;
    }   
    get shootIsDown() {
        return this._shoot;
    }

    reset() {
        this._up = false;
        this._down = false;
        this._left = false;
        this._right = false;
        this._shoot = false;
    }




}