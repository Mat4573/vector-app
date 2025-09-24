// ===== Drawing mode =====
let isDrawing = false;
let rawPoints = [];

canvas.addEventListener("mousedown", e=>{
  if(tool!=="draw") return;
  const mx = e.offsetX, my = e.offsetY;
  isDrawing = true;
  rawPoints = [{x: mx, y: my}];
  // If the point is too close from the last created point of the path, do not add it
  if (Math.hypot(mx - points[points.length - 1].x, my - points[points.length - 1].y) < 10) rawPoints = [];
  // If the point is close enough from the first created point of the path, close the path
  if (Math.hypot(mx - points[0].x, my - points[0].y) < 10) rawPoints = [];
});

canvas.addEventListener("mousemove", e => {
  if(tool !== "draw" || !isDrawing) return;
  rawPoints.push({x: e.offsetX, y: e.offsetY});
  ctx.clearRect(0, 0, canvas.width,canvas.height);
  ctx.drawImage(bufferCanvas, 0, 0);
  ctx.beginPath();
  ctx.moveTo(rawPoints[0].x, rawPoints[0].y);
  for(let i = 1; i < rawPoints.length; i++) ctx.lineTo(rawPoints[i].x, rawPoints[i].y);
  ctx.strokeStyle="rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
});

canvas.addEventListener("mouseup", e=>{
  if(tool !== "draw" || !isDrawing) return;
  isDrawing = false;
  const tol = parseFloat(simplifyInput.value);
  const simp=simplifyPath(rawPoints,tol);
  simp.forEach(pt=>points.push(createPoint(pt.x,pt.y)));
  computeHandles(points, simp.length);
  saveState();
  rebuildBuffer();
  redrawAll();
});