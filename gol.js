"use strict";

function Canvas(id) {
	this.canvas = document.getElementById(id);
	this.context = this.canvas.getContext('2d');
	this.grid = new Grid(rows, columns);
	this.cellWidth = this.canvas.width / rows;
	this.cellHeight = this.canvas.height / columns;
}
Canvas.prototype.draw = function() {
	var ctx = this.context;
	var cellWidth = this.cellWidth;
	var cellHeight = this.cellHeight;
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
Canvas.prototype.setGrid = function() {
	for (var i=0; i < this.grid.width; i++) {
		for (var j=0; j < this.grid.height; j++)
			this.grid.set(new Vector(i, j), new Cell(new Vector(i, j)));
	}
}

function Vector(x, y) {
	this.x = x;
	this.y = y;
}
Vector.prototype.plus = function(other) {
	return new Vector(this.x + other.x, this.y + other.y);
}

function Grid(width, height) {
	this.space = (new Array(height));
	for (var i=0; i < height; i++)
		this.space[i] = (new Array(width));
	this.width = width;
	this.height = height;
}
Grid.prototype.isInside = function(vector) {
  return vector.x >= 0 && vector.x < this.width &&
         vector.y >= 0 && vector.y < this.height;
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

function Cell(vector) {
	this.state = 0;
	this.rgb = [200, 200, 200];
	this.neighbors = [];
	this.vector = vector;
}
Cell.prototype.getNeighbors = function(grid) {
	this.neighbors = [];
	for (var dir in directions) {
		var view = new View(canvas, this.vector);
		this.neighbors.push(view.look(dir));
	}
};
Cell.prototype.checkNeighbors = function() {};
Cell.prototype.colorRandom = function() {};
Cell.prototype.colorRecessive = function() {};
Cell.prototype.colorDominant = function() {};
Cell.prototype.colorMid = function() {};

function View(canvas, vector) {
	this.canvas = canvas;
	this.vector = vector;
}
View.prototype.look = function(dir) {
	var target = this.vector.plus(directions[dir]);
	if (this.canvas.grid.isInside(target))
		return this.canvas.grid.get(target);
	else
		return null;
}


//* Run Program

// Options
var rows = 2;
var columns = 2;
var domIntensity = 2;
var recIntensity = 2;
var midIntensity = 50;

var canvas = new Canvas('canvas');
canvas.setGrid();
canvas.draw();

// testing
// var cell = canvas.grid.space[0][1];
// cell.rgb = [100, 100, 100];
// cell.state = 1;
// canvas.draw();
// cell.getNeighbors();
