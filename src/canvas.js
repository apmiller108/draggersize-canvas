import _ from 'underscore';
import CanvasShape from './canvas-shape';


class Canvas {
  constructor(canvasElem) {
    this.backgroundImage       = new Image();
    this.canvas                = canvasElem;
    this.width                 = this.canvas.width;
    this.height                = this.canvas.height;
    this.context               = this.canvas.getContext('2d');
    this.dirty                 = false; // when set to true, the canvas will be cleared and redrawn
    this.shapes                = [];
    this.shapeCount            = 0;
    this.selectedShape         = null;
    this.refreshRate           = 30; // Milliseconds
    this.html                  = document.body.parentNode;
    this.htmlTop               = this.html.offsetTop;
    this.htmlLeft              = this.html.offsetLeft;
    if (document.defaultView && document.defaultView.getComputedStyle) {
      this.stylePaddingLeft = this.initComputedStyleValue('paddingLeft');
      this.stylePaddingTop  = this.initComputedStyleValue('paddingTop');
      this.styleBorderLeft  = this.initComputedStyleValue('borderLeftWidth');
      this.styleBorderTop   = this.initComputedStyleValue('borderTopWidth');
    }
    this.initImageOnLoad();
    this.initCanvasEventListeners();
    this.initDrawing();
  }

  renderBackground(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.backgroundImage.src = e.target.result;
    };

    this.clear();
    reader.readAsDataURL(file);
  }

  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  clearSelectedShape() {
    if (this.selectedShape) {
      this.selectedShape.selected = false;
      this.selectedShape          = null;
      this.dirty                  = true;
    }
  }

  draw() {
    if (this.dirty) {
      this.clear();
      // Things drawn first are on the bottom layer.
      // Background is first since everything else is drawn on top of it.
      // Shapes drawn last are on the top layer.
      this.drawBackground();
      this.drawShapes();
      this.dirty = false;
    }
  }

  drawShapes() {
    _.each(this.shapes, (shape) => {
      shape.draw(this);
    });
  }

  drawBackground() {
    // Emulate CSS background size cover
    const imageRatio = this.backgroundImage.width / this.backgroundImage.height;
    const width      = this.height * imageRatio;
    const { height } = this;
    const offsetX    = (this.width - width) * 0.5;
    const offsetY    = 0;
    this.context.drawImage(
      this.backgroundImage, offsetX, offsetY, width, height
    );
  }

  initImageOnLoad() {
    this.backgroundImage.onload = () => { this.drawBackground(); };
  }

  initComputedStyleValue(style) {
    return parseInt(document.defaultView.getComputedStyle(this.canvas, null)[style], 10) || 0;
  }

  addNewShape(shape) {
    this.shapes.push(shape);
    this.dirty = true;
  }

  setCursorStyle() {
    if (this.selectedShape.activeResizeHandle) {
      const { cursorStyle } = this.selectedShape.activeResizeHandle;
      this.applyStyle('cursor', cursorStyle);
    } else {
      this.applyStyle('cursor', 'auto');
    }
  }

  applyStyle(style, value) {
    this.canvas.style[style] = value;
  }

  setSelectedShape(mousePosition) {
    this.clearSelectedShape(); // Clear the previously selectedShape
    // Find the new selectedShape. Search in reverse order so we find the last
    // drawn shape which would also be the topmost shape in case of overlap
    this.selectedShape = _.find(this.shapes.reverse(), shape => shape.contains(mousePosition));
    if (this.selectedShape) {
      this.selectedShape.dragging = true;
      this.selectedShape.clicked(mousePosition);
    }
    this.dirty                  = true;
  }

  getMousePosition(e) {
    let { canvas } = this;
    let offsetX    = 0;
    let offsetY    = 0;

    // Compute the total offset X and Y
    if (canvas.offsetParent !== undefined) {
      do {
        offsetX += canvas.offsetLeft;
        offsetY += canvas.offsetTop;
      } while ((canvas = canvas.offsetParent));
    }
    // Take into account thie padding and border when computing mouse position
    // Also add the <html> offsets in case there's a position:fixed bar
    offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    offsetY += this.stylePaddingTop  + this.styleBorderTop  + this.htmlTop;

    // Mouse X, Y coordinates (in pixels) after offset
    const mouseX        = e.pageX - offsetX;
    const mouseY        = e.pageY - offsetY;
    const mousePosition = { x: mouseX, y: mouseY };

    return mousePosition;
  }

  initCanvasEventListeners() {
    this.disableSelectStart();
    this.initMouseDownListener();
    this.initMouseMoveListener();
    this.initMouseUpListener();
    this.initDoubleClickListener();
  }

  disableSelectStart() {
    this.canvas.addEventListener('selectstart', (e) => {
      e.preventDefault();
      return false;
    }, true);
  }

  initMouseDownListener() {
    this.canvas.addEventListener('mousedown', (e) => {
      const mousePosition = this.getMousePosition(e);
      if (this.selectedShape && this.selectedShape.activeResizeHandle) {
        this.selectedShape.resizing = true;
        this.selectedShape.dragging = false;
      } else {
        this.setSelectedShape(mousePosition);
      }
    }, true);
  }

  initMouseMoveListener() {
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.selectedShape) {
        const mousePosition = this.getMousePosition(e);
        // Check if mouse position is on of the selectedShape's resize handles
        // and make it activate (show drag arrow)
        this.selectedShape.setActiveResizeHandle(mousePosition);
        this.setCursorStyle();

        if (this.selectedShape.dragging) {
          this.selectedShape.move(mousePosition);
        }
        if (this.selectedShape.resizing) {
          this.selectedShape.resize(mousePosition);
        }
      }
    }, true);
  }

  initMouseUpListener() {
    this.canvas.addEventListener('mouseup', () => {
      if (this.selectedShape) {
        this.selectedShape.dragging = false;
        this.selectedShape.resizing = false;
      }
    }, true);
  }

  initDoubleClickListener() {
    this.canvas.addEventListener('dblclick', (e) => {
      const mousePosition = this.getMousePosition(e);
      const mouseX        = mousePosition.x;
      const mouseY        = mousePosition.y;
      const existingShape = _.find(this.shapes.reverse(), shape => shape.contains(mousePosition));
      if (existingShape) {
        this.shapes = _.reject(this.shapes, shape => shape.id === existingShape.id);
        this.dirty = true;
      } else {
        const newShapeId = this.shapeCount + 1;
        const newShape = new CanvasShape(
          newShapeId, this, mouseX - 10, mouseY - 10, 60, 60, '#FF5F3D'
        );
        this.addNewShape(newShape);
        this.shapeCount += 1;
      }
    }, true);
  }

  initDrawing() {
    setInterval(() => { this.draw(); }, this.refreshRate);
  }
}

export { Canvas as default };
