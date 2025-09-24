// ===== Main state =====
const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");
const bufferCanvas=document.createElement("canvas");
bufferCanvas.width=canvas.width; bufferCanvas.height=canvas.height;
const bufferCtx=bufferCanvas.getContext("2d");

const widthInput=document.getElementById("width");
const colorInput=document.getElementById("color");
const simplifyInput=document.getElementById("simplify");

let tool="draw";
let paths = [];
let activePath = null;
let selectedPoint=null;
let handleMode=new Map();

let history=[], redoStack=[];

function saveState(){
  history.push(JSON.stringify(points));
  redoStack=[];
}
function undo(){
  if(history.length===0) return;
  redoStack.push(JSON.stringify(points));
  points=JSON.parse(history.pop());
  selectedPoint=null;
  rebuildBuffer(); redrawAll();
}
function redo(){
  if(redoStack.length===0) return;
  history.push(JSON.stringify(points));
  points=JSON.parse(redoStack.pop());
  selectedPoint=null;
  rebuildBuffer(); redrawAll();
}

// ===== Buttons =====
document.getElementById("drawTool").onclick=()=>{tool="draw";selectedPoint=null;redrawAll();};
document.getElementById("editTool").onclick=()=>{tool="edit";redrawAll();};
document.getElementById("undoBtn").onclick=undo;
document.getElementById("redoBtn").onclick=redo;

// Width & Color changes for selected point
widthInput.addEventListener("input", e=>{
  if(selectedPoint){
    selectedPoint.width = parseFloat(e.target.value);
    rebuildBuffer(); redrawAll();
  }
});

colorInput.addEventListener("input", e=>{
  if(selectedPoint){
    // convert hex to RGB
    const hex = e.target.value;
    selectedPoint.color = [
      parseInt(hex.slice(1,3),16),
      parseInt(hex.slice(3,5),16),
      parseInt(hex.slice(5,7),16)
    ];
    rebuildBuffer(); redrawAll();
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    if (activePath && activePath.points.length > 1) {
      paths.push(activePath);
    }
    activePath = { points: [], isClosed: false };
    selectedPoint = null;
  }
});