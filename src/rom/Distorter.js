import {HORIZONTAL, HORIZONTAL_INTERLACED, VERTICAL} from "./DistortionEffect";
export default class Distorter {
	constructor(bitmap) {
		// There is some redundancy here: 'effect' is currently what is used
		// in computing frames, although really there should be a list of
		// four different effects ('dist') which are used in sequence.
		//
		// 'distortions' is currently unused, but ComputeFrame should be changed to
		// make use of it as soon as the precise nature of effect sequencing
		// can be determined.
		//
		// The goal is to make Distorter a general-purpose BG effect class that
		// can be used to show either a single distortion effect, or to show the
		// entire sequence of effects associated with a background entry (including
		// scrolling and Palette animation, which still need to be implemented).
// 		this.distortions = Array(4).fill(new DistortionEffect());
		this.bitmap = bitmap;
		this.original = null;
		/* NOTE: Another discrepancy from Java: These values should be "short" and must have a specific precision. This seems to affect backgrounds with distortEffect === HORIZONTAL */
		this.C1 = 1 / 512;
		this.C2 = 8 * Math.PI / (1024 * 256);
		this.C3 = Math.PI / 60;
	}
	setOffsetConstants(ticks, amplitude, amplitudeAcceleration, frequency, frequencyAcceleration, compression, compressionAcceleration, speed) {
		/* Compute "current" values of amplitude, frequency and compression */
		let t2 = ticks * 2;
		this.scaleAmplitude = this.C1 * (amplitude + amplitudeAcceleration * t2);
		this.scaleFrequency  = this.C2 * (frequency + (frequencyAcceleration * t2));
		this.scaleCompression = 1 + (compression  + (compressionAcceleration * t2)) / 256;
		this.scaleSpeed = this.C3 * speed * ticks;
	}
	overlayFrame(dst, letterbox, ticks, alpha, erase) {
		let e = erase ? 1 : 0;
		return this.computeFrame(dst, this.bitmap, this.effect.type, letterbox, ticks, alpha, e, this.effect.amplitude, this.effect.amplitudeAcceleration, this.effect.frequency, this.effect.frequencyAcceleration, this.effect.compression, this.effect.compressionAcceleration, this.effect.speed);
	}
	/**
	* Evaluates the distortion effect at the given destination line and
	* time value and returns the computed offset value.
	* If the distortion mode is horizontal, this offset should be interpreted
	* as the number of pixels to offset the given line's starting x position.
	* If the distortion mode is vertical, this offset should be interpreted as
	* the y-coordinate of the line from the source bitmap to draw at the given
	* y-coordinate in the destination bitmap.
	* @param y
	* 	The y-coordinate of the destination line to evaluate for
	* @param t
	* 	The number of ticks since beginning animation
	* @return
	* 	The distortion offset for the given (y, t) coordinates
	*/
	getAppliedOffset(y, distortionEffect) {
		let S = Math.round(this.scaleAmplitude * Math.sin(this.scaleFrequency * y + this.scaleSpeed));
		if (distortionEffect === HORIZONTAL) {
			return S;
		}
		else if (distortionEffect === HORIZONTAL_INTERLACED) {
			return y % 2 === 0 ? -S : S;
		}
		else if (distortionEffect === VERTICAL) {
			let L = Math.floor(S + y * this.scaleCompression) % 256;
			if (L < 0) {
				L = 256 + L;
			}
			if (L > 255) {
				L = 256 - L;
			}
			return L;
		}
		return 0;
	}
	computeFrame(dst, src, distortionEffect, letterbox, ticks, alpha, erase, ampl, ampl_accel, s_freq, s_freq_accel, compr, compr_accel, speed) {
		let bDst = dst;
		let bSrc = src;
		/* TODO: Hardcoing is bad */
		const dstStride = 1024;
		const srcStride = 1024;
		/*
			Given the list of 4 distortions and the tick count, decide which
			effect to use:
			Basically, we have 4 effects, each possibly with a duration.
			Evaluation order is: 1, 2, 3, 0
			If the first effect is null, control transitions to the second effect.
			If the first and second effects are null, no effect occurs.
			If any other effect is null, the sequence is truncated.
			If a non-null effect has a zero duration, it will not be switched
			away from.
			Essentially, this configuration sets up a precise and repeating
			sequence of between 0 and 4 different distortion effects. Once we
			compute the sequence, computing the particular frame of which distortion
			to use becomes easy; simply mod the tick count by the total duration
			of the effects that are used in the sequence, then check the remainder
			against the cumulative durations of each effect.
			I guess the trick is to be sure that my description above is correct.
			Heh.
		*/
		let x, y, bPos, sPos, dx;
		this.setOffsetConstants(ticks, ampl, ampl_accel, s_freq, s_freq_accel, compr, compr_accel, speed);
		for (y = 0; y < 224; ++y) {
			let S = this.getAppliedOffset(y, distortionEffect);
			let L = y;
			if (distortionEffect === 3) {
				L = S;
			}
			for (x = 0; x < 256; ++x) {
				bPos = x * 4 + y * dstStride;
				if (y < letterbox || y > 224 - letterbox) {
					bDst[bPos + 2] = 0;
					bDst[bPos + 1] = 0;
					bDst[bPos + 0] = 0;
					continue;
				}
				dx = x;
				if (distortionEffect === HORIZONTAL || distortionEffect === HORIZONTAL_INTERLACED) {
					dx = (x + S) % 256;
					if (dx < 0) {
						dx = 256 + dx;
					}
				}
				sPos = dx * 4 + L * srcStride;
				/* Either copy or add to the destination bitmap */
				if (erase) {
					bDst[bPos + 3] = 255;
					bDst[bPos + 2] = alpha * bSrc[sPos + 2];
					bDst[bPos + 1] = alpha * bSrc[sPos + 1];
					bDst[bPos + 0] = alpha * bSrc[sPos + 0];
				}
				else {
					bDst[bPos + 3] = 255;
					bDst[bPos + 2] += alpha * bSrc[sPos + 2];
					bDst[bPos + 1] += alpha * bSrc[sPos + 1];
					bDst[bPos + 0] += alpha * bSrc[sPos + 0];
				}
			}
		}
		return bDst;
	}
};
