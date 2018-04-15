class CanvasShapeResizeHandle {
  constructor(canvas, type, width = 5, height = 5, fill = '#FF5F3D') {
    this.HandleTypeProperties = {
      0: {
        name: 'topLeft',
        cursorStyle: 'nw-resize'
      },
      1: {
        name: 'topMiddle',
        cursorStyle: 'n-resize'
      },
      2: {
        name: 'topRight',
        cursorStyle: 'ne-resize'
      },
      3: {
        name: 'middleLeft',
        cursorStyle: 'w-resize'
      },
      4: {
        name: 'middleRight',
        cursorStyle: 'e-resize'
      },
      5: {
        name: 'bottomLeft',
        cursorStyle: 'sw-resize'
      },
      6: {
        name: 'bottomMiddle',
        cursorStyle: 's-resize'
      },
      7: {
        name: 'bottomRight',
        cursorStyle: 'se-resize'
      }
    };
    Object.freeze(this.HandleTypeProperties);

    this.canvas              = canvas;
    this.type                = type;
    this.typeName            = this.HandleTypeProperties[type].name;
    this.cursorStyle         = this.HandleTypeProperties[type].cursorStyle;
    this.x                   = 0;
    this.y                   = 0;
    this.width               = width;
    this.height              = height;
    this.fill                = fill;
    this.selectedColor       = '#CC0000';
    this.selectedWidth       = 2;
  }

  draw(shape, canvas) {
    const { context } = canvas;
    this.setPosition(shape);
    context.fillStyle = this.fill;
    context.fillRect(this.x, this.y, this.width, this.height);
    context.strokeStyle = this.selectedColor;
    context.lineWidth   = this.selectedWidth;
    context.strokeRect(this.x, this.y, this.width, this.height);
  }

  setPosition(shape) {
    switch (this.typeName) {
      case 'topLeft':
        this.x = CanvasShapeResizeHandle.positionLeft(shape);
        this.y = CanvasShapeResizeHandle.positionTop(shape);
        break;
      case 'topMiddle':
        this.x = CanvasShapeResizeHandle.positionXMiddle(shape);
        this.y = CanvasShapeResizeHandle.positionTop(shape);
        break;
      case 'topRight':
        this.x = CanvasShapeResizeHandle.positionRight(shape);
        this.y = CanvasShapeResizeHandle.positionTop(shape);
        break;
      case 'middleLeft':
        this.x = CanvasShapeResizeHandle.positionLeft(shape);
        this.y = CanvasShapeResizeHandle.positionYMiddle(shape);
        break;
      case 'middleRight':
        this.x = CanvasShapeResizeHandle.positionRight(shape);
        this.y = CanvasShapeResizeHandle.positionYMiddle(shape);
        break;
      case 'bottomLeft':
        this.x = CanvasShapeResizeHandle.positionLeft(shape);
        this.y = CanvasShapeResizeHandle.positionBottom(shape);
        break;
      case 'bottomMiddle':
        this.x = CanvasShapeResizeHandle.positionXMiddle(shape);
        this.y = CanvasShapeResizeHandle.positionBottom(shape);
        break;
      case 'bottomRight':
        this.x = CanvasShapeResizeHandle.positionRight(shape);
        this.y = CanvasShapeResizeHandle.positionBottom(shape);
        break;
    }
  }

  contains(mousePosition) {
    // Determine if mouse coordinates are contained within the handle's boundary
    const mouseX = mousePosition.x;
    const mouseY = mousePosition.y;

    return (this.x <= mouseX) &&
      (this.x + this.width >= mouseX) &&
      (this.y <= mouseY) &&
      (this.y + this.height >= mouseY);
  }

  static positionLeft(shape) {
    return shape.x - shape.selectedWidth;
  }

  static positionRight(shape) {
    return shape.x + (shape.width - shape.selectedWidth);
  }

  static positionTop(shape) {
    return shape.y - shape.selectedWidth;
  }

  static positionBottom(shape) {
    return shape.y + (shape.height - shape.selectedWidth);
  }

  static positionXMiddle(shape) {
    return shape.x + ((shape.width / 2) - shape.selectedWidth);
  }

  static positionYMiddle(shape) {
    return shape.y + ((shape.height / 2) - shape.selectedWidth);
  }
}

export { CanvasShapeResizeHandle as default };
