// ===== Rendering =====
const SEGMENTS = 100;

let isClosed = false;

function createPoint(x,y){
  const p = {
    x, y,
    cp1:{x:x, y:y},
    cp2:{x:x, y:y},
    width: parseFloat(widthInput.value),
    color: hexToRgb(colorInput.value),
    selected: 'anchor'
  };
  handleMode.set(p, 'aligned');
  return p;
}

function calculateSmoothHandle(points, index_point) {
  const tension = 0.33;
  const p = points[index_point];
  const prev = points[index_point - 1] || points[points.length - 1];
  const next = points[index_point + 1] || points[0];
  const vIn = {x: p.x - prev.x, y: p.y - prev.y};
  const vOut = {x: next.x - p.x, y: next.y - p.y};
  const lenIn = Math.hypot(vIn.x,vIn.y);
  const lenOut = Math.hypot(vOut.x,vOut.y);
  const tangent = normalize({x:(vIn.x/lenIn + vOut.x/lenOut), y:(vIn.y/lenIn + vOut.y/lenOut)});
  p.cp1 = {x: p.x - tangent.x * lenIn * tension, y: p.y - tangent.y * lenIn * tension};
  p.cp2 = {x: p.x + tangent.x * lenOut * tension, y: p.y + tangent.y * lenOut * tension};
  return p
}

function computeHandles(points, points_numbers) {
  calculateSmoothHandle(points, 0);
  for (let i=points.length-points_numbers-1; i<points.length; i++) {
    calculateSmoothHandle(points, i);
  }
  return points;
}

function drawSegment(ctx, p0, p1, segments=SEGMENTS){
  let prev = {x:p0.x, y:p0.y};
  for(let j=1;j<=segments;j++){
    const t=j/segments;
    const x=cubic(t,p0.x,p0.cp2.x,p1.cp1.x,p1.x);
    const y=cubic(t,p0.y,p0.cp2.y,p1.cp1.y,p1.y);
    const sw=lerp(t,p0.width,p1.width);
    const color=lerpColor(t,p0.color,p1.color);
    ctx.strokeStyle=color;
    ctx.lineWidth=sw;
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(prev.x,prev.y);
    ctx.lineTo(x,y);
    ctx.stroke();
    prev={x,y};
  }
}

function rebuildBuffer(excludeSet=new Set()){
  bufferCtx.clearRect(0,0,bufferCanvas.width, bufferCanvas.height);
  if(points.length<2) return;
  for(let i=0;i<points.length-1;i++){
    if(excludeSet.has(i)) continue;
    drawSegment(bufferCtx, points[i], points[i+1]);
  }
  if(isClosed && points.length>2){
    drawSegment(bufferCtx, points[points.length-1], points[0]);
  }
}

function redrawAll(){
  ctx.clearRect(0,0,canvas.width, canvas.height);
  ctx.drawImage(bufferCanvas, 0, 0);
  const activeIndices = new Set();
  if(tool==='edit' && selectedPoint){
    const idx = points.indexOf(selectedPoint);
    if(idx>0) activeIndices.add(idx-1);
    if(idx<points.length-1) activeIndices.add(idx);
  } else if(tool==='draw'){
    const last = points.length-2;
    if(last>=0) activeIndices.add(last);
  }
  activeIndices.forEach(i=>{
    if(i>=0 && i<points.length-1) drawSegment(ctx, points[i], points[i+1]);
  });
  if(tool==='edit') drawHandles();
}

function drawHandles(){
  ctx.save();
  points.forEach(p=>{
    ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2); 
    ctx.fillStyle = (p===selectedPoint)?'#1e90ff':'#2b8dbb'; ctx.fill();
    ctx.lineWidth=2; ctx.strokeStyle='#fff'; ctx.stroke();
    if(p===selectedPoint){
      ctx.strokeStyle='#888'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.cp1.x,p.cp1.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.cp2.x,p.cp2.y); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.cp1.x,p.cp1.y,5,0,Math.PI*2); ctx.fillStyle='#2ecc71'; ctx.fill(); ctx.strokeStyle='#fff'; ctx.stroke();
      ctx.beginPath(); ctx.arc(p.cp2.x,p.cp2.y,5,0,Math.PI*2); ctx.fillStyle='#e74c3c'; ctx.fill(); ctx.strokeStyle='#fff'; ctx.stroke();
    }
  });
  ctx.restore();
}