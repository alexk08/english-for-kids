export class Field {
  constructor(items, rootElement, game) {
    this.items = items;
    this.game = game;
    this.rootElement = rootElement;
    this.cardsContainer = null;
    this.starsContainer = null;
    this.cardDataAttributeName = 'cardId';
    this.onFieldClick = this.onFieldClick.bind(this);
    this.clickedCard = null;
  }

  init() {
    this.starsContainer = document.createElement('div');
    this.starsContainer.classList.add('stars');
    this.rootElement.appendChild(this.starsContainer);

    this.cardsContainer = document.createElement('div');
    this.cardsContainer.classList.add('cards-container');
    this.cardsContainer.addEventListener('click', this.onFieldClick);
    this.rootElement.append(this.cardsContainer);

    this.renderCards();
  }

  createCard(name, image) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset[this.cardDataAttributeName] = name;

    const cardName = document.createElement('div');
    cardName.classList.add('card__name');
    cardName.textContent = name;

    const cardImage = document.createElement('img');
    cardImage.setAttribute('src', image);
    cardImage.setAttribute('alt', name);

    cardElement.append(cardImage, cardName);

    return cardElement
  }

  renderCards() {
    if (this.items.length === 0) {
      const message = document.createElement('div');
      message.classList.add('cards-container__message');
      message.textContent = 'No words for repeat';
      this.cardsContainer.appendChild(message);
    }
    this.items.forEach(({ word, image, translation }) => {
      const card = this.createCard(word, image, translation);
      this.cardsContainer.append(card);
    });
  }

  onFieldClick({ target }) {
    this.clickedCard = target.closest(`[data-card-id]`);
    if (this.clickedCard) {
      const cardId = this.clickedCard.dataset[this.cardDataAttributeName];
      this.onCardSelect(cardId);
    }
  }

  onCardSelect() {
    throw new Exception('Not implemented');
  }

  playSound(item, interrupt) {
    setTimeout(() => {
      const { audioSrc } = item;
      const audio = new Audio(audioSrc);
      audio.currentTime = 0;
      audio.play();
    }, interrupt)
  }
}
