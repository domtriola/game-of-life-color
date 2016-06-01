var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var gridRows = 60;
var gridColumns = 60;
var cellWidth = canvas.width / gridColumns;
var cellHeight = canvas.height / gridRows;
var grid = [];

var domIntensity = 2;
var recIntensity = 2;
var midIntensity = 50;

function colorDominant(number) {	
	if (number < 255 - domIntensity)
		number += domIntensity;
	else
		number = 255;
	return number
}

function colorRecessive(number) {
	if (number > recIntensity)
		number -= recIntensity;
	else
		number = 0;
	return number
}

function colorMid(number) {
	var newColor = number;
	var change = Math.floor(Math.random()*midIntensity);
	
	if (Math.floor(Math.random() * 2))
		newColor += change;
	else
		newColor -= change;
	
	if (newColor <= 255 && newColor >= 0)
		return newColor;
	else {
		return colorMid(number);
	}
	
}

function setGrid(rows, columns) {
	for (r=0; r<rows; r++) {
		grid[r] = []
		for (c=0; c<columns; c++) {
			grid[r][c] = {
				x: c*cellWidth, 
				y: r*cellHeight, 
				isAlive: 0, 
				willBe: 0,
				r: null,
				g: null,
				b: null,
				r2: null,
				g2: null,
				b2: null
			}
		}
	}
	return grid;
}

var grid = setGrid(gridRows, gridColumns);

function drawGrid() {
	for (r=0; r<grid.length; r++) {
		for (c=0; c<grid[r].length; c++) {
			//name cell for easier reference
			var cell = grid[r][c];

			//draw cell
			ctx.beginPath();
			ctx.rect(cell.x, cell.y, cellWidth, cellHeight);
			ctx.strokeStyle = "#aaa";
			ctx.stroke();
			if(cell.isAlive) {
				ctx.fillStyle = "rgb("+cell.r+","+cell.g+","+cell.b+")";
				ctx.fill();
			}
			ctx.closePath();
		}
	}
}

//No life beyond walls (does not act like a torus)
function runLife() {

	//determine whether cells will be alive or dead
	for (r=0; r<grid.length; r++) {
		for (c=0; c<grid[r].length; c++) {
			//name cell for easier reference
			var cell = grid[r][c];
			//count live neighbors
			var count = 0;
			
			var parents = [];
			//for non-edge cases
			for (i=r-1; i<r+2; i++) {
				for (j=c-1; j<c+2; j++) {	

					//setup edge variables
					var leftEdge = 0, rightEdge = 0, topEdge = 0, bottomEdge = 0;

					if (i<0)
						leftEdge = 1;
					else if (i > gridRows - 1)
						rightEdge = 1;
					if (j<0)
						topEdge = 1;
					else if (j > gridColumns - 1)
						bottomEdge = 1;

					if (!(leftEdge || rightEdge || topEdge || bottomEdge)) {
						if (grid[i][j].isAlive && !(i==r && j==c)) {
							count+=1;
							parents = parents.concat({r: grid[i][j].r, g: grid[i][j].g, b: grid[i][j].b});
						}
					}

					/*
					//fill in if statements for torus effect
					if (leftEdge && topEdge) {
					} else if (leftEdge && bottomEdge) {
					} else if (leftEdge) {
					} else if (rightEdge && topEdge) {
					} else if (rightEdge && bottomEdge) {
					} else if (rightEdge) {
					} else if (topEdge) {
					} else if (bottomEdge) {
					} else {
						if (grid[i][j].isAlive && !(i==r && j==c)) {
							count+=1;
							parents = parents.concat({r: grid[i][j].r, g: grid[i][j].g, b: grid[i][j].b});
						}
					}
					*/			
				}
			}

			if (cell.isAlive) {	
				if (count > 1 && count < 4) {
					cell.r2 = cell.r;
					cell.g2 = cell.g;
					cell.b2 = cell.b;
					cell.willBe = 'alive';
				} else
					cell.willBe = 'dead';
			} else if (count == 3) {
				var newR = 0, newG = 0, newB = 0;
				
				//find averages for parent rgb values
				for (var i = 0; i < count; i++) {
					newR += parents[i].r;
					newG += parents[i].g;
					newB += parents[i].b;
				}
				newR = Math.floor(newR / parents.length);
				newB = Math.floor(newB / parents.length);
				newG = Math.floor(newG / parents.length);

				if (newR > newG && newR > newB)
					newR = colorDominant(newR);
				else if (newG > newR && newG > newB)
					newG = colorDominant(newG);
				else if (newB > newR && newB > newG)
					newB = colorDominant(newB);

				if (newR < newG && newR < newB)
					newR = colorRecessive(newR);
				else if (newG < newR && newG < newB)
					newG = colorRecessive(newG);
				else if (newB < newR && newB < newG)
					newB = colorRecessive(newB);

				if (newR > newG && newR < newB)
					newR = colorMid(newR);
				else if (newR < newG && newR > newB)
					newR = colorMid(newR);
				else if (newG > newR && newG < newB)
					newG = colorMid(newG);
				else if (newG < newR && newG > newB)
					newG = colorMid(newG);
				else if (newB > newR && newB < newG)
					newB = colorMid(newB);
				else if (newB < newR && newB > newG)
					newB = colorMid(newB);

				cell.r2 = newR;
				cell.g2 = newG;
				cell.b2 = newB;

				cell.willBe = 'alive';
			} else
				cell.willBe = 'dead';
		}
	}


	//assign willBe states to isAlive state
	for (r=0; r<grid.length; r++) {
		for (c=0; c<grid[r].length; c++) {
			//name cell for easier reference
			var cell = grid[r][c];
			if (cell.willBe == 'alive') {
				cell.r = cell.r2;
				cell.g = cell.g2;
				cell.b = cell.b2;
				cell.isAlive = 1;
			} else
				cell.isAlive = 0;
		}
	}

}

//draw initial grid
drawGrid();

t=0;

function draw() {
	if (t == 4) { 
		ctx.clearRect(0,0,canvas.width, canvas.height);
		drawGrid();
		runLife();
		t=0;
	} else
		t++;

	requestAnimationFrame(draw);
}

function step() {
	ctx.clearRect(0,0,canvas.width, canvas.height);
	runLife();
	drawGrid();
}

function clearGrid() {
	for (r=0; r<grid.length; r++) {
		for (c=0; c<grid[r].length; c++) {
			grid[r][c].isAlive = 0;
			grid[r][c].willBe = 0;
		}
	}
	step();
}

/* Options
***************/

function randomColors() {
	for (r=0; r<grid.length; r++) {
		for (c=0; c<grid[r].length; c++) {
			//name cell for easier reference
			var cell = grid[r][c];

			ctx.beginPath();
			ctx.rect(cell.x, cell.y, cellWidth, cellHeight);
			ctx.strokeStyle = "#aaa";
			ctx.stroke();
			if(cell.isAlive) {
				var iniR = Math.floor((Math.random() * 255)+1);
				var iniG = Math.floor((Math.random() * 255)+1);
				var iniB = Math.floor((Math.random() * 255)+1);

				cell.r = iniR;
				cell.g = iniG;
				cell.b = iniB;
				
				ctx.fillStyle = "rgb("+cell.r+","+cell.g+","+cell.b+")";
				ctx.fill();
			}
			ctx.closePath();
		}
	}
}

function randomGrid() {
	for (r=0; r<grid.length; r++) {
		for (c=0; c<grid[r].length; c++) {
			//randomly set initial life (at 50% chance to be alive)
			var iniAlive = Math.floor(Math.random()*2);
			grid[r][c].isAlive = iniAlive;
		}
	}
	randomColors();
}

//starting positions
function block() {
	grid[Math.floor(gridRows/2-1)][Math.floor(gridColumns/2-1)].isAlive = 1;
	grid[Math.floor(gridRows/2)][Math.floor(gridColumns/2-1)].isAlive = 1;
	grid[Math.floor(gridRows/2-1)][Math.floor(gridColumns/2)].isAlive = 1;
	grid[Math.floor(gridRows/2)][Math.floor(gridColumns/2)].isAlive = 1;
	randomColors();
}

function beehive() {
	grid[Math.floor(gridRows/2-1)][Math.floor(gridColumns/2-2)].isAlive = 1;
	grid[Math.floor(gridRows/2)][Math.floor(gridColumns/2-2)].isAlive = 1;
	grid[Math.floor(gridRows/2-2)][Math.floor(gridColumns/2-1)].isAlive = 1;
	grid[Math.floor(gridRows/2+1)][Math.floor(gridColumns/2-1)].isAlive = 1;
	grid[Math.floor(gridRows/2-1)][Math.floor(gridColumns/2)].isAlive = 1;
	grid[Math.floor(gridRows/2)][Math.floor(gridColumns/2)].isAlive = 1;
	randomColors();
}

function line() {
	for (c=0; c<gridColumns; c++)
		grid[Math.floor(gridRows/2-1)][c].isAlive = 1;
	randomColors();
}

function rPentomino() {
	grid[Math.floor(gridRows/2-1)][Math.floor(gridColumns/2-1)].isAlive = 1;
	grid[Math.floor(gridRows/2)][Math.floor(gridColumns/2-1)].isAlive = 1;
	grid[Math.floor(gridRows/2-1)][Math.floor(gridColumns/2)].isAlive = 1;
	grid[Math.floor(gridRows/2-2)][Math.floor(gridColumns/2)].isAlive = 1;
	grid[Math.floor(gridRows/2-1)][Math.floor(gridColumns/2+1)].isAlive = 1;
	randomColors();
}




