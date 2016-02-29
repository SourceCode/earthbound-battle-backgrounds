import BattleBackground from "../rom/BattleBackground";
import DistortionEffect from "../rom/DistortionEffect";
import BackgroundGraphics from "../rom/BackgroundGraphics";
import BackgroundPalette from "../rom/BackgroundPalette";
import Block from "./Block";
const UNCOMPRESSED_BLOCK = 0;
const RUN_LENGTH_ENCODED_BYTE = 1;
const RUN_LENGTH_ENCODED_SHORT = 2;
const INCREMENTAL_SEQUENCE = 3;
const REPEAT_PREVIOUS_DATA = 4;
const REVERSE_BITS = 5;
const UNKNOWN_1 = 6;
const UNKNOWN_2 = 7;
function generateReversedBytes() {
	let reversedBytes = new Int16Array(256);
	for (let i = 0; i < reversedBytes.length; ++i) {
		let binary = i.toString(2).padLeft(8, 0);
		let reversed = [...binary].reverse().join("");
		let value = Number.parseInt(reversed, 2);
		reversedBytes[i] = value;
	}
	return reversedBytes;
}
export function snesToHex(address, header = true) {
	if (address >= 0x400000 && address < 0x600000) {
		address -= 0x0;
	}
	else if (address >= 0xC00000 && address < 0x1000000) {
		address -= 0xC00000;
	}
	else {
		throw new Error("SNES address out of range: " + address);
	}
	if (header) {
		address += 0x200;
	}
	return address;
};
export function hexToSnes(address, header = true) {
	if (header) {
		address -= 0x200;
	}
	if (address >= 0 && address < 0x400000) {
		return address + 0xC00000;
	}
	else if (address >= 0x400000 && address < 0x600000) {
		return address;
	}
	else {
		throw new Error("File offset out of range: " + address);
	}
};
export default class ROM {
	static objects = new Map();
	static romData = [];
	static layerCache = [];
	static cached = false;
	/* This is an internal optimization for the comp/decomp methods. Every element in this array is the binary reverse of its index. */
	static reversedBytes = generateReversedBytes();
	constructor(stream) {
		if (!ROM.cached) {
			ROM.romData = stream;
			for (let constructor of [DistortionEffect, BattleBackground, BackgroundGraphics, BackgroundPalette]) {
				let { handler } = constructor;
				if (handler instanceof Function) {
					handler();
				}
			}
			ROM.cached = true;
		}
	}
	/**
	 * Adds an object to the ROM container.
	 *
	 * @param o
	 * The ROMObject to add
	 */
	static add(o) {
		let constructor = o.constructor;
		if (!ROM.objects.has(constructor)) {
			ROM.objects.set(constructor, []);
		}
		ROM.objects.get(constructor).push(o);
	}
	static getObject(constructor, i) {
		return ROM.objects.get(constructor)[i];
	}
	/**
	 * Returns a readable block at the given location. Nominally, should also
	 * handle tracking free space depending on the type of read requested.
	 * (i. e., an object may be interested in read-only access anywhere, but if
	 * an object is reading its own data, it should specify this so the ROM can
	 * mark the read data as "free")
	 *
	 * @param location
	 * The address from which to read
	 *
	 * @return A readable block
	 */
	static readBlock(location) {
		// NOTE: there's no address conversion implemented yet;
		// we're assuming all addresses are file offsets (with header)
		
		// For now, just return a readable block; we'll worry about
		// typing and free space later
		return new Block(ROM.romData, location, false);
	}
	/**
	 * Allocates a writeable block using the Unrestricted storage model. The
	 * resulting block may be located anywhere in the ROM.
	 *
	 *
	 * @param size
	 * The size, in bytes, required for this block
	 * @return A writeable block, or null if allocation failed
	 */
	allocateBlock(size) {
		return null;
	}
	/**
	 * Allocates a writeable block using the Fixed storage model. The resulting
	 * block is always located at the given address.
	 *
	 * @param size
	 * The size, in bytes, required for this block
	 * @param location
	 * The starting address of the desired block
	 * @return A writeable block of size bytes in the specified location, or
	 *  null if allocation failed
	 */
	allocateFixedBlock(size, location) {
		return null;
	}
	/**
	 * Allocates a writeable block using the Local storage model. Reserves a
	 * block of space within a previously allocated local segment.
	 *
	 * @param size
	 * The size, in bytes, required for this block
	 * @param ticket
	 * A local segment identifier previously obtained from
	 * AllocateLocalSegment, identifying a pre-allocated space that
	 * has been reserved for a particular set of local-access objects
	 * @return A writeable block of size bytes in the given local segment.
	 */
	allocateLocalBlock(size, ticket) {
		return null;
	}
	// Do not try to understand what this is doing. It will hurt you.
	// The only documentation for this decompression routine is a 65816
	// disassembly.
	// This function can return the following error codes:
	//
	// ERROR MEANING
	// -1 Something went wrong
	// -2 I dunno
	// -3 No idea
	// -4 Something went _very_ wrong
	// -5 Bad stuff
	// -6 Out of ninjas error
	// -7 Ask somebody else
	// -8 Unexpected end of data
	// public static
	/**
	 * @param start
	 * @param data
	 * @param output
	 * Must already be allocated with at least enough space
	 * @param read
	 * "Out" parameter which receives the number of bytes of
	 * compressed data read
	 * @return The size of the decompressed data if successful, null otherwise
	 */
	static decompress(start, data, output, read) {
		let maxLength = output.length;
		let pos = start;
		let bpos = 0, bpos2 = 0;
		let tmp;
		while (data[pos] !== 0xFF) {
			// Data overflow before end of compressed data
			if (pos >= data.length) {
				read = pos - start + 1;
				return null;
				// return -8;
			}
			let commandType = data[pos] >> 5;
			let len = (data[pos] & 0x1F) + 1;
			if (commandType === 7) {
				commandType = (data[pos] & 0x1C) >> 2;
				len = ((data[pos] & 3) << 8) + data[pos + 1] + 1;
				pos++;
			}
			// Error: block length would overflow maxLength, or block endpos
			// negative?
			if (bpos + len > maxLength || bpos + len < 0) {
				read = pos - start + 1;
				return null;
				// return -1;
			}
			pos++;
			if (commandType >= 4) {
				bpos2 = (data[pos] << 8) + data[pos + 1];
				if (bpos2 >= maxLength || bpos2 < 0) {
					read = pos - start + 1;
					return null;
					// return -2;
				}
				pos += 2;
			}
			switch (commandType) {
				case UNCOMPRESSED_BLOCK:
					while (len-- !== 0) {
						output[bpos++] = data[pos++];
					}
					// Array.Copy(data, pos, output, bpos, len);
					// bpos += len;
					// pos += len;
					break;
				case RUN_LENGTH_ENCODED_BYTE:
					while (len-- !== 0) {
						output[bpos++] = data[pos];
					}
					pos++;
					break;
				case RUN_LENGTH_ENCODED_SHORT:
					if (bpos + 2 * len > maxLength || bpos < 0) {
						read = pos - start + 1;
						return null;
						// return -3;
					}
					while (len-- !== 0) {
						output[bpos++] = data[pos];
						output[bpos++] = data[pos + 1];
					}
					pos += 2;
					break;
				case INCREMENTAL_SEQUENCE:
					tmp = data[pos++];
					while (len-- !== 0) {
						output[bpos++] = tmp++;
					}
					break;
				case REPEAT_PREVIOUS_DATA:
					if (bpos2 + len > maxLength || bpos2 < 0) {
						read = pos - start + 1;
						return null;
						// return -4;
					}
					for (let i = 0; i < len; i++) {
						output[bpos++] = output[bpos2 + i];
					}
					break;
				case REVERSE_BITS:
					if (bpos2 + len > maxLength || bpos2 < 0) {
						read = pos - start + 1;
						return null;
						// return -5;
					}
					while (len-- !== 0) {
						output[bpos++] = ROM.reversedBytes[output[bpos2++] & 0xFF];
					}
					break;
				case UNKNOWN_1:
					if (bpos2 - len + 1 < 0) {
						read = pos - start + 1;
						return null;
						// return -6;
					}
					while (len-- !== 0)
						output[bpos++] = output[bpos2--];
					break;
				case UNKNOWN_2:
					read = pos - start + 1;
					return null;
					// return -7;
			}
		}
		read = pos - start + 1;
		return output;
	}
	static getCompressedSize(start, data) {
		let pos = start;
		let bpos = 0, bpos2 = 0;
		while (data[pos] !== 0xFF) {
			/* Data overflow before end of compressed data */
			if (pos >= data.length) {
				return -8;
			}
			let commandType = data[pos] >> 5;
			let length = (data[pos] & 0x1F) + 1;
			if (commandType === 7) {
				commandType = (data[pos] & 0x1C) >> 2;
				length = ((data[pos] & 3) << 8) + (data[pos + 1]) + 1;
				++pos;
			}
			if (bpos + length < 0)
				return -1;
			pos++;
			if (commandType >= 4) {
				bpos2 = (data[pos] << 8) + (data[pos + 1]);
				if (bpos2 < 0) {
					return -2;
				}
				pos += 2;
			}
			switch (commandType) {
				case UNCOMPRESSED_BLOCK:
					bpos += length;
					pos += length;
					break;
				case RUN_LENGTH_ENCODED_BYTE:
					bpos += length;
					++pos;
					break;
				case RUN_LENGTH_ENCODED_SHORT:
					if (bpos < 0) {
						return -3;
					}
					bpos += 2 * length;
					pos += 2;
					break;
				case INCREMENTAL_SEQUENCE:
					bpos += length;
					++pos;
					break;
				case REPEAT_PREVIOUS_DATA:
					if (bpos2 < 0) {
						return -4;
					}
					bpos += length;
					break;
				case REVERSE_BITS:
					if (bpos2 < 0) {
						return -5;
					}
					bpos += length;
					break;
				case UNKNOWN_1:
					if (bpos2 - length + 1 < 0) {
						return -6;
					}
					bpos += length;
					break;
				case UNKNOWN_2:
					return -7;
				}
		}
		return bpos;
	}
};
