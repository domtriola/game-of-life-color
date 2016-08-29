"use strict";

function Game(canvasId, options) {
	this.canvas = document.getElementById(canvasId);
	this.context = this.canvas.getContext('2d');
	this.rows = options['rows'];
	this.columns = options['columns'];
	this.grid = new Grid(this.rows, this.columns);
	this.cellWidth = this.canvas.width / this.columns;
	this.cellHeight = this.canvas.height / this.rows;
	this.autoStepping = true;
}
Game.prototype.draw = function() {
	var ctx = this.context;
	var cellWidth = this.cellWidth;
	var cellHeight = this.cellHeight;
	ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.grid.space.forEach(function(row, i) {
		row.forEach(function(cell, j) {
			ctx.beginPath();
			ctx.rect(i*cellWidth, j*cellHeight, cellWidth, cellHeight);
			ctx.strokeStyle = "#ccc";
			ctx.stroke();
			if(cell.state) {
				ctx.fillStyle = "rgb("+cell.rgb[0]+","+cell.rgb[1]+","+cell.rgb[2]+")";
				ctx.fill();
			}
			ctx.closePath();
		});
	});
}
Game.prototype.setGrid = function() {
	for (var i=0; i < this.grid.columns; i++) {
		for (var j=0; j < this.grid.rows; j++)
			this.grid.set(new Vector(i, j), new Cell(new Vector(i, j)));
	}
	this.draw(this.grid);
}
Game.prototype.turn = function() {
	this.grid.space.forEach(function(row, i) {
		row.forEach(function(cell, j) {
			this.grid.space[i][j].getNeighbors();
		}, this);
	}, this);
	this.grid.space.forEach(function(row, i) {
		row.forEach(function(cell, j) {
			this.grid.space[i][j].checkNeighbors();
		}, this);
	}, this);
	this.grid.space.forEach(function(row, i) {
		row.forEach(function(cell, j) {
			this.grid.space[i][j].state = this.grid.space[i][j].nextState;
			this.grid.space[i][j].rgb = this.grid.space[i][j].nextRgb;
		}, this);
	}, this);
}
Game.prototype.play = function() {
	while (this.autoStepping)
		this.draw(this.grid);
}

function Vector(x, y) {
	this.x = x;
	this.y = y;
}
Vector.prototype.plus = function(other) {
	return new Vector(this.x + other.x, this.y + other.y);
}

function Grid(rows, columns) {
	this.space = (new Array(rows));
	for (var i=0; i < rows; i++)
		this.space[i] = (new Array(columns));
	this.columns = columns;
	this.rows = rows;
}
Grid.prototype.isInside = function(vector) {
  return vector.x >= 0 && vector.x < this.columns &&
         vector.y >= 0 && vector.y < this.rows;
};
Grid.prototype.get = function(vector) {
	return this.space[vector.x][vector.y];
};
Grid.prototype.set = function(vector, value) {
	this.space[vector.x][vector.y] = value;
};

var directions = {
  "n":  new Vector(0, -1),
  "ne": new Vector(1, -1),
  "e":  new Vector(1, 0),
  "se": new Vector(1, 1),
  "s":  new Vector(0, 1),
  "sw": new Vector(-1, 1),
  "w":  new Vector(-1, 0),
  "nw": new Vector(-1, -1)
};

function View(game, vector) {
	this.game = game;
	this.vector = vector;
}
View.prototype.look = function(dir) {
	var target = this.vector.plus(directions[dir]);
	if (this.game.grid.isInside(target))
		return this.game.grid.get(target);
	else
		return null;
}

function Cell(vector) {
	this.state = 0;
	this.nextState = 0;
	this.rgb = null;
	this.nextRgb = null;
	this.neighbors = [];
	this.vector = vector;
}
Cell.prototype.getNeighbors = function() {
	this.neighbors = [];
	var view = new View(game, this.vector);
	for (var dir in directions) {
		this.neighbors.push(view.look(dir));
	}
};
Cell.prototype.checkNeighbors = function() {
	var neighborCount = 0;
	var neighborColors = [];
	var edgeDeath = 0;
	for (var i = 0; i < this.neighbors.length; i++) {
		var neighbor = this.neighbors[i];
		if (neighbor == null) {
			this.nextRgb = null;
			this.nextState = 0;
			var edgeDeath = 1;
			break;
		} else if (neighbor.state) {
			neighborCount++;
			neighborColors.push(neighbor.rgb);
		}
	}
	if (!edgeDeath) {
		if (this.state == 0) {
			if (neighborCount == 3) {
				this.nextState = 1;
				this.nextRgb = this.assignColor(neighborColors);
			}
		} else if (!(neighborCount == 2 || neighborCount ==3)) {
			this.nextState = 0;
			this.nextRgb = null;
		} else {
			this.nextState = 1;
			this.nextRgb = this.rgb;
		}
	}
};
Cell.prototype.colorRandom = function() {
	this.rgb = [randRgb(), randRgb(), randRgb()];
};
Cell.prototype.assignColor = function(neighborColors) {
	var reds = [];
	var greens = [];
	var blues = [];
	neighborColors.forEach(function(color) {
		reds.push(color[0]);
		greens.push(color[1]);
		blues.push(color[2]);
	});
	var redSum = reds.reduce(function(sum, color) { return sum + color; });
	var greenSum = greens.reduce(function(sum, color) { return sum + color; });
	var blueSum = blues.reduce(function(sum, color) { return sum + color; });
	var redAvg = redSum / reds.length;
	var greenAvg = greenSum / greens.length;
	var blueAvg = blueSum / blues.length;
	var colorAvgs = [
		{ red: redAvg },
		{ green: greenAvg },
		{ blue: blueAvg }
	].sort(compareColors);
	colorAvgs[0][Object.keys(colorAvgs[0])[0]] =
		colorRecessive(colorAvgs[0][Object.keys(colorAvgs[0])[0]]);
	colorAvgs[1][Object.keys(colorAvgs[1])[0]] =
		colorMid(colorAvgs[1][Object.keys(colorAvgs[1])[0]]);
	colorAvgs[2][Object.keys(colorAvgs[2])[0]] =
		colorDominant(colorAvgs[2][Object.keys(colorAvgs[2])[0]]);
	var nextColors = new Array(3);
	colorAvgs.forEach(function(colorHash) {
		if (Object.keys(colorHash)[0] == 'red')
			nextColors[0] = colorHash[Object.keys(colorHash)[0]];
		else if (Object.keys(colorHash)[0] == 'green')
			nextColors[1] = colorHash[Object.keys(colorHash)[0]];
		else
			nextColors[2] = colorHash[Object.keys(colorHash)[0]];
	}, this);
	return nextColors;
};
function compareColors(a, b) {
	var aColor = a[Object.keys(a)[0]];
	var bColor = b[Object.keys(b)[0]];
	if (aColor < bColor)
		return -1;
	if (aColor > bColor)
		return 1;
	return 0;
}
function colorRecessive(color) {
	return color;
};
function colorMid(color) {
	return color;
};
function colorDominant(color) {
	return color;
};

function randRgb() {
	return Math.floor((Math.random() * 255) + 1);
}

//* Run Program

var defaultOpts = {
	rows: 60,
	columns: 60,
	domIntensity: 2,
	recIntensity: 2,
	midIntensity: 50
}

var game = new Game('canvas', defaultOpts);
game.setGrid();

// html button commands
function start() {
	// game.play();
}
function stop() {
	// game.autoStepping = false;
}
function step() {
	game.turn();
	game.draw();
}
function clearGrid() {
	game.setGrid();
}

// Starting configurations
function random() {

}
function block() {

}
function line() {
	for (var c = 0; c < game.columns; c++) {
		game.grid.space[c][Math.floor(game.rows/2)].state = 1;
		game.grid.space[c][Math.floor(game.rows/2)].colorRandom();
	}
	game.draw();
}
