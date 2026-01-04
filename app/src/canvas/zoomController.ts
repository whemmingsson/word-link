export class ZoomController {
  zoom: number;
  panX: number;
  panY: number;
  isDragging: boolean;
  lastMouseX: number;
  lastMouseY: number;
  minZoom: number;
  maxZoom: number;
  constructor() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.minZoom = 0.5;
    this.maxZoom = 3;
  }

  applyTransform() {
    translate(this.panX, this.panY);
    scale(this.zoom);
  }

  handleZoom(delta: number, centerX: number, centerY: number) {
    const oldZoom = this.zoom;
    this.zoom -= delta * 0.001;
    this.zoom = constrain(this.zoom, this.minZoom, this.maxZoom);

    // Zoom towards mouse position
    const zoomChange = this.zoom - oldZoom;
    this.panX -= centerX * zoomChange;
    this.panY -= centerY * zoomChange;
  }

  startPan(x: number, y: number) {
    this.isDragging = true;
    this.lastMouseX = x;
    this.lastMouseY = y;
  }

  updatePan(x: number, y: number) {
    if (this.isDragging) {
      this.panX += x - this.lastMouseX;
      this.panY += y - this.lastMouseY;
      this.lastMouseX = x;
      this.lastMouseY = y;
    }
  }

  endPan() {
    this.isDragging = false;
  }

  // Convert screen coordinates to canvas coordinates
  screenToCanvas(x: number, y: number) {
    return {
      x: (x - this.panX) / this.zoom,
      y: (y - this.panY) / this.zoom,
    };
  }

  reset() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }
}
