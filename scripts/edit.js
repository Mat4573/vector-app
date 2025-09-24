// ===== Edit mode =====
const click_tol = 10;

canvas.addEventListener("mousedown", e=>{
  if(tool!=="edit") return;
  const mx=e.offsetX,my=e.offsetY;

  if (Math.hypot(mx - selectedPoint.cp1.x, my - selectedPoint.cp1.y) < click_tol) {
    selectedPoint.selected = 'cp1';
    return;
  } else if (Math.hypot(mx - selectedPoint.cp2.x, my - selectedPoint.cp2.y) < click_tol) {
    selectedPoint.selected = 'cp2';
    return;
  } else {
    find: {
      for (const path of paths) {
        for (const p of path.points) {
          if (Math.hypot(mx - p.x, my - p.y) < click_tol) {
            selectedPoint = p;
            selectedPoint.selected = 'anchor'
            widthInput.value = selectedPoint.width;
            colorInput.value = `#${selectedPoint.color.map(c=>c.toString(16).padStart(2,'0')).join('')}`;
            activePath = path;
            break find;
          }
        }
      }
      selectedPoint = null;
      activePath = null;
    }
  }
  redrawAll();
});

canvas.addEventListener("mousemove", e => {
  if (tool !== "edit" || !selectedPoint) return;
  const p = selectedPoint.point;
  if (selectedPoint.selected === "anchor") {
    const dx = e.offsetX - p.x, dy = e.offsetY - p.y;
    p.x += dx; p.y += dy;
    p.cp1.x += dx; p.cp1.y += dy;
    p.cp2.x += dx; p.cp2.y += dy;
  } else if (selectedPoint.selected === "cp1") {
    p.cp1 = {x: e.offsetX, y: e.offsetY};
    if (handleMode.get(p) === "aligned"){
      const dx = p.x - p.cp1.x, dy = p.y - p.cp1.y, len = Math.hypot(p.cp2.x - p.x, p.cp2.y - p.y);
      const n = normalize({x: dx, y: dy});
      p.cp2 = {x: p.x + n.x * len, y: p.y + n.y * len};
    }
  } else if (selectedPoint.selected === "cp2") {
    p.cp2 = {x: e.offsetX, y: e.offsetY};
    if (handleMode.get(p) === "aligned") {
      const dx = p.x - p.cp2.x, dy = p.y - p.cp2.y, len = Math.hypot(p.cp1.x - p.x, p.cp1.y - p.y);
      const n = normalize({x: dx, y: dy});
      p.cp1 = {x: p.x + n.x * len, y: p.y + n.y * len};
    }
  }
  rebuildBuffer();
  redrawAll();
});

canvas.addEventListener("mouseup", e=>{
  if(tool!=="edit") return;
  if(selectedPoint) saveState();
});

canvas.addEventListener("dblclick", e => {
  if (tool !== "edit") return;
  const mx = e.offsetX, my = e.offsetY;
  for (const p of points){
    if (Math.hypot(mx - p.x, my - p.y) < click_tol) {
      const mode = handleMode.get(p) === "aligned"?"free":"aligned";
      handleMode.set(p, mode);
      redrawAll();
      break;
    }
  }
});