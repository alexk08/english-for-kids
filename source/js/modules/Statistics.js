const HEADERS = {
  NUMBER: '№',
  WORD: 'word',
  TRANSLATION: 'translation',
  CATEGORY: 'category',
  CLICKS: 'clicks',
  ERRORS: 'errors',
  CORRECT: 'correct',
  PERCENT: '% errors'
}

const PERCENT_ERRORS = 'percentErrors';
const BUTTONS = {
  REPEAT: 'Repeat difficult words',
  RESET: 'Reset'
}

window.REPEAT = 'Repeat';

const ROW_MODIFICATORS = {
  HEADER: 'header',
  ODD: 'odd',
  EVEN: 'even'
}

export class Statistics {
  constructor(rootElement, game) {
    this.rootElement = rootElement;
    this.game = game;
    this.wasSorted = false;
    this.tableContainer = null;
    this.wordsForRepeat = [];
  }

  init() {
    this.renderStatistics();
  }

  createHeaderRow(names) {
    const tableHeadRow = document.createElement('tr');
    tableHeadRow.classList.add('stat-table__row');
    tableHeadRow.classList.add(`stat-table__row--${ROW_MODIFICATORS.HEADER}`);

    Object.values(names).forEach(name => {
      const headCell = document.createElement('th');
      headCell.textContent = name;
      tableHeadRow.appendChild(headCell);
      headCell.addEventListener('click', () => {
        const sortData = (name !== HEADERS.PERCENT) ? this.sortStat(this.game.data, name) : this.sortStat(this.game.data, PERCENT_ERRORS);
        this.renderTable(sortData);
      });
    });

    return tableHeadRow;
  }

  createRow(wordStatistics, numberRow, modificator) {
    const tableRow = document.createElement('tr');
    tableRow.classList.add('stat-table__row');
    tableRow.classList.add(`stat-table__row--${modificator}`);

    const keys = Object.keys(wordStatistics);
    const firstCell = document.createElement('td');
    firstCell.textContent = numberRow;
    tableRow.appendChild(firstCell);

    keys.forEach(key => {
      const tableCell = document.createElement('td');
      tableCell.textContent = wordStatistics[key];
      tableRow.appendChild(tableCell);
    });
    
    return tableRow;
  }

  createTable(data) {
    const table = document.createElement('table');
    const headRow = this.createHeaderRow(HEADERS);
    table.classList.add('stat-table');
    table.appendChild(headRow);

    if (this.game.gameMode === window.GAME_MODES.PLAY) table.classList.add('stat-table--play');

    data.forEach((wordStatistics, index) => {
      const tableRow = index%2 ? this.createRow(wordStatistics, index + 1, ROW_MODIFICATORS.EVEN) : this.createRow(wordStatistics, index + 1, ROW_MODIFICATORS.ODD);
      table.appendChild(tableRow);
      
    });
    return table;
  }

  renderStatistics() {
    this.tableContainer = document.createElement('div');
    this.tableContainer.classList.add('table-container');
    this.renderTable(this.game.data);
    
    const repeatButton = this.createRepeatButton();
    const resetButton = this.createResetButton();
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('stat-buttons');
    if (this.game.gameMode === window.GAME_MODES.PLAY) buttonsContainer.classList.add('stat-buttons--play');
    buttonsContainer.append(repeatButton, resetButton);
    this.rootElement.append(buttonsContainer, this.tableContainer);
  }

  renderTable(data) {
    this.tableContainer.innerHTML = '';

    const table = this.createTable(data);
    this.tableContainer.appendChild(table);
  }

  createRepeatButton() {
    const repeatButton = document.createElement('button');
    repeatButton.setAttribute('type', 'button');
    repeatButton.classList.add('stat-buttons__repeat');
    repeatButton.textContent = BUTTONS.REPEAT;
    repeatButton.addEventListener('click', () => this.repeatDifficultsWords());

    return repeatButton;
  }

  createResetButton() {
    const resetButton = document.createElement('button');
    resetButton.setAttribute('type', 'button');
    resetButton.classList.add('stat-buttons__reset');
    resetButton.textContent = BUTTONS.RESET;
    resetButton.addEventListener('click', () => this.resetData());

    return resetButton;
  }

  repeatDifficultsWords() {
    this.wordsForRepeat = [];
    const dataForRepeat = this.sortForRepeat(this.game.data, PERCENT_ERRORS).slice(0, 8).filter(wordStat => wordStat[PERCENT_ERRORS] > 0).map(({ word }) => word);
    const categoriesValue = Object.values(this.game.categories);
    const allWords = [].concat(...categoriesValue);
    dataForRepeat.forEach(name => {
      const item = allWords.find(({ word }) => word === name);
      this.wordsForRepeat.push(item);
    });
    
    this.game.categoriesWithMain[window.REPEAT] = this.wordsForRepeat;
    this.game.changeCategory(window.REPEAT);
  }

  resetData() {
    delete localStorage[window.DATA];
    this.game.data = null;
    this.game.data = this.game.createData();
    this.renderTable(this.game.data);
  }

  sortStat(data, item) {
    const sortData = this.wasSorted ? data.slice().sort(function(a, b) {
      if (a[item] > b[item]) {
        return 1
      } else if (a[item] < b[item]) {
        return -1
      } 
    }) : data.slice().sort(function(a, b) {
      if (a[item] < b[item]) {
        return 1
      } else if (a[item] > b[item]) {
        return -1
      } 
    });

    this.wasSorted = !this.wasSorted;
    return sortData;
  }

  sortForRepeat(data, item) {
    const sortData = data.slice().sort(function(a, b) {
      if (a[item] < b[item]) {
        return 1
      } else if (a[item] > b[item]) {
        return -1
      } 
    });
    return sortData;
  }
}