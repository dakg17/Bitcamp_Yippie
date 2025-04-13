const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const clearBtn = document.getElementById("clear");
const saveBtn = document.getElementById("save");
const enhanceBtn = document.getElementById("enhance");
const brushSizeBtn = document.getElementById("brushSizeButton");
const brushSizeContainer = document.getElementById("brushSizeContainer");
const brushSizeSlider = document.getElementById("brushSizeSlider");
const brushSizeDisplay = document.getElementById("brushSizeDisplay");
const toggleDrawingBtn = document.getElementById("toggleDrawing");
const video = document.getElementById("video");

const relVideoWidth = 0.2;
const relVideoHeight = relVideoWidth * 1.33333333;
let currentTool = "draw";
let isDrawing = false;
let lastX = 0, lastY = 0;
let brushColor = "#000";
let isCalibrated = false;
brushSizeSlider.value = 1;
let brushSize = brushSizeSlider.value;
brushSizeContainer.style.display = 'none';

let smoothedX = window.innerWidth / 2;
let smoothedY = window.innerHeight / 2;

let drawingEnabled = true;

video.setAttribute('width', window.innerWidth * relVideoWidth);
video.setAttribute('height', window.innerHeight * relVideoHeight);

const smoothingFactor = 0.15;
const drawCooldown = 120;
let lastDrawTime = Date.now();

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

colorPicker.addEventListener("change", (e) => brushColor = e.target.value);

document.querySelectorAll("[data-tool]").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.id != "brushSizeButton") {
      currentTool = btn.dataset.tool;
    }
  });
});

clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

saveBtn.addEventListener("click", () => { // Currently just takes the drawing and adds the image to the html document
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eye-sketch.png";
    a.click();
  });
});

brushSizeBtn.addEventListener("click", function () {
  toggleBrushSizeDiv();
});

brushSizeSlider.addEventListener("change", (event) => {
  brushSize = event.target.value;
  brushSizeDisplay.textContent = brushSize;
});

toggleDrawingBtn.addEventListener("click", () => {
  drawingEnabled = !drawingEnabled;
  toggleDrawingBtn.textContent = drawingEnabled ? "✋ Pause Drawing" : "✅ Resume Drawing";
});

function onPoint(point, calibration) {
  if (!calibration && drawingEnabled) {
    const targetX = point[0];
    const targetY = point[1];
    ctx.lineWidth = brushSize;

    smoothedX += (targetX - smoothedX) * smoothingFactor;
    smoothedY += (targetY - smoothedY) * smoothingFactor;

    const now = Date.now();

    if (currentTool === "draw") {
      if (now - lastDrawTime > drawCooldown) {
        ctx.strokeStyle = brushColor;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(smoothedX, smoothedY);
        ctx.stroke();
        lastX = smoothedX;
        lastY = smoothedY;
        lastDrawTime = now;
      }
    } else if (currentTool === "erase") {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = brushColor;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(smoothedX, smoothedY);
      ctx.stroke();
      lastX = smoothedX;
      lastY = smoothedY;
      lastDrawTime = now;
      ctx.globalCompositeOperation = 'source-over';
    }
  }
}

const gestures = new EyeGestures('video', onPoint);
if (gestures && gestures.hideWatermark) {
  gestures.hideWatermark();
}
gestures.start();

function toggleBrushSizeDiv() {
  if (brushSizeContainer.style.display === "block") {
    brushSizeContainer.style.display = "none";
  } else {
    brushSizeContainer.style.display = "block";
  }
}
