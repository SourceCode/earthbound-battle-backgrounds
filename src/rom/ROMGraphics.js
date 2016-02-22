export default class ROMGraphics {
	constructor(bitsPerPixel) {
		this.bitsPerPixel = bitsPerPixel;
	}
	/**
	* Internal function - builds the tile array from the gfx buffer.
	*/
	buildTiles() {
		var n = this.gfxROMGraphics.length / (8 * this.bitsPerPixel);
		this.tiles = [];
		for (var i = 0; i < n; ++i) {
			this.tiles.push(new Array(8));
			var o = i * 8 * this.bitsPerPixel;
			for (var x = 0; x < 8; ++x) {
				this.tiles[i][x] = new Array(8);
				for (var y = 0; y < 8; ++y) {
					var c = 0;
					for (var bp = 0; bp < this.bitsPerPixel; ++bp) {
						// N.B. such a slight bug! we must Math.floor this value,
						// do to the possibility of a number like 0.5 (should equal 0)
						var halfBp = Math.floor(bp / 2);
						var gfx = this.gfxROMGraphics[o + y * 2 + (halfBp * 16 + (bp & 1))];
						c += ((gfx & (1 << 7 - x)) >> 7 - x) << bp;
					}
					this.tiles[i][x][y] = c;
				}
			}
		}
	}
	// JNI C code
	draw(bmp, pal, arrROMGraphics) {
		var data = bmp;
		var block = 0, tile = 0, subPalette = 0;
		let n = 0, b1 = 0, b2 = 0;
		var verticalFlip = false, horizontalFlip = false;
		// TODO: hardcoding is bad; how do I get the stride normally?
		var stride = 1024;
		// for each pixel in the 256x256 grid, we need to render the image found in the .dat file
		for (let i = 0; i < 32; ++i) {
			for (let j = 0; j < 32; ++j) {
				n = j * 32 + i;
				b1 = arrROMGraphics[n * 2];
				b2 = arrROMGraphics[n * 2 + 1] << 8;
				block = b1 + b2;
				tile = block & 0x3FF;
				verticalFlip = (block & 0x8000) !== 0;
				horizontalFlip = (block & 0x4000) !== 0;
				subPalette = (block >> 10) & 7;
				this.drawTile(data, stride, i * 8, j * 8, pal, tile, subPalette, verticalFlip, horizontalFlip);
			}
		}
		return data;
	}
	drawTile(pixels, stride, x, y, pal, tile, subPalette, verticalFlip, horizontalFlip) {
		var i, j, px, py;
		for (i = 0; i < 8; ++i) {
			for (j = 0; j < 8; ++j) {
				var rgbArray = this.getRGBPal(pal, tile, subPalette, i, j);
				if (horizontalFlip) {
					px = x + 7 - i;
				}
				else {
					px = x + i;
				}
				if (verticalFlip) {
					py = y + 7 - j;
				}
				else {
					py = y + j;
				}
				var pos = 4 * px + stride * py;
				pixels[pos + 0] = (rgbArray >> 16) & 0xFF;
				pixels[pos + 1] = (rgbArray >> 8) & 0xFF;
				pixels[pos + 2] = (rgbArray) & 0xFF;
			}
		}
		return pixels;
	}
	getRGBPal(pal, tile, subPalette, i, j) {
		var pos = this.tiles[tile][i][j];
		var colorChunk = pal.getColors(subPalette)[pos];
		return colorChunk;
	}
	/**
	 * Internal function - reads graphics from the specified block and builds
	 * tileset.
	 *
	 * @param block
	 * The block to read graphics data from
	 */
	loadGraphics(block) {
		this.gfxROMGraphics = new Int16Array();
		this.gfxROMGraphics = block.decompress();
		this.address = block.address;
		this.buildTiles();
	}
};