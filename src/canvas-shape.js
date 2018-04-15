import _ from 'underscore';
import CanvasShapeResizeHandle from './canvas-shape-resize-handle';

class CanvasShape {
  constructor(id, canvas, x = 0, y = 0, width = 1, height = 1, fill = '#AAAAAA') {
    this.id                  = id;
    this.canvas              = canvas;
    this.x                   = x;
    this.y                   = y;
    this.width               = width;
    this.height              = height;
    this.fill                = fill;
    this.mouseClickPositionX = 0;
    this.mouseClickPositionY = 0;
    this.selected            = false;
    this.selectedColor       = '#CC0000';
    this.selectedWidth       = 2;
    this.dragging            = false;
    this.resizing            = false;
    this.resizeHandles       = [];
    this.activeResizeHandle  = null;
    this.initResizeHandles();
  }

  // Determine if mouse coordinates are contained within shape's boundary
  contains(mousePosition) {
    const mouseX = mousePosition.x;
    const mouseY = mousePosition.y;

    return (this.x <= mouseX) &&
      (this.x + this.width >= mouseX) &&
      (this.y <= mouseY) &&
      (this.y + this.height >= mouseY);
  }

  clicked(mousePosition) {
    // Keep track of where in the object we clicked (setMouseClickPosition)
    // so we can move it smoothly
    this.setMouseClickPosition(mousePosition);
    this.selected = true;
  }

  setMouseClickPosition(mousePosition) {
    this.mouseClickPositionX = mousePosition.x - this.x;
    this.mouseClickPositionY = mousePosition.y - this.y;
  }

  move(mousePosition) {
    // Drag shapes from where they are clicked, not the lop-left.
    this.x = mousePosition.x - this.mouseClickPositionX;
    this.y = mousePosition.y - this.mouseClickPositionY;
    this.canvas.dirty = true; // Trigger redraw as the shape is moving
  }

  resize(mousePosition) {
    const mouseX    = mousePosition.x;
    const mouseY    = mousePosition.y;
    const originalX = this.x;
    const originalY = this.y;

    switch (this.activeResizeHandle.typeName) {
      case 'topLeft':
        this.x = mouseX;
        this.y = mouseY;
        this.width  += originalX - mouseX;
        this.height += originalY - mouseY;
        break;
      case 'topMiddle':
        this.y = mouseY;
        this.height += originalY - mouseY;
        break;
      case 'topRight':
        this.y = mouseY;
        this.width = mouseX - originalX;
        this.height += originalY - mouseY;
        break;
      case 'middleLeft':
        this.x = mouseX;
        this.width += originalX - mouseX;
        break;
      case 'middleRight':
        this.width = mouseX - originalX;
        break;
      case 'bottomLeft':
        this.x = mouseX;
        this.w += originalX - mouseX;
        this.height = mouseY - originalY;
        break;
      case 'bottomMiddle':
        this.height = mouseY - originalY;
        break;
      case 'bottomRight':
        this.width = mouseX - originalX;
        this.height = mouseY - originalY;
        break;
    }
    this.canvas.dirty = true; // Trigger redraw as the shape is resizing
  }

  // Shapes draw themselves on a canvas' context
  draw() {
    // Don't draw if shape has have moved off the canvas
    if (this.x > this.canvas.width || this.y > this.canvas.height ||
        this.x + this.width < 0 || this.y + this.height < 0) {
      return;
    }
    this.canvas.context.fillStyle = this.fill;
    this.canvas.context.fillRect(this.x, this.y, this.width, this.height);
    // Highlight after fill so it is on top
    if (this.selected) {
      this.highlightSelected();
      this.drawResizeHandles();
    }
  }

  highlightSelected() {
    this.canvas.context.strokeStyle = this.selectedColor;
    this.canvas.context.lineWidth   = this.selectedWidth;
    this.canvas.context.strokeRect(this.x, this.y, this.width, this.height);
  }

  drawResizeHandles() {
    _.each(this.resizeHandles, (resizeHandle) => {
      resizeHandle.draw(this, this.canvas);
    });
  }

  initResizeHandles() {
    _(8).times((index) => {
      this.resizeHandles.push(new CanvasShapeResizeHandle(this.canvas, index));
    });
  }

  setActiveResizeHandle(mousePosition) {
    if (!this.resizing) {
      this.activeResizeHandle = null;
      this.activeResizeHandle = _.find(this.resizeHandles, (handle) => {
        return handle.contains(mousePosition);
      });
    }
  }
}

export { CanvasShape as default };
