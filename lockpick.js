const radius = 100;
const startPosition = 90;

const DIFFICULTY_ANGLE_MAP = {
	"Novice": 12,
	"Apprentice": 10,
	"Adept": 8,
	"Expert": 6,
	"Master": 4
}

class Lockpick {
	constructor(game, difficulty="Novice") {
		const self = this;
		this.game = game;
		this.startPos = startPosition;
		this.radius = radius;
		this.currentPos = startPosition;
		this.health = Math.floor(100 / (Object.keys(DIFFICULTY_ANGLE_MAP).indexOf(difficulty)+1));
		this.difficulty = difficulty;
		this.sectorAngle = DIFFICULTY_ANGLE_MAP[this.difficulty];
		this.winningSectorRange = this.chooseWinningSectorRange();
		this.determiningSectorRange = [(this.winningSectorRange[0] - (Math.floor(this.sectorAngle/2))), (this.winningSectorRange[1] + (Math.floor(this.sectorAngle/2)))];
		this.holdUp = false;
		this.currentUnlockStatus = 0;
		this.canvas = document.getElementById("canvas")
		this.board = this.canvas.getContext('2d');
		this.canvasXDiff = this.canvas.width / 2;
		this.canvasYDiff = this.canvas.height-50;
		this.downTimeout = "";
		this.upTimeout = "";
		this.leftTimeout = "";
		this.rightTimeout = "";
		this.populateCanvas();
	}

	turnRight() {
		if (this.leftTimeout !== "") {window.clearInterval(this.leftTimeout)}
		if (this.rightTimeout !== "") {window.clearInterval(this.rightTimeout)}
		this.rightTimeout = window.setInterval(() => {
			if (this.checkValidMove("right")) {
				 this.currentPos += 1
				 this.populateCanvas();
				} else {
					window.clearInterval(this.rightTimeout)
				}
		}, 10)
	}

	turnLeft() {
		if (this.rightTimeout !== "") {window.clearInterval(this.rightTimeout)}
		if (this.leftTimeout !== "") {window.clearInterval(this.leftTimeout)}
		this.leftTimeout = window.setInterval(() => {
			if (this.checkValidMove("left")) {
				 this.currentPos -= 1
				 this.populateCanvas();
				} else {
					window.clearInterval(this.leftTimeout)
				}
		}, 10)
	}

	tryUnlock() {
		if (this.downTimeout !== "") {window.clearInterval(this.downTimeout)}
		if (this.upTimeout !== "") {window.clearInterval(this.upTimeout)}
		this.upTimeout = window.setInterval(() => {
			if (this.currentUnlockStatus < this.findUnlockStatus()) {
				this.currentUnlockStatus += 1
			} else if (this.currentUnlockStatus === this.findUnlockStatus()) {
				if (this.checkIfWon()) {
					window.clearInterval(this.upTimeout)
					console.log("Winner!");
					this.game.won();
				} else {
					this.health -= 1;
					console.log('helath')
					if (this.checkIfLost()) {
						window.clearInterval(this.upTimeout)
						console.log("Loser!");
						this.game.lost();
					}
				}
			}
			this.populateCanvas();
		}, 8)
	}

	letGo() {
		if (this.upTimeout !== "") {window.clearInterval(this.upTimeout)}
		this.downTimeout = window.setInterval(() => {
			if (this.currentUnlockStatus === 0) {
				window.clearInterval(this.downTimeout)
			}
			this.currentUnlockStatus -= 1;
			this.populateCanvas()
		}, 8)
	}

	checkInDeterminingSector() {
		return (this.currentPos >= this.determiningSectorRange[0]) && (this.currentPos <= this.determiningSectorRange[1])
	}

	checkInWinningSector() {
		return (this.currentPos >= this.winningSectorRange[0]) && (this.currentPos <= this.winningSectorRange[1])
	}

	findUnlockStatus() {
		if (this.checkInWinningSector()) {
			return 180
		}
		else if (this.checkInDeterminingSector()) {
			const firstHalf = [this.determiningSectorRange[0], this.winningSectorRange[0]];
			const secondHalf = [this.winningSectorRange[1], this.determiningSectorRange[1]];
			if (this.currentPos < firstHalf[1]) {
				return 180*(this.currentPos-firstHalf[0])/(firstHalf[1]-firstHalf[0])
			} else {
				return 180*(secondHalf[1]-this.currentPos)/(secondHalf[1]-secondHalf[0])
			}
		} else {
			return 0
		}
	}

	checkValidMove(dir) {
		const change = (dir === "left") ? -1 : 1
		if (((this.currentPos + change) > 180) || ((this.currentPos + change) < 0)) {return false};
		console.log(this.currentPos + change)
		return true;
	}

	chooseWinningSectorRange() {
		const startSector = Lockpick.randomInteger(this.sectorAngle, 180-this.sectorAngle);
		const dir = Lockpick.randomInteger(0, 1);
		return (!!dir ? [startSector-this.sectorAngle, startSector] : [startSector, startSector + this.sectorAngle]);
	}

	checkIfWon() {
		return this.currentUnlockStatus === 180;
	}

	checkIfLost() {
		return this.health <= 0;
	}

	populateCanvas() {
		this.board.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.board.beginPath();
		this.board.arc(this.canvasXDiff, this.canvasYDiff, this.radius, Math.PI+(this.currentUnlockStatus)*(Math.PI/180), (2*Math.PI)+(this.currentUnlockStatus)*(Math.PI/180));
		this.board.stroke();
		this.board.moveTo(this.convertAngleToX(this.currentUnlockStatus), this.convertAngleToY(this.currentUnlockStatus));
		this.board.lineTo(this.convertAngleToX(this.currentUnlockStatus+180), this.convertAngleToY(this.currentUnlockStatus+180));
		this.board.stroke();
		this.board.moveTo(this.canvasXDiff, this.canvasYDiff)
		this.board.lineTo(this.convertAngleToX(this.currentPos), this.convertAngleToY(this.currentPos));
		this.board.stroke();
	}

	convertAngleToX(angle) {
		return Math.sin((-(angle+90)*(Math.PI/180)))*this.radius+this.canvasXDiff;
	}

	convertAngleToY(angle) {
		return Math.cos((-(angle+90)*(Math.PI/180)))*this.radius+this.canvasYDiff;
	}

	softReset() {
		this.health = Math.floor(100 / (Object.keys(DIFFICULTY_ANGLE_MAP).indexOf(this.difficulty)+1));
		this.currentUnlockStatus = 0;
	}

	static randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export default Lockpick;