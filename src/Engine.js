let frameID = -1;
export default class Engine {
	constructor(layers = [], {
		fps = 30,
		aspectRatio = 0,
		frameSkip = 1,
		alpha = [0.5, 0.5]
	} = {}) {
		this.layers = layers;
		this.fps = fps;
		this.aspectRatio = aspectRatio;
		this.frameSkip = frameSkip;
		this.alpha = alpha;
		this.tick = 0;
	}
	animate() {
		let then = Date.now();
		let startTime = then;
		let elapsed;
		let fpsInterval = 1000 / this.fps;
		let bitmap;
		let canvas = document.querySelector("canvas");
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
		/* SNES resolution */
		canvas.width = 256;
		canvas.height = 224;
		let image = context.getImageData(0, 0, canvas.width, canvas.height);
		let drawFrame = () => {
			frameID = requestAnimationFrame(drawFrame);
			let now = Date.now();
			elapsed = now - then;
			if (elapsed > fpsInterval) {
				then = now - (elapsed % fpsInterval);
				bitmap = this.layers[0].overlayFrame(image.data, this.aspectRatio, this.tick, this.alpha[0], true);
				bitmap = this.layers[1].overlayFrame(bitmap, this.aspectRatio, this.tick, this.alpha[1], false);
				this.tick += this.frameSkip;
				image.data.set(bitmap);
				context.putImageData(image, 0, 0);
			}
		}
		if (frameID > 0) {
			window.cancelAnimationFrame(frameID);
		}
		drawFrame();
	}
};
