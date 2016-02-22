import { default as ROM, snesToHex } from "./ROM";
export default class BackgroundPalette {
	constructor(index, bitsPerPixel) {
		this.colors = null;
		this.bitsPerPixel = bitsPerPixel;
		this.read(index);
	}
	read(index) {
		var ptr = ROM.readBlock(0xADCD9 + index * 4);
		var address = snesToHex(ptr.readInt());
		var data = ROM.readBlock(address);
		this.address = address;
		this.readPalette(data, this.bitsPerPixel, 1);
	}
	/**
	* Gets an array of colors representing one of this Palette's subpalettes.
	*
	* @param pal
	* The index of the subpalette to retrieve.
	*
	* @return An array containing the colors of the specified subpalette.
	*/
	getColors(pal) {
		return this.colors[pal];
	}
	getColorMatrix() {
		return this.colors;
	}
	/**
	* Internal function - reads Palette data from the given block into this
	* Palette's colors array.
	*
	* @param block
	* Block to read Palette data from.
	* @param bitsPerPixel
	* Bit depth; must be either 2 or 4.
	* @param count
	* Number of subpalettes to read.
	*/
	readPalette(block, bitsPerPixel, count) {
		if (this.bitsPerPixel != 2 && this.bitsPerPixel != 4)
			throw new Error("Palette error: Incorrect color depth specified.");
		if (count < 1)
			throw new Error("Palette error: Must specify positive number of subpalettes.");
		this.colors = new Array(count);
		for (var pal = 0; pal < count; pal++) {
			this.colors[pal] = new Array(Math.pow(2, this.bitsPerPixel));
			for (var i = 0; i < Math.pow(2, this.bitsPerPixel); i++) {
				var clr16 = block.readDoubleShort()[0];
				var b = (((clr16 >> 10) & 31) * 8);
				var g = (((clr16 >> 5) & 31) * 8);
				var r = ((clr16 & 31) * 8);
				// convert RGB to color int
				// this code is straight out of Android: http://git.io/F1lZtw
				this.colors[pal][i] = (0xFF << 24) | (r << 16) | (g << 8) | b;
			}
		}
	}
};