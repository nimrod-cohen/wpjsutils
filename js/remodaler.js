class Remodaler {
  static #instance = null;

  types = {
    ALERT: 0,
    CONFIRM: 1,
    INPUT: 2,
    FORM: 3
  };

  constructor() {
    if (!Remodaler.#instance) Remodaler.#instance = this;
    return Remodaler.#instance;
  }

  static get_instance() {
    if (!Remodaler.#instance) {
      let remodaler = new Remodaler();
    }
    return Remodaler.#instance;
  }

  _options = null;
  _state = window.StateManagerFactory();

  show = options => {
    this._options = options;

    const remodal_id = `remodal-${JSUtils.guid()}`;

    this._setup(remodal_id);

    const win = this._state.get('window');

    if (typeof this._options.type === 'undefined') this._options.type = this.types.ALERT;

    win.querySelector(`#${remodal_id} h2[data-remodal-title]`).innerText = this._options.title;
    win.querySelector(`#${remodal_id} p[data-remodal-message]`).innerHTML = this._options.message;

    if (this._options.type === this.types.INPUT) {
      if (typeof this._options.values === 'undefined')
        document.querySelector(
          `#${remodal_id} .remodal p[data-remodal-input]`
        ).innerHTML = `<input type='text' name='remodal-data-input' ${
          this._options.value ? `value="${this._options.value}"` : ''
        }>`;
      else {
        var select = "<select name='remodal-data-input'>";
        for (var i = 0; i < this._options.values.length; i++) {
          var val = this._options.values[i];
          select += "<option value='" + val.value + "'>" + val.title + '</option>';
        }
        select += '</select>';
        document.querySelector(`#${remodal_id} .remodal p[data-remodal-input]`).innerHTML = select;
      }
    }

    win.querySelector(`#${remodal_id} button[data-remodal-action='confirm']`).innerText =
      this._options.confirmText || 'Confirm';
    win.querySelector(`#${remodal_id} button[data-remodal-action='cancel']`).innerText =
      this._options.cancelText || 'Cancel';

    switch (this._options.type) {
      case this.types.ALERT:
        win.querySelector(`#${remodal_id} button[data-remodal-action='cancel']`).style.display = 'none';
        break;
      case this.types.CONFIRM:
      case this.types.FORM:
      case this.types.INPUT:
        win.querySelector(`#${remodal_id} button[data-remodal-action='cancel']`).style.display = 'block';
        break;
    }

    win.querySelector(`#${remodal_id} [data-remodal-input]`).style.display =
      this._options.type !== this.types.INPUT ? 'none' : 'block';

    if (typeof this._options.init === 'function') this._options.init();

    this._show(remodal_id);
  };

  _show = remodal_id => {
    document.querySelector(`#${remodal_id}.remodal-bg`).style.display = 'flex';
    const win = this._state.get('window');
    win.style.top = '50%';
    win.style.left = '50%';
  };

  hide = remodal_id => {
    document.querySelector(`#${remodal_id}.remodal-bg`).style.display = 'none';
    this._state.set('start-pos', null);
  };

  //this is an opportunity for the user to return false, and prevent the hiding of the window.
  _confirm = async (remodal_id, val) => {
    if (typeof this._options.confirm !== 'function') {
      this.hide(remodal_id);
      return;
    }
    if ((await this._options.confirm(val)) !== false) {
      this.hide(remodal_id);
    }
  };

  _startDragging = e => {
    e.preventDefault();
    const pos = this._state.get('start-pos');
    this._state.set('start-pos', { x: e.clientX - (pos?.saveX || 0), y: e.clientY - (pos?.saveY || 0) });
    this._state.get('header').classList.add('grabbing');

    document.addEventListener('mousemove', this._moving);
    document.addEventListener('mouseup', this._endDragging);
  };

  _moving = e => {
    const pos = this._state.get('start-pos');
    const win = this._state.get('window');

    win.style.top = `calc(50% + ${e.clientY - pos.y}px)`;
    win.style.left = `calc(50% + ${e.clientX - pos.x}px`;

    this._state.set('start-pos', { x: pos.x, y: pos.y, saveX: e.clientX - pos.x, saveY: e.clientY - pos.y });
  };

  _endDragging = e => {
    this._state.get('header').classList.remove('grabbing');
    document.removeEventListener('mousemove', this._moving);
    document.removeEventListener('mouseup', this._endDragging);
  };

  _setup = remodal_id => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<div class='remodal-bg' id='${remodal_id}'>
        <div class='remodal' data-remodal-id='modal'>
          <div class='remodal-header'>
            <button data-remodal-action='close' class='remodal-close'>&#x00D7;</button>
            <h2 data-remodal-title></h2>
          </div>
          <div class='remodal-body'>
            <p data-remodal-message class='${this._options.message?.length > 0 ? '' : 'hidden'}'></p>
            <p data-remodal-input></p>
          </div>
          <div class='remodal-footer'>
            <button data-remodal-action='cancel' class='remodal-cancel'>cancel</button>
            <button data-remodal-action='confirm' class='remodal-confirm'>OK</button>
          </div>
        </div>
      </div>`
    );

    this._state.set('window', document.querySelector(`#${remodal_id} .remodal`));
    this._state.set('header', document.querySelector(`#${remodal_id} .remodal-header`));

    document.addEventListener('keyup', e => {
      if (e.key === 'Escape') {
        var event = new Event('cancellation', { bubbles: true, cancelable: false });
        this._state.get('window').dispatchEvent(event);
      }
    });

    this._state.get('header').addEventListener('mousedown', this._startDragging);

    document.querySelector(`#${remodal_id} .remodal-confirm`).addEventListener('click', ev => {
      ev.preventDefault();
      var event = new Event('confirmation', { bubbles: true, cancelable: false });
      this._state.get('window').dispatchEvent(event);
    });

    let cancels = document.querySelectorAll(`#${remodal_id} .remodal-cancel, #${remodal_id} .remodal-close`);
    cancels.forEach(btn =>
      btn.addEventListener('click', ev => {
        ev.preventDefault();
        var event = new Event('cancellation', { bubbles: true, cancelable: false });
        document.querySelector(`#${remodal_id} .remodal`).dispatchEvent(event);
      })
    );

    JSUtils.addGlobalEventListener(document, '.remodal', 'cancellation', () => {
      this.hide(remodal_id);
    });

    JSUtils.addGlobalEventListener(document, '.remodal', 'confirmation', async () => {
      if (this._options.type !== this.types.FORM) {
        var inp = document.querySelector(`#${remodal_id} .remodal [name=remodal-data-input]`);
        let val = inp ? inp.value : null;
        this._confirm(remodal_id, val);
      } else {
        let form = {};
        let inps = [
          ...document.querySelectorAll(`#${remodal_id} .remodal p[data-remodal-message] input`),
          ...document.querySelectorAll(`#${remodal_id} .remodal p[data-remodal-message] select`),
          ...document.querySelectorAll(`#${remodal_id} .remodal p[data-remodal-message] textarea`)
        ];

        inps.forEach(inp => {
          let name = inp.getAttribute('name');
          if (!name) return;
          if (inp.type === 'checkbox') {
            form[name] = inp.checked;
            return;
          }
          //if radio - take value only if checked, otherwise ignore
          if (inp.type === 'radio' && !inp.checked) return;
          form[name] = inp.value;
        });

        this._confirm(remodal_id, form);
      }
    });
  };
}

JSUtils.domReady(() => {
  if (!window['remodaler']) window['remodaler'] = new Remodaler();
});
