const chunks = [
    { name: "Village", color: '#ECB194'},
    { name: "Plain", color: '#BEE8A5'},
    { name: "Hill", color: '#9FAE8E'},
    { name: "Forest", color: '#60975C'},
    { name: "Sand", color: '#E8D897'},
    { name: "River", color: '#94BDEC'},
    { name: "Sea", color: '#618BBB'},
    { name: "Auto", color: '#565656'},
    { name: "Auto", color: '#565656'},
  ];
  
  const grid = document.getElementById("grid-table");
  
  if (grid) {
    chunks.forEach(chunk => {
    const div = document.createElement("div");
    div.id = "item";
  
    const color = document.createElement("div");
    color.id = "chunk-color"
    color.style.backgroundColor = chunk.color;
    
    const name = document.createElement("div");
    name.textContent = chunk.name;
    name.id = "chunk-name"
  
    div.appendChild(color);
    div.appendChild(name)
    grid.appendChild(div);
    });
  }