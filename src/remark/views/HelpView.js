import Dom from "../Dom";
import i18next from 'i18next';

export default class HelpView {
  constructor(events) {
    this.events = events;
    this.keyMaps = [
      {
        description: 'goToPreviousSlide',
        keys: ['<b>&uarr;</b>', '<b>&larr;</b>', 'Pg Up', 'k']
      },
      {
        description: 'goToNextSlide',
        keys: ['<b>&darr;</b>', '<b>&rarr;</b>', 'Pg Dn', 'Space', 'j']
      },
      {
        description: 'goToFirstSlide',
        keys: ['Home']
      },
      {
        description: 'goToLastSlide',
        keys: ['End']
      },
      {
        description: 'goToSpecificSlide.description',
        keys: [
          i18next.t('helpView.keyMaps.goToSpecificSlide.number')
          + ' + <b>' + i18next.t('helpView.keyMaps.goToSpecificSlide.enter') + '</b>'
        ]
      },
      {
        description: 'toggleBlackout',
        keys: ['b']
      },
      {
        description: 'toggleMirrored',
        keys: ['m']
      },
      {
        description: 'toggleFullScreen',
        keys: ['f']
      },
      {
        description: 'togglePresenterMode',
        keys: ['p']
      },
      {
        description: 'restartPresentationTimer',
        keys: ['t']
      },
      {
        description: 'cloneSlideShow',
        keys: ['c']
      },
      {
        description: 'toggleHelp',
        keys: ['h', '?']
      },
      {
        description: 'backToSlideShow',
        keys: ['Esc']
      }
    ];

    this.createKeyTable = this.createKeyTable.bind(this);
    this.configureElement = this.configureElement.bind(this);
    this.configureElement();
  }

  createKeyTable() {
    let rows = this.keyMaps.map((keyMap) => {
      let keyCell = Dom.createElement(
        {
          elementType: 'td',
          className: 'remark-help__cell'
        },
        keyMap.keys.map((key) => {
          return Dom.createElement({
            elementType: 'span',
            className: 'remark-help__key',
            innerHTML: key
          });
        })
      );

      let descriptionCell = Dom.createElement({
        elementType: 'td',
        className: 'remark-help__cell',
        innerHTML: i18next.t('helpView.keyMaps.' + keyMap.description)
      });

      return Dom.createElement(
        {elementType: 'tr'},
        [keyCell, descriptionCell]
      );
    });

    return Dom.createElement(
      {},
      rows
    );
  }

  configureElement() {
    let content = Dom.createElement(
      {elementType: 'div', className: 'remark-help__content'},
      [
        Dom.createElement({
          elementType: 'h1',
          className: 'remark-help__head',
          innerHTML: i18next.t('helpView.head')
        }),
        Dom.createElement({
          elementType: 'p',
          className: 'remark-help__subHead',
          innerHTML: i18next.t('helpView.subHead')
        }),
        this.createKeyTable()
      ]
    );

    this.element = Dom.createElement({className: 'remark-help'}, [content]);
  }
}
