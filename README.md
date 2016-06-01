# A Colorful Game of Life #
	
This is my simulation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life), but with an added color dimension.

## Game of Life Rules ##

* Each live cell with fewer than 2 neighbors dies
* Each live cell with greater than 3 neighbors dies
* Each live cell with 2 or 3 neighbors lives
* Each dead cell with exactly 3 neighbors comes alive 

## Color Rules ##

The following rules produce a result where colors start relatively dim and grey, but become inreasingly bright the longer a gene-pool exists.

* Newly born cells adopt the average of their parents' colors with adjustments for dominance, recessiveness, and randomness.

For newborns:
 * The dominant rgb value is amplified by a small amount
 * The recessive rgb value is diminished by a small amount
 * The mid rgb value is randomly amplified or diminished within a range of magnitude