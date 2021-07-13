import { Field } from './Field'

const RESULTS = {
  ERROR_ANSWER: {
    image: 'img/content/systems/star.svg',
    audioSrc: 'audio/systems/error.mp3'
  },
  CORRECT_ANSWER: {
    image: 'img/content/systems/star-win.svg',
    audioSrc: 'audio/systems/correct.mp3'
  },
  FUILURE_GAME: {
    image: 'img/content/systems/failure.jpg',
    audioSrc: 'audio/systems/failure.mp3'
  },
  SUCCESS_GAME: {
    image: 'img/content/systems/success.jpg',
    audioSrc: 'audio/systems/success.mp3'
  }
};

export class PlayField extends Field {
  constructor(items, rootElement, game) {
    super(items, rootElement, game);
    this.itemsToGuess = null;
    this.playButton = null;
    this.onPlayButtonClick = this.onPlayButtonClick.bind(this);
    this.isGameStarted = false;
    this.wrongAnswersCounter = 0;
    this.results = null;
  }

  init() {
    super.init();
    this.cardsContainer.removeEventListener('click', this.onFieldClick);

    this.playButton = document.createElement('button');
    this.playButton.setAttribute('type', 'button');
    this.playButton.textContent = 'Start Game';
    this.playButton.classList.add('play-button');
    this.rootElement.appendChild(this.playButton);
    this.playButton.addEventListener('click', this.onPlayButtonClick);
  }

  onPlayButtonClick() {
    if (!this.isGameStarted) {
      this.startGame();
    } else {
      this.playSound(this.itemsToGuess[0], INTERRUPTS.SHORT);
    }
  }

  startGame() {
    this.isGameStarted = !this.isGameStarted;
    this.cardsContainer.addEventListener('click', this.onFieldClick);
    this.itemsToGuess = this.randomSortArray([...this.items]);
    this.playSound(this.itemsToGuess[0], INTERRUPTS.SHORT);

    this.playButton.classList.add('play-button--repeat');
    this.playButton.textContent = 'Repeat';

    this.results = new Map();
    this.itemsToGuess.forEach(({ word }) => {
      this.results.set(word, {
        errors: 0,
        correct: 0
      })
    });
  }

  createCard(name, image) {
    const cardElement = super.createCard(name, image);
    const cardName = cardElement.querySelector('.card__name');
    cardElement.classList.add('card--play');

    if (cardName) cardName.remove();

    return cardElement;
  }
  
  onCardSelect(cardId) {
    if (cardId !== this.itemsToGuess[0].word) {
      this.addStar(RESULTS.ERROR_ANSWER);
      this.recordCurrentResult(this.itemsToGuess[0], cardId);
      this.wrongAnswersCounter++;
      return;
    }

    this.addStar(RESULTS.CORRECT_ANSWER);
    this.recordCurrentResult(this.itemsToGuess[0], cardId);
    this.clickedCard.classList.add('card--guessed');
    this.itemsToGuess.shift();
    this.checkGameEnd();
  }

  recordCurrentResult(item, cardId) {
    const { word } = item;
    const wordStatistic = this.results.get(word);

    if (word !== cardId) { 
      this.results.set(word, { 
        ...wordStatistic,
        errors: wordStatistic.errors + 1
      });
      return
    }

    this.results.set(word, { 
      ...wordStatistic,
      correct: wordStatistic.correct + 1
    });
  }

  checkGameEnd() {
    if (this.itemsToGuess.length) {
      this.playSound(this.itemsToGuess[0], INTERRUPTS.LONG)
      return
    }
    this.renderEndGameScreen(this.wrongAnswersCounter);
  }

  renderEndGameScreen(wrongAnswersCounter) {
    const endGameScreen = document.createElement('div');
    endGameScreen.classList.add('end-screen');
    this.rootElement.innerHTML ='';
    this.rootElement.appendChild(endGameScreen);
    
    const result = wrongAnswersCounter ? RESULTS.FUILURE_GAME : RESULTS.SUCCESS_GAME;
    const { image } = result;
    const endGameText = document.createElement('span');
    const endGameImage = document.createElement('img');
    endGameText.textContent = wrongAnswersCounter ? `${wrongAnswersCounter} errors` : 'You won!!!';
    endGameImage.setAttribute('alt', 'emoji');
    endGameImage.setAttribute('src', `${image}`);
    endGameScreen.append(endGameText, endGameImage);
    this.playSound(result, INTERRUPTS.SHORT);
    this.game.finishGame(this.results);
  }
  
  addStar(result) {
    const { image } = result;
    const starElement = document.createElement('div');
    const star = document.createElement('img');

    this.playSound(result, INTERRUPTS.NULL);
    starElement.classList.add('stars__item');
    star.setAttribute('src', `${image}`);
    star.setAttribute('alt', 'star');
    
    this.starsContainer.insertAdjacentElement('afterbegin', starElement);
    starElement.appendChild(star);
  }

  randomSortArray (array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
}