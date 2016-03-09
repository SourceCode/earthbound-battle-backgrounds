import { default as ROM, snesToHex } from "./ROM";
import ROMGraphics from "./ROMGraphics";
export default class BackgroundGraphics {
	constructor(index, bitsPerPixel) {
		this.arrayROMGraphics = null
		this.romGraphics = new ROMGraphics(bitsPerPixel);
		this.read(index);
	}
	read(index) {
		/* Graphics pointer table entry */
		let graphicsPointerBlock = ROM.readBlock(0xD7A1 + index * 4);
		/* Read graphics */
		this.romGraphics.loadGraphics(ROM.readBlock(snesToHex(graphicsPointerBlock.readInt32())));
		/* Arrangement pointer table entry */
		let arrayPointerBlock = ROM.readBlock(0xD93D + index * 4);
		let arrayPointer = snesToHex(arrayPointerBlock.readInt32());
		/* Read and decompress arrangement */
		let arrayBlock = ROM.readBlock(arrayPointer);
		this.arrayROMGraphics = arrayBlock.decompress();
	}
	draw(bitmap, palette) {
		return this.romGraphics.draw(bitmap, palette, this.arrayROMGraphics);
	}
};