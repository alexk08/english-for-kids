import { Field } from './Field'

export class TrainingField extends Field {
  createCard(name, image, translation) {
    const cardElement = super.createCard(name, image);
    const frontSide = document.createElement('div');
    frontSide.classList.add('card__face');
    frontSide.classList.add('card__face--front');
    frontSide.innerHTML = cardElement.innerHTML;

    const backSide = document.createElement('div');
    backSide.classList.add('card__face');
    backSide.classList.add('card__face--back');
    backSide.innerHTML = cardElement.innerHTML;

    const translationELement = backSide.querySelector('.card__name');
    translationELement.classList.add('card__name--translation');
    translationELement.textContent = translation;

    const cardContainer = document.createElement('div');
    cardContainer.classList.add('card__container');
    
    cardElement.innerHTML = '';
    cardElement.classList.add('card--training');

    const rotateButton = document.createElement('button');
    rotateButton.setAttribute('type', 'button');
    rotateButton.classList.add('card__button');

    rotateButton.addEventListener('click', () => {
      cardElement.classList.add('card--rotate');
    });
    
    cardElement.addEventListener('mouseleave', () => {
      cardElement.classList.remove('card--rotate');
    })
    frontSide.appendChild(rotateButton);
    cardContainer.append(frontSide, backSide);
    cardElement.append(cardContainer);

    return cardElement;
  }

  onFieldClick({ target }) {
    if (target.closest('.card__button')) return;

    super.onFieldClick({ target });
  }

  onCardSelect(cardId) {
    const item = this.items.find(({ word }) => word === cardId);
    this.game.recordClicks(cardId);

    if (item) {
      this.playSound(item, INTERRUPTS.SHORT);
    }
  }
}