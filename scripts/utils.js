// ===== Utility functions =====
function hexToRgb(hex) {
  const i = parseInt(hex.slice(1), 16);
  return [(i >> 16) & 255, (i >> 8) & 255, i & 255];
}

function rgbToHex(rgb) {
  return "#" + rgb.map(c => c.toString(16).padStart(2, "0")).join("");
}

function lerp(t, a, b) { return a + (b - a) * t; }

function lerpColor(t, c0, c1) {
  return `rgb(${Math.round(lerp(t,c0[0],c1[0]))},${Math.round(lerp(t,c0[1],c1[1]))},${Math.round(lerp(t,c0[2],c1[2]))})`;
}

function cubic(t, a, b, c, d) {
  const mt = 1 - t;
  return mt*mt*mt*a + 3*mt*mt*t*b + 3*mt*t*t*c + t*t*t*d;
}

function normalize(v) {
  const len = Math.hypot(v.x, v.y);
  return len === 0 ? {x:0,y:0} : {x:v.x/len, y:v.y/len};
}

// Ramer–Douglas–Peucker simplification
function simplifyPath(points, tolerance){
  if(points.length<3) return points;
  const getPerpDist=(p,p1,p2)=>{
    const dx=p2.x-p1.x, dy=p2.y-p1.y;
    if(dx===0 && dy===0) return Math.hypot(p.x-p1.x,p.y-p1.y);
    const t=((p.x-p1.x)*dx + (p.y-p1.y)*dy)/(dx*dx + dy*dy);
    const proj={x:p1.x+t*dx, y:p1.y+t*dy};
    return Math.hypot(p.x-proj.x,p.y-proj.y);
  };
  const rdp=(pts)=>{
    let maxDist=0,index=-1;
    for(let i=1;i<pts.length-1;i++){
      const d=getPerpDist(pts[i],pts[0],pts[pts.length-1]);
      if(d>maxDist){ maxDist=d; index=i; }
    }
    if(maxDist>tolerance){
      const left=rdp(pts.slice(0,index+1));
      const right=rdp(pts.slice(index));
      return left.slice(0,-1).concat(right);
    } else return [pts[0],pts[pts.length-1]];
  };
  return rdp(points);
}