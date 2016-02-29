export default class PaletteCycle {
	constructor(pal, type, start1, end1, start2, end2, speed) {
		this.pal = pal;
		this.type = type;
		this.start1 = start1;
		this.end1 = end1;
		this.start2 = start2;
		this.end2 = end2;
		this.speed = speed/ 2;
		this.cycleCountdown = this.speed;
		this.cycleCount = 0;
		this.originalColors = this.pal.getColorMatrix();
		this.nowColors = [];
		/* Duplicate the original colors to make cycle math easier */
		for (let subPaletteNumber = 0; subPaletteNumber < this.originalColors.length; subPaletteNumber++) {
			this.nowColors[subPaletteNumber] = [];
			for (let i = 16; i < 32; ++i) {
				this.originalColors[subPaletteNumber][i] = this.originalColors[subPaletteNumber][i - 16];
				this.nowColors[subPaletteNumber][i - 16] = this.originalColors[subPaletteNumber][i];
			}
		}
	}
	getEffect() {
		return this.type;
	}
	getColors(subPalette) {
		return this.nowColors[subPalette];
	}
	cycle() {
		if (this.speed === 0) {
			return false;
		}
		this.cycleCountdown -= 1;
		if (this.cycleCountdown <= 0) {
			this.cycleColors();
			++this.cycleCount;
			this.cycleCountdown = this.speed;
			return true;
		}
		return false;
	}
	cycleColors() {
		if (this.type === 1 || this.type === 2) {
			let cycleLength = this.end1 - this.start1 + 1
			let cycle1Position = this.cycleCount % cycleLength;
			for (let subPaletteNumber = 0; subPaletteNumber < this.originalColors.length; ++subPaletteNumber) {
				for (let i = this.start1; i <= this.end1; ++i) {
					let newColor = i - cycle1Position;
					if (newColor < this.start1) {
						newColor += cycleLength;
					}
					this.nowColors[subPaletteNumber][i] = this.originalColors[subPaletteNumber][newColor];
				}
			}
		}
		if (this.type === 2) {
			let cycleLength = this.end2 - this.start2 + 1
			let cycle2Position = this.cycleCount % cycleLength
			for (let subPaletteNumber = 0; subPaletteNumber < this.originalColors.length; ++subPaletteNumber) {
				for (let i = this.start2; i <= this.end2; ++i) {
					let newColor = i - cycle2Position;
					if (newColor < this.start2) {
						newColor += cycleLength;
					}
					this.nowColors[subPaletteNumber][i] = this.originalColors[subPaletteNumber][newColor];
				}
			}
		}
		if (this.type === 3) {
			let cycleLength = this.end1 - this.start1 + 1
			let cycle1Position = this.cycleCount % (cycleLength*2)
			for (let subPaletteNumber = 0; subPaletteNumber < this.originalColors.length; ++subPaletteNumber) {
				for (let i = this.start1; i <= this.end1; ++i) {
					let newColor = i + cycle1Position;
					let difference = 0;
					if (newColor > this.end1) {
						difference = newColor-this.end1-1;
						newColor = this.end1 - difference;
						if (newColor < this.start1) {
							difference = this.start1 - newColor - 1;
							newColor = this.start1 + difference;
						}
					}
					this.nowColors[subPaletteNumber][i] = this.originalColors[subPaletteNumber][newColor];
				}
			}
		}
	}
};
