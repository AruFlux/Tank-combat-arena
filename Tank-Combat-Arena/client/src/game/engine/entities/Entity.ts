import * as PIXI from 'pixi.js';

export class Entity {
  view: PIXI.Container;
  x: number;
  y: number;
  rotation: number;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.view = new PIXI.Container();
    this.view.position.set(x, y);
  }
  
  updateView() {
    this.view.position.set(this.x, this.y);
    this.view.rotation = this.rotation;
  }

  // Base update method to be overridden
  update(dt: number) {}
}
