// storage.js
import { tileWeights, setTileWeight, tileSet, grid } from "./logic.js";
import { allowedChunks } from "./chunk_page.js";

// ─── Save settings to localStorage ───
export function saveSettings(){
  const settings = {
    weights: tileWeights,
    allowed: Array.from(allowedChunks),
  };
  localStorage.setItem("mapSettings", JSON.stringify(settings));
}

// ─── Load settings from localStorage ───
export function loadSettings(){
  const raw = localStorage.getItem("mapSettings");
  if (!raw) return;
  try {
    const settings = JSON.parse(raw);

    // Restore tileWeights
    if (settings.weights){
      for (const id in settings.weights){
        setTileWeight(Number(id), settings.weights[id]);
      }
    }

    // Restore allowedChunks
    if (settings.allowed){
      allowedChunks.clear();
      settings.allowed.forEach(id => allowedChunks.add(id));
    }
  } catch(e) {
    console.error("Failed to load settings", e);
  }
}

// ─── Optionally save the grid (advanced bonus) ───
export function saveGrid(){
  const snapshot = grid.map(row => 
    row.map(cell => ({
      collapsed: cell.collapsed,
      possible: [...cell.possible],
    }))
  );
  localStorage.setItem("gridData", JSON.stringify(snapshot));
}

// ─── Optionally load the grid (advanced bonus) ───
export function loadGrid(){
  const raw = localStorage.getItem("gridData");
  if (!raw) return;
  try {
    const snapshot = JSON.parse(raw);
    for (let y=0; y<snapshot.length; y++){
      for (let x=0; x<snapshot[y].length; x++){
        grid[y][x].collapsed = snapshot[y][x].collapsed;
        grid[y][x].possible  = snapshot[y][x].possible;
      }
    }
  } catch(e){
    console.error("Failed to load grid", e);
  }
}

// ─── Save grid to file ───
export function exportGridToFile(seed){
    const snapshot = {
      seed: seed,
      grid: grid.map(row => 
        row.map(cell => ({
          collapsed: cell.collapsed,
          possible: [...cell.possible],
        }))
      )
    };
    const blob = new Blob([JSON.stringify(snapshot)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "map_export.json";
    a.click();
    
    URL.revokeObjectURL(url);
  }
  
// ─── Load grid from uploaded file ───
export function importGridFromFile(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = function(event){
      try {
        const snapshot = JSON.parse(event.target.result);

        // Restore grid
        const importedGrid = snapshot.grid;
        if (!importedGrid) throw new Error("No grid data found");

        for (let y=0; y<importedGrid.length; y++){
          for (let x=0; x<importedGrid[y].length; x++){
            grid[y][x].collapsed = importedGrid[y][x].collapsed;
            grid[y][x].possible  = importedGrid[y][x].possible;
            grid[y][x].drawn     = false;
          }
        }

        // Optionally, return the seed
        resolve(snapshot.seed); // 👈 resolve with seed too
      } catch(e){
        console.error("Failed to import grid", e);
        reject(e);
      }
    };
    reader.readAsText(file);
  });
}
