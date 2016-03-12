import isNode from "detect-node";
import ROM from "./rom/ROM";
export Engine from "./Engine";
export BackgroundLayer from "./rom/BackgroundLayer";
let rom;
/**
*	@function buildROM
*		Builds a ROM from the data dump.
*	@return
*		`true` if ROM was successfully built, `false` otherwise
*/
export async function initialize() {
	if (rom) {
		return false;
	}
	let backgroundData;
	let path = `${__dirname}/../src/data/backgrounds-truncated.dat`;
	if (isNode) {
		function toArrayBuffer(buffer) {
			let arrayBuffer = new ArrayBuffer(buffer.length);
			let view = new Uint8Array(arrayBuffer);
			for (let i = 0; i < buffer.length; ++i) {
				view[i] = buffer[i];
			}
			return view;
		}
		/* Eval prevents `require` from being transformed */
		let fs = eval(`require("fs")`);
		let data = toArrayBuffer(fs.readFileSync(path));
		backgroundData = new Uint8Array(data);
	}
	else {
		let response = await fetch(path);
		let data = await response.arrayBuffer();
		backgroundData = new Uint8Array(data);
	}
	/* This initializes *one* ROM instance with a bunch of static (!) properties. This is done to prevent exporting ROM, as this would make the API needlessly verbose. */
	rom = new ROM(backgroundData);
	return true;
};