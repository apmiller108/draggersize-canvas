import $ from 'jquery';
import Canvas from './canvas';

class DraggerSize {
  constructor(canvasElem) {
    this.canvas    = new Canvas(canvasElem);
    this.fileInput = $('#image-input');
  }
  setBackground(file) {
    this.canvas.renderBackground(file);
  }
}

$(() => {
  const draggerSize = new DraggerSize(document.getElementById('canvas'));
  draggerSize.fileInput.on('change', (e) => {
    draggerSize.setBackground(e.target.files[0]);
  });
});
