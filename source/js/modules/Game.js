import { TrainingField } from './TrainingField';
import { PlayField } from './PlayField';
import { MainMenuField } from './MainMenuField';
import { Statistics } from './Statistics';

window.INTERRUPTS = {
  NULL: 0,
  SHORT: 500,
  LONG: 1000,
  END_GAME: 3000
}

window.GAME_MODES = {
  PLAY: 'PLAY',
  TRAIN: 'TRAIN',
}

const PERCENTAGE = 100;

const NUMBER_CARD_FOR_MAIN_IMAGE = 0;

const MAIN_CATEGORIES = 'Main';
const STATISTICS = 'Statistics';
window.DATA = 'dataAlexk08';

export class Game {
  constructor(categories, rootElement) {
    this.categories = categories;
    this.categoriesWithMain = {
      ...categories,
      [MAIN_CATEGORIES]: Object.keys(categories).map((key) => ({
        word: key,
        image: categories[key][NUMBER_CARD_FOR_MAIN_IMAGE].image
      })),
    }
    this.rootElement = rootElement;
    this.headerElement = null;
    this.headerContainer = null;
    this.contentContainer = null;
    this.footerElement = null;
    this.gameMode = window.GAME_MODES.TRAIN;
    this.currentCategories = MAIN_CATEGORIES;
    this.gameModeSwitch = null;
    this.navElement = null;
    this.titleElement = null;
    this.overlay = null;
    this.navDataAttributeName = 'navId';
    this.onGameModeChange = this.onGameModeChange.bind(this);
    this.onNavClick = this.onNavClick.bind(this);
    this.onRootElementClick = this.onRootElementClick.bind(this);
    this.saveData = this.saveData.bind(this);
    this.data = null;
    this.noWordsForRepeat = null;
  }

  init() {
    this.headerElement = document.createElement('header');
    this.headerElement.classList.add('header');
    this.headerContainer = this.createContainer();
    this.headerElement.appendChild(this.headerContainer);

    const contentElement = document.createElement('main');
    contentElement.classList.add('main');
    this.contentContainer = this.createContainer();
    contentElement.appendChild(this.contentContainer);

    this.renderHeader();
    this.renderContent();
    this.renderFoooter();

    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');
    wrapper.append(this.headerElement, contentElement, this.footerElement);

    this.rootElement.append(wrapper);
    this.rootElement.addEventListener('click', this.onRootElementClick);

    this.data = this.getData();
    window.addEventListener('beforeunload', this.saveData);
  }

  getData() {
    const storageData = localStorage.getItem(window.DATA);
    const data = storageData ? JSON.parse(storageData) : this.createData();

    return data;
  }

  saveData() {
    if (this.data === null) return
    const gameData = JSON.stringify(this.data);
    localStorage.setItem(window.DATA, gameData);
  }

  createData() {
    const data = new Map();
    let categoriesArray = Object.entries(this.categories)
    .map(entry => {
      entry[1].map((item) => {
        item.category = entry[0];
        return item;
      })
      return entry[1]
    });

    categoriesArray = [].concat(...categoriesArray);
    categoriesArray.forEach((item) => {
      data.set(item.word, {
        word: item.word,
        translation: item.translation,
        category: item.category,
        clicks: 0,
        errors: 0,
        correct: 0,
        percentErrors: 0
      })
    });

    const dataArr = [...data].map(e =>{ return e[1];}).slice();

    return dataArr;
  }

  createContainer() {
    const container = document.createElement('div');
    container.classList.add('container');
    return container;
  }

  createTitle() {
    const title = document.createElement('div');
    title.classList.add('game-title');
    title.textContent = 'English for kids';
    return title;
  }

  createNavItem() {
    const navItem = document.createElement('li');
    navItem.classList.add('nav__item');

    return navItem;
  }

  createMenuItems(categories) {
    const menuItems = categories.slice();
    menuItems.unshift({
      word: MAIN_CATEGORIES
    })
    menuItems.push({
      word: STATISTICS
    });
    return menuItems;
  }

  createNav(menuCategories) {
    const navElement = document.createElement('nav');
    navElement.classList.add('nav');

    const burgerButton = document.createElement('button');
    burgerButton.setAttribute('type', 'button');
    burgerButton.classList.add('nav__burger-button');
    burgerButton.innerHTML = '<span></span>';

    const navList = document.createElement('ul');
    navList.classList.add('nav__list');
    navElement.append(burgerButton, navList);
    navElement.addEventListener('click', this.onNavClick);

    menuCategories.forEach(({ word }) => {
      const item = this.createNavItem();
      const navLink = document.createElement('a');
      navLink.classList.add('nav__link');
      navLink.setAttribute('href', '');
      navLink.dataset[this.navDataAttributeName] = word;
      item.appendChild(navLink);

      navLink.textContent = word;
      navList.appendChild(item);

      if (word === MAIN_CATEGORIES) navLink.classList.add('nav__link--active');
    });

    return navElement;
  }

  renderHeader() {
    this.headerContainer.innerHTML = '';
    const menuItems = this.createMenuItems(this.categoriesWithMain[MAIN_CATEGORIES]);
    this.navElement = this.createNav(menuItems);

    const gameSwitchWrapper = document.createElement('div');
    const labelSwitch = document.createElement('label');
    const spanInner = document.createElement('span');
    const spanSwitch = document.createElement('span');

    this.overlay = document.createElement('div');
    this.overlay.classList.add('overlay');
    this.gameModeSwitch = document.createElement('input');
    this.gameModeSwitch.classList.add('game-mode-switch-checkbox');
    this.gameModeSwitch.setAttribute('type', 'checkbox');
    this.gameModeSwitch.setAttribute('id', 'game-mode');
    this.gameModeSwitch.setAttribute('name', 'game-mode');
    this.gameModeSwitch.addEventListener('change', this.onGameModeChange);

    spanInner.classList.add('game-mode-switch-inner');
    spanSwitch.classList.add('game-mode-switch-switch');
    labelSwitch.setAttribute('for', 'game-mode');
    labelSwitch.classList.add('game-mode-switch-label');
    labelSwitch.append(spanInner, spanSwitch);
    gameSwitchWrapper.append(this.gameModeSwitch, labelSwitch);
    gameSwitchWrapper.classList.add('game-mode-switch');

    this.titleElement = this.createTitle();
    this.headerContainer.append(this.navElement, this.titleElement, gameSwitchWrapper, this.overlay);
  }

  renderContent() {
    this.contentContainer.innerHTML = '';

    if (this.currentCategories === STATISTICS) {
      const statistics = new Statistics(this.contentContainer, this);
      statistics.init();
      return
    }

    const FieldClass = this.currentCategories === MAIN_CATEGORIES ? MainMenuField : this.gameMode === window.GAME_MODES.TRAIN ? TrainingField : PlayField;
    const items = this.categoriesWithMain[this.currentCategories];

    const field = new FieldClass(items, this.contentContainer, this);
    field.init();
  }

  renderFoooter() {
    const yearSpan = document.createElement('span');
    yearSpan.classList.add('copyright__year');
    yearSpan.textContent = '2020 ©';

    const studentLink = document.createElement('a');
    studentLink.classList.add('copyright__student-link');
    studentLink.setAttribute('href', 'https://github.com/alexk08/');
    studentLink.setAttribute('target', '__blank');
    studentLink.textContent = 'Aleksandr Krasinikov';

    const logo = document.createElement('img');
    logo.classList.add('copyright__logo-rs');
    logo.setAttribute('src', 'img/svg/rs_school_js.svg');
    logo.setAttribute('alt', 'Logo RS School');

    const courseLink = document.createElement('a');
    courseLink.classList.add('copyright__course-link');
    courseLink.setAttribute('href', 'https://rs.school/js/');
    courseLink.setAttribute('target', '__blank');
    courseLink.appendChild(logo);

    const copyrightElement = document.createElement('div');
    copyrightElement.classList.add('copyright');
    copyrightElement.append(yearSpan, studentLink, courseLink);

    const container = document.createElement('div');
    container.classList.add('container');
    container.appendChild(copyrightElement);


    this.footerElement = document.createElement('footer');
    this.footerElement.appendChild(container);
    this.footerElement.classList.add('footer');
  }

  onGameModeChange({ target }) {
    this.gameMode = target.checked ? window.GAME_MODES.PLAY : window.GAME_MODES.TRAIN;
    this.renderContent();
    this.navElement.classList.toggle('nav--play', target.checked);
    this.titleElement.classList.toggle('game-title--play', target.checked);
    this.footerElement.classList.toggle('footer--play', target.checked);
  }

  changeCategory(currentCategories) {
    this.currentCategories = currentCategories;
    this.renderContent();

    if (currentCategories === window.REPEAT) return;

    this.changeActiveLink(this.currentCategories, this.navElement);
  }

  menuToggle() {
    this.navElement.classList.toggle('nav--show');
    this.overlay.classList.toggle('overlay--show');
    document.body.classList.toggle('scroll-lock');
  }

  menuClose() {
    this.navElement.classList.remove('nav--show');
    this.overlay.classList.remove('overlay--show');
    document.body.classList.remove('scroll-lock');
  }

  onNavClick(evt) {
    if (evt.target.closest('.nav__burger-button')) {
      this.menuToggle();
      return;
    }

    const link = evt.target.closest('.nav__link');
    if (link) {
      evt.preventDefault();
      this.currentCategories = link.textContent;
      this.menuToggle();
      this.renderContent();
      this.changeActiveLink(this.currentCategories, this.navElement);
    }
  }

  changeActiveLink(navId, nav) {
    const currentActiveLink = nav.querySelector('.nav__link--active');
    const newActiveLink = nav.querySelector(`[data-nav-id = "${navId}"]`);
    currentActiveLink.classList.remove('nav__link--active');
    newActiveLink.classList.add('nav__link--active');
  }

  onRootElementClick({ target }) {
    if (!target.closest('.nav')) {
      this.menuClose();
    }
  }

  finishGame(results) {
    this.currentCategories = MAIN_CATEGORIES;
    setTimeout(() => {
      this.gameMode = window.GAME_MODES.TRAIN;
      this.renderHeader();
      this.renderContent();
    }, INTERRUPTS.END_GAME);
    this.recordGameResults(results);
  }

  recordGameResults(results) {
    results.forEach((value, key) => {
      const data = this.data.map(item => {
        return (item.word === key) ? {
          ...item,
          correct: item.correct + value.correct,
          errors: item.errors + value.errors,
          percentErrors: Math.round(PERCENTAGE*(item.errors + value.errors)/(item.errors + value.errors + value.correct + item.correct))
        }
        : item
      });
      this.data = data;
    });
  }

  recordClicks(cardId) {
    const data = this.data.map(item => {
      return (item.word === cardId) ? {
        ...item,
        clicks: item.clicks + 1
      }
      : item
    });
    this.data = data;
  }
}
