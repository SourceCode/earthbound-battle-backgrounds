let frameID = -1;
export default class Engine {
	constructor(layers = [], {
		fps = 30,
		aspectRatio = 0,
		frameSkip = 1,
		alpha = 0.5
	} = {}) {
		this.layers = layers;
		this.fps = fps;
		this.aspectRatio = aspectRatio;
		this.frameSkip = frameSkip;
		this.alpha = alpha;
	}
	animate() {
		let tick = 0;
		let then = Date.now();
		let startTime = then;
		let elapsed;
		let fpsInterval = 1000 / this.fps;
		let bitmap;
		let canvas = document.querySelector("canvas");
		let context = canvas.getContext("2d");
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
				bitmap = this.layers[0].overlayFrame(image.data, this.aspectRatio, tick, this.alpha, true);
				bitmap = this.layers[1].overlayFrame(bitmap, this.aspectRatio, tick, 0.5, false);
				tick += this.frameSkip;
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