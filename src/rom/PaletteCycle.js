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
		for (var subpalnum = 0; subpalnum < this.originalColors.length; subpalnum++) {
			this.nowColors[subpalnum] = [];
			for (var i = 16; i < 32; i++) {
				this.originalColors[subpalnum][i] = this.originalColors[subpalnum][i - 16];
				this.nowColors[subpalnum][i - 16] = this.originalColors[subpalnum][i];
			};
		}
	}
	getEffect() {
		return this.type;
	}
	getColors(subpal) {
		return this.nowColors[subpal];
	}
	cycle() {
		if (this.speed === 0)
			return false
		this.cycleCountdown -= 1;
		if (this.cycleCountdown <= 0) {
			this.cycleColors();
			this.cycleCount += 1;
			this.cycleCountdown = this.speed;
			return true;
		}
		return false;
	}
	cycleColors() {
		if (this.type === 1 || this.type === 2) {
			var cycleLength = this.end1 - this.start1 + 1
			var cycle1Position = this.cycleCount % (cycleLength)
			for (var subpalnum = 0; subpalnum < this.originalColors.length; subpalnum++) {
				for (var i = this.start1; i <= this.end1; i++) {
					var newcolor = i - cycle1Position;
					if (newcolor < this.start1)
						newcolor += cycleLength;
					this.nowColors[subpalnum][i] = this.originalColors[subpalnum][newcolor];
				};
			};
		}
		if (this.type === 2) {
			var cycleLength = this.end2 - this.start2 + 1
			var cycle2Position = this.cycleCount % cycleLength
			for (var subpalnum = 0; subpalnum < this.originalColors.length; subpalnum++) {
				for (var i = this.start2; i <= this.end2; i++) {
					var newcolor = i - cycle2Position;
					if (newcolor < this.start2)
						newcolor += cycleLength;
					this.nowColors[subpalnum][i] = this.originalColors[subpalnum][newcolor];
				};
			};
		}
		if (this.type === 3) {
			var cycleLength = this.end1 - this.start1 + 1
			var cycle1Position = this.cycleCount % (cycleLength*2)
			for (var subpalnum = 0; subpalnum < this.originalColors.length; subpalnum++) {
				for (var i = this.start1; i <= this.end1; i++) {
					var newcolor = i + cycle1Position;
					var difference = 0
					if (newcolor > this.end1) {
						difference = newcolor-this.end1-1;
						newcolor = this.end1 - difference;
						if (newcolor < this.start1) {
							difference = this.start1 - newcolor - 1;
							newcolor = this.start1 + difference
						}
					}
					this.nowColors[subpalnum][i] = this.originalColors[subpalnum][newcolor];
				};
			};
		}
	}
};