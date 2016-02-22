import { default as ROM, snesToHex } from "./ROM";
import ROMGraphics from "./ROMGraphics";
export default class BackgroundGraphics {
	constructor(index, bitsPerPixel) {
		this.arrROMGraphics = null
		this.romGraphics = new ROMGraphics(bitsPerPixel);
		this.read(index);
	}
	read(index) {
		/* Graphics pointer table entry */
		let gfxPtrBlock = ROM.readBlock(0xAD9A1 + index * 4);
		/* Read graphics */
		this.romGraphics.loadGraphics(ROM.readBlock(snesToHex(gfxPtrBlock.readInt())));
		/* Arrangement pointer table entry */
		let arrPtrBlock = ROM.readBlock(0xADB3D + index * 4);
		let arrPtr = snesToHex(arrPtrBlock.readInt());
		/* Read and decompress arrangement */
		let arrBlock = ROM.readBlock(arrPtr);
		this.arrROMGraphics = arrBlock.decompress();
	}
	draw(bmp, pal) {
		return this.romGraphics.draw(bmp, pal, this.arrROMGraphics);
	}
	/**
	* Internal function - reads graphics from the specified block and builds
	* tileset.
	*
	* @param block
	* The block to read graphics data from
	*/
	loadGraphics(block) {
		this.romGraphics.loadGraphics(block);
	}
};