import ROM from "./ROM";
/* Represents a chunk of the ROM's data requested by an object for reading or writing. A requested block should always correspond exactly to an area of strictly contiguous data within an object. */
export default class Block {
	constructor(data, location, writable) {
		this.blockData = data;
		this.size = -1;
		this.address = location;
		this.pointer = location;
		this.writable = writable;
	}
	write(value) {
		if (this.pointer + 2 >= this.address + this.size)
			throw new Error("Block write overflow");
		this.blockData[this.pointer++] = value;
		this.blockData[this.pointer++] = (value >> 8);
	}
	/**
	* Decompresses data from the block's current position. Note that this
	* method first measures the compressed data's size before allocating the
	* destination array, which incurs a slight additional overhead.
	*
	* @return An array containing the decompressed data.
	*/
	decompress() {
		var size = ROM.getCompressedSize(this.pointer, this.blockData);
		if (size < 1)
			throw new Error(`Invalid compressed data: ${size}`);
		var blockOutput = new Int16Array(size);
		var read = 0;
		blockOutput = ROM.decompress(this.pointer, this.blockData, blockOutput, read);
		if (blockOutput === null) {
			throw new Error("Computed and actual decompressed sizes do not match.");
		}
		return blockOutput;
	}
	/**
	* Reads a 16-bit integer from the block's current position and advances the
	* current position by 2 bytes.
	*
	* @return The 16-bit value at the current position.
	*/
	readShort() {
		return this.blockData[this.pointer++];
	}
	/* Reads a 32-bit integer from the block's current position and advances the current position by 4 bytes. */
	readInt() {
		return this.blockData[this.pointer++] + (this.blockData[this.pointer++] << 8) + (this.blockData[this.pointer++] << 16) + (this.blockData[this.pointer++] << 24);
	}
	readDoubleShort() {
		var fakeShort = new Int16Array(1);
		fakeShort[0] = this.blockData[this.pointer++] + (this.blockData[this.pointer++] << 8);
		return fakeShort;
	}
};