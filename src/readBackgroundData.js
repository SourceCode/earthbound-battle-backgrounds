import "babel-polyfill";
import ROM from "./rom/ROM";
import BackgroundLayer from "./rom/BackgroundLayer";
import Engine from "./Engine";
let state = {
	layers: [153, 298]
};
let search = location.search.substr(1);
if (search.length) {
	state.layers = search.split("-").map(e => Number.parseInt(e));
	for (let i = 0; i < state.layers.length; ++i) {
		let layer = state.layers[i];
		if (layer > 326) {
			state.layers[i] = 326;
		}
		if (layer < 0) {
			state.layers[i] = 0;
		}
	}
}
let rom;
let engine;
let setupEngine = ({
	layers = state.layers,
	frameSkip = 1,
	aspectRatio = 0
} = {}) => {
	let [layer1, layer2] = layers;
	let [fps, alpha] = [30, 0.5];
	if (layer2 === 0) {
		alpha = 1;
	}
	let bgLayer1 = getLayer(layer1);
	console.log(bgLayer1);
	let bgLayer2 = getLayer(layer2);
	engine = new Engine([bgLayer1, bgLayer2]);
	engine.animate();
}
let byteArray = null;
function updateState() {
	history.replaceState(null, null, `${location.pathname}?${state.layers.join("-")}`);
}
function getLayer(index) {
	return new BackgroundLayer(index);
	/* Caching doesn't really cut it */
	if (!ROM.layerCache[index]) {
		ROM.layerCache[index] = new BackgroundLayer(index);
	}
	return ROM.layerCache[index];
}
function updateLayer(index) {
	engine.layers[index] = getLayer(state.layers[index]);
}
function selectNext(secondLayer) {
	if (!secondLayer) {
		if (state.layers[0] < 326) {
			++state.layers[0];
			updateLayer(0);
		}
		else {
			return;
		}
	}
	else {
		if (state.layers[1] < 326) {
			++state.layers[1];
			updateLayer(1);
		}
		else {
			return;
		}
	}
	updateState();
}
function selectPrevious(secondLayer) {
	if (!secondLayer) {
		if (state.layers[0] > 1) {
			--state.layers[0];
			updateLayer(0);
		}
		else {
			return;
		}
	}
	else {
		if (state.layers[0] > 1) {
			--state.layers[1];
			updateLayer(1);
		}
		else {
			return;
		}
	}
	updateState();
}
(async () => {
	try {
		let response = await fetch("src/data/backgrounds-truncated.dat");
		let data = await response.arrayBuffer();
		let bgsData = new Uint8Array(data);
		let padding = new Uint8Array(655872);
		byteArray = new Uint8Array(padding.byteLength + bgsData.byteLength);
		byteArray.set(new Uint8Array(padding), 0);
		byteArray.set(new Uint8Array(bgsData), padding.byteLength);
		rom = new ROM(byteArray);
		setupEngine();
	}
	catch (e) {
		console.error(e);
	}
})();
document.body.addEventListener("keydown", e => {
	switch (e.code) {
		case "BracketRight":
			selectNext(e.shiftKey);
			break;
		case "Slash":
			selectPrevious(e.shiftKey);
			break;
	}
});
