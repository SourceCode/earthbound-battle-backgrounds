export default class ROMGraphics {
	constructor(bitsPerPixel) {
		this.bitsPerPixel = bitsPerPixel;
	}
	/* Internal function - builds the tile array from the gfx buffer. */
	buildTiles() {
		let n = this.gfxROMGraphics.length / (8 * this.bitsPerPixel);
		this.tiles = [];
		for (let i = 0; i < n; ++i) {
			this.tiles.push(new Array(8));
			let o = i * 8 * this.bitsPerPixel;
			for (let x = 0; x < 8; ++x) {
				this.tiles[i][x] = new Array(8);
				for (let y = 0; y < 8; ++y) {
					let c = 0;
					for (let bp = 0; bp < this.bitsPerPixel; ++bp) {
						// N.B. such a slight bug! we must Math.floor this value,
						// do to the possibility of a number like 0.5 (should equal 0)
						let halfBp = Math.floor(bp / 2);
						let gfx = this.gfxROMGraphics[o + y * 2 + (halfBp * 16 + (bp & 1))];
						c += ((gfx & (1 << 7 - x)) >> 7 - x) << bp;
					}
					this.tiles[i][x][y] = c;
				}
			}
		}
	}
	/* JNI C code */
	draw(bmp, palette, arrayROMGraphics) {
		let data = bmp;
		let block = 0, tile = 0, subPalette = 0;
		let n = 0, b1 = 0, b2 = 0;
		let verticalFlip = false, horizontalFlip = false;
		// TODO: hardcoding is bad; how do I get the stride normally?
		let stride = 1024;
		/* For each pixel in the 256×256 grid, we need to render the image found in the dump */
		for (let i = 0; i < 32; ++i) {
			for (let j = 0; j < 32; ++j) {
				n = j * 32 + i;
				b1 = arrayROMGraphics[n * 2];
				b2 = arrayROMGraphics[n * 2 + 1] << 8;
				block = b1 + b2;
				tile = block & 0x3FF;
				verticalFlip = (block & 0x8000) !== 0;
				horizontalFlip = (block & 0x4000) !== 0;
				subPalette = (block >> 10) & 7;
				this.drawTile(data, stride, i * 8, j * 8, palette, tile, subPalette, verticalFlip, horizontalFlip);
			}
		}
		return data;
	}
	drawTile(pixels, stride, x, y, palette, tile, subPalette, verticalFlip, horizontalFlip) {
		let i, j, px, py;
		for (i = 0; i < 8; ++i) {
			for (j = 0; j < 8; ++j) {
				let rgbArray = this.getRGBPalette(palette, tile, subPalette, i, j);
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
				let pos = 4 * px + stride * py;
				pixels[pos + 0] = (rgbArray >> 16) & 0xFF;
				pixels[pos + 1] = (rgbArray >> 8) & 0xFF;
				pixels[pos + 2] = (rgbArray) & 0xFF;
			}
		}
		return pixels;
	}
	getRGBPalette(palette, tile, subPalette, i, j) {
		let pos = this.tiles[tile][i][j];
		let colorChunk = palette.getColors(subPalette)[pos];
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
