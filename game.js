import Lockpick from './lockpick';

const DIFFICULTY_MONEY_MAP = {
	"Novice": 5,
	"Apprentice": 4,
	"Adept": 3,
	"Expert": 2,
	"Master": 1
}

class Game {
    constructor() {
        const self = this;
        this.lockpick = new Lockpick(this);
        this.lockpicks = 100;
        this.money = 0;
        this.justReceived = 0;
        document.addEventListener("keydown", self.handleEvent.bind(self));
		document.addEventListener("keyup", self.handleEventUp.bind(self));
        this.updateUI();
    }

    won() {
        this.addRandomMoney();
        this.lockpick = new Lockpick(this);
        this.updateUI(true);
    }

    lost() {
        this.lockpicks -= 1;
        if (this.lockpicks === 0) {
            this.lockpick = None;
        }
        this.lockpick.softReset();
        this.updateUI();
    }

    addRandomMoney() {
        this.justReceived = this.generateWeightedRandomNumber();
        this.money += this.justReceived;
    }

    generateWeightedRandomNumber() {
        let finalNum;
        for (let i = 0; i <= DIFFICULTY_MONEY_MAP[this.lockpick.difficulty] - 1; i++) {
            finalNum = Math.pow(Math.floor(Math.random()*10), 2);
            console.log(finalNum)
        }
        return finalNum;
    }

    updateUI(initial=false) {
        const difficultyCon = document.getElementsByClassName('difficulty')[0]
        const lockpickNum = document.getElementsByClassName('lockpicks-num')[0];
        const moneyNum = document.getElementsByClassName('money-num')[0];
        const receivedNum = document.getElementsByClassName('received-num')[0];
        lockpickNum.innerHTML = this.lockpicks;
        moneyNum.innerHTML = this.money;
        difficultyCon.innerHTML = this.lockpick.difficulty;
        if (initial) {
            receivedNum.innerHTML = `received ${this.justReceived} gold!`
            window.setTimeout(() => {
                receivedNum.innerHTML = ""
            }, 3000)
        };
    }


	handleEventUp(e) {
		if (e.code == "ArrowUp") {
			e.preventDefault();
			this.lockpick.letGo()
		} else if (e.code == "ArrowRight") {
            e.preventDefault();
            window.clearInterval(this.lockpick.rightTimeout)
        } else if (e.code == "ArrowLeft") {
            e.preventDefault();
			window.clearInterval(this.lockpick.leftTimeout)
		}
	}

	handleEvent(e) {
        if (e.code == "ArrowRight") {
            e.preventDefault();
            this.lockpick.turnRight();
        } else if (e.code == "ArrowLeft") {
            e.preventDefault();
            this.lockpick.turnLeft();
        } else if (e.code == "ArrowUp") {
			e.preventDefault();
            this.lockpick.tryUnlock();
        }
    }

}

export default Game;