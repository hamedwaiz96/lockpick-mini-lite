function convertAngleToXLength(angle, radius) {
	const radians = (angle*Math.PI)/180;
	return radius*Math.sin(radians);
}

const startPosition = [0, 100];

const DIFFICULTY_X_LENGTH_MAP = {
	"Novice": convertAngleToXLength(12, startPosition[1]),
	"Apprentice": convertAngleToXLength(10, startPosition[1]),
	"Adept": convertAngleToXLength(8, startPosition[1]),
	"Expert": convertAngleToXLength(6, startPosition[1]),
	"Master": convertAngleToXLength(4, startPosition[1])
}

class Lockpick {
	constructor(difficulty="Novice") {
		const self = this;
		// [x, y]
		this.startPos = startPosition;
		const endPos1 = [startPosition[1], startPosition[0]];
		const endPos2 = [-startPosition[1], startPosition[0]];
		this.currentPos = startPosition;
		this.health = Math.floor(100 / (Object.keys(DIFFICULTY_X_LENGTH_MAP).indexOf(difficulty)+1));
		this.difficulty = difficulty;
		this.sectorXLength = DIFFICULTY_X_LENGTH_MAP[this.difficulty];
		this.winningSectorXRange = this.chooseWinningSectorXRange();
		this.determiningSectorXRange = [(this.winningSectorXRange[0] - (Math.floor(this.sectorXLength/2))), (this.winningSectorXRange[0] + (Math.floor(this.sectorXLength/2)))];
		this.holdUp = false;
		this.currentUnlockStatus = 0;
		this.canvas = document.getElementById("canvas")
		this.board = this.canvas.getContext('2d');
		document.addEventListener("keydown", self.handleEvent.bind(self));
		this.board.beginPath();
		this.board.moveTo(0, 0);
		this.board.lineTo(this.startPos[0], this.startPos[1]);
		this.board.stroke();
	}

	turnRight() {
		const yChange = (this.currentPos[1] < 100) ? 1 : -1
		if (this.checkValidMove("right")) { this.currentPos = [this.currentPos[0]+1, this.currentPos[1]+yChange]}
		this.populateCanvas();
	}

	turnLeft() {
		const yChange = (this.currentPos[1] >= 100) ? 1 : -1
		if (this.checkValidMove("left")) { this.currentPos = [this.currentPos[0]-1, this.currentPos[1]+yChange]};
		this.populateCanvas();
	}

	tryUnlock() {
		this.holdUp = true;
		if (this.currentUnlockStatus < this.findUnlockStatus()) {
			this.currentUnlockStatus += 1
		} else if (this.currentUnlockStatus === this.findUnlockStatus()) {
			if (this.checkIfWon()) {
				console.log("Winner!");
				alert("winner!");
			} else {
				this.health -= 1;
				if (this.checkIfLost()) {
					console.log("Loser!");
					alert("loser!")
				}
			}
		}
		this.populateCanvas();
	}

	letGo() {
		this.holdUp = false;
		if (this.currentUnlockStatus > 0) {
			this.currentUnlockStatus -= 1;
		}
		this.populateCanvas();
	}

	checkInDeterminingSector() {
		return (this.currentPos[0] >= this.determiningSectorXRange[0]) && (this.currentPos[0] <= this.determiningSectorXRange[0])
	}

	checkInWinningSector() {
		return (this.currentPos[0] >= this.winningSectorXRange[0]) && (this.currentPos[0] <= this.winningSectorXRange[0])
	}

	findUnlockStatus() {
		if (this.checkInWinningSector()) {
			return 180
		}
		else if (this.checkInDeterminingSector()) {
			const firstHalf = [this.determiningSectorXRange[0], this.winningSectorXRange[0]];
			const secondHalf = [this.winningSectorXRange[1], this.determiningSectorXRange[1]];
			if (this.currentPos[0] < firstHalf[1]) {
				return 180*(this.currentPos[0]-firstHalf[0])/(firstHalf[1]-firstHalf[0])
			} else {
				return 180*(secondHalf[1]-this.currentPos[0])/(secondHalf[1]-secondHalf[0])
			}
		} else {
			return 0
		}
	}

	checkValidMove(dir) {
		const xChange = (dir === "left") ? -1 : 1
		if (((this.currentPos[0] + xChange) > this.startPos[1]) || ((this.currentPos[0] + xChange) < -this.startPos[1])) {return false};
		return true;
	}

	chooseWinningSectorXRange() {
		const radius = this.startPos[1];
		const sectorDifference = radius - this.sectorXLength;
		const startXSector = Lockpick.randomInteger(-sectorDifference, sectorDifference);
		const dir = Lockpick.randomInteger(0, 1);
		return (!!dir ? [startXSector - this.sectorXLength, startXSector] : [startXSector, startXSector + this.sectorXLength]);
	}

	checkIfWon() {
		return this.currentUnlockStatus === 180;
	}

	checkIfLost() {
		return this.health === 0;
	}

	populateCanvas() {
		this.board.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.board.beginPath();
		this.board.arc(0, 0, this.startPos[1], (this.currentUnlockStatus)*(Math.PI/180), Math.PI+(this.currentUnlockStatus)*(Math.PI/180));
		this.board.stroke();
		this.board.moveTo(0, 0)
		this.board.lineTo(this.currentPos[0], this.currentPos[1]);
		this.board.stroke();
	}

	handleEvent(e) {
        if (e.code == "ArrowRight") {
            e.preventDefault();
            this.turnRight();
        } else if (e.code == "ArrowLeft") {
            e.preventDefault();
            this.turnLeft();
        } else if (e.code == "ArrowUp") {
            e.preventDefault();
            this.tryUnlock();
        }
    }

	static randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}