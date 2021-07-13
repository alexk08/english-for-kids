import { Field } from './Field'

export class MainMenuField extends Field {
  createCard(name, image) {
    const cardElement = super.createCard(name, image);
    
    if (this.game.gameMode === window.GAME_MODES.TRAIN) {
      cardElement.classList.add('card--menu-train');
    } else {
      cardElement.classList.add('card--menu-play');
    }

    return cardElement;
  }

  onCardSelect(cardId) {
    this.game.changeCategory(cardId);
  }
}