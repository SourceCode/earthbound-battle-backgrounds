let frameID = -1;
export const SNES_WIDTH = 256;
export const SNES_HEIGHT = 224;
export default class Engine {
	constructor(layers = [], {
		fps = 30,
		aspectRatio = 0,
		frameSkip = 1,
		alpha = [0.5, 0.5],
		canvas = document.querySelector("canvas")
	} = {}) {
		this.layers = layers;
		this.fps = fps;
		this.aspectRatio = aspectRatio;
		this.frameSkip = frameSkip;
		this.alpha = alpha;
		this.tick = 0;
		this.canvas = canvas;
	}
	animate() {
		let then = Date.now();
		let startTime = then;
		let elapsed;
		let fpsInterval = 1000 / this.fps;
		let bitmap;
		let canvas = this.canvas;
		let context = canvas.getContext("2d");
		if (this.layers[0].entry && !this.layers[1].entry) {
			this.alpha[0] = 1;
			this.alpha[1] = 0;
		}
		if (!this.layers[0].entry && this.layers[1].entry) {
			this.alpha[0] = 0;
			this.alpha[1] = 1;
		}
		context.imageSmoothingEnabled = false;
		canvas.width = SNES_WIDTH;
		canvas.height = SNES_HEIGHT;
		let image = context.getImageData(0, 0, canvas.width, canvas.height);
		let drawFrame = () => {
			frameID = requestAnimationFrame(drawFrame);
			let now = Date.now();
			elapsed = now - then;
			if (elapsed > fpsInterval) {
				then = now - (elapsed % fpsInterval);
				for (let i = 0; i < this.layers.length; ++i) {
					bitmap = this.layers[i].overlayFrame(image.data, this.aspectRatio, this.tick, this.alpha[i], i === 0 ? true : false);
				}
				this.tick += this.frameSkip;
				image.data.set(bitmap);
				context.putImageData(image, 0, 0);
			}
		};
		if (frameID > 0) {
			window.cancelAnimationFrame(frameID);
		}
		drawFrame();
	}
};