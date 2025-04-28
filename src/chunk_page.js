import { tileSet, setTileWeight } from "./logic.js";

// track which IDs to include
export const allowedChunks = new Set(tileSet.map(t=>t.id));

const gridTable = document.getElementById("grid-table");
if (!gridTable) {
  console.error("#grid-table not found");
} else {
  tileSet.forEach(tile => {
    const idx = tile.id;

    // container
    const item = document.createElement("div");
    item.classList.add("tile-item");

    // checkbox
    const cb = document.createElement("input");
    cb.type      = "checkbox";
    cb.id        = `chunk-${idx}`;
    cb.checked   = true;
    cb.dataset.id= idx;
    cb.addEventListener("change", ()=>{
      const i = Number(cb.dataset.id);
      if(cb.checked) {
        allowedChunks.add(i);
        slider.value = 1;
        setTileWeight(idx, 1);
      } else {
        allowedChunks.delete(i);
        slider.value = 0;
        setTileWeight(idx, 0);
      }          
    });

    // label + swatch + name
    const label = document.createElement("label");
    label.htmlFor = cb.id;
    label.classList.add("tile-label");

    const swatch = document.createElement("span");
    swatch.classList.add("tile-swatch");
    swatch.style.backgroundColor = `#${tile.color.toString(16).padStart(6,"0")}`;

    const name = document.createElement("span");
    name.classList.add("tile-name");
    name.textContent = tile.name;

    label.append(swatch, name);

    // slider
    const slider = document.createElement("input");
    slider.type       = "range";
    slider.min        = "0";
    slider.max        = "10";
    slider.value      = "1";
    slider.dataset.id = idx;
    slider.addEventListener("input", ()=>{
      setTileWeight(idx, Number(slider.value));
    });

    slider.addEventListener("change", () => {
      setTileWeight(idx, Number(slider.value));
      if (slider.value == 0) {
        cb.checked = false;
      } else {
        cb.checked = true;
      }
    })

    // assemble
    item.append(cb, label, slider);
    gridTable.append(item);
  });
}
