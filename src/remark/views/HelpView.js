import Dom from "../Dom";

export default class HelpView {
  constructor(events) {
    this.events = events;
    this.keyMaps = [
      {
        description: 'Go to previous slide',
        keys: ['<b>&uarr;</b>', '<b>&larr;</b>', 'Pg Up', 'k']
      },
      {
        description: 'Go to next slide',
        keys: ['<b>&darr;</b>', '<b>&rarr;</b>', 'Pg Dn', 'Space', 'j']
      },
      {
        description: 'Go to first slide',
        keys: ['Home']
      },
      {
        description: 'Go to last slide',
        keys: ['End']
      },
      {
        description: 'Go to specific slide',
        keys: ['Number + <b>Return</b>']
      },
      {
        description: 'Toggle blackout',
        keys: ['b']
      },
      {
        description: 'Toggle mirrored',
        keys: ['m']
      },
      {
        description: 'Toggle full screen',
        keys: ['f']
      },
      {
        description: 'Toggle presenter mode',
        keys: ['p']
      },
      {
        description: 'Restart the presentation timer',
        keys: ['t']
      },
      {
        description: 'Clone slide show',
        keys: ['c']
      },
      {
        description: 'Toggle this help',
        keys: ['h', '?']
      },
      {
        description: 'Back to slide show',
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
        innerHTML: keyMap.description
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
      {elementType: 'h1', className: 'remark-help__content'},
      [Dom.createElement({className: 'remark-help__head'}), this.createKeyTable()]
    );

    this.element = Dom.createElement({className: 'remark-help'}, [content]);
  }
}
