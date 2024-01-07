class Remodaler {
  types = {
    ALERT: 0,
    CONFIRM: 1,
    INPUT: 2,
    FORM: 3
  };

  _initialized = false;
  _options = null;
  _state = window.StateManagerFactory();

  show = options => {
    this._options = options;

    if (!this._initialized) this._init();

    const win = this._state.get('window');

    if (typeof this._options.type === 'undefined') this._options.type = this.types.ALERT;

    win.querySelector('h2[data-remodal-title]').innerText = this._options.title;
    win.querySelector('p[data-remodal-message]').innerHTML = this._options.message;

    if (this._options.type === this.types.INPUT) {
      if (typeof this._options.values === 'undefined')
        document.querySelector('.remodal p[data-remodal-input]').innerHTML =
          "<input type='text' name='remodal-data-input'>";
      else {
        var select = "<select name='remodal-data-input'>";
        for (var i = 0; i < this._options.values.length; i++) {
          var val = this._options.values[i];
          select += "<option value='" + val.value + "'>" + val.title + '</option>';
        }
        select += '</select>';
        document.querySelector('.remodal p[data-remodal-input]').innerHTML = select;
      }
    }

    win.querySelector("button[data-remodal-action='confirm']").innerText =
      this._options.confirmText || 'Confirm';
      win.querySelector("button[data-remodal-action='cancel']").innerText =
      this._options.cancelText || 'Cancel';

    switch (this._options.type) {
      case this.types.ALERT:
        win.querySelector("button[data-remodal-action='cancel']").style.display = 'none';
        break;
      case this.types.CONFIRM:
      case this.types.FORM:
      case this.types.INPUT:
        win.querySelector("button[data-remodal-action='cancel']").style.display = 'block';
        break;
    }

    win.querySelector('[data-remodal-input]').style.display =
      this._options.type !== this.types.INPUT ? 'none' : 'block';

    if (typeof this._options.init === 'function') this._options.init();

    this._show();
  }

  _show = () => {
    document.querySelector('.remodal-bg').style.display = 'flex';
    const win = this._state.get('window');
    win.style.top = '50%';
    win.style.left = '50%';
  }

  hide = () => {
    document.querySelector('.remodal-bg').style.display = 'none';
    this._state.set('start-pos', null);
  }


    //this is an opportunity for the user to return false, and prevent the hiding of the window.
  _confirm = val => {
    if (typeof this._options.confirm !== 'function') {
      this.hide();
      return;
    }
    if(this._options.confirm(val) !== false) {
      this.hide();
    }
  }

  _startDragging = e => {
    e.preventDefault();
    const pos = this._state.get('start-pos')
    this._state.set('start-pos', { x: e.clientX - (pos?.saveX || 0), y: e.clientY - (pos?.saveY || 0) });
    this._state.get('header').classList.add('grabbing');

    document.addEventListener('mousemove', this._moving);
    document.addEventListener('mouseup', this._endDragging);
  }

  _moving = e => {
    const pos = this._state.get('start-pos');
    const win = this._state.get('window');

    win.style.top = `calc(50% + ${e.clientY - pos.y}px)`;
    win.style.left = `calc(50% + ${e.clientX - pos.x}px`;
    
    this._state.set('start-pos', {x: pos.x, y: pos.y, saveX: e.clientX - pos.x, saveY: e.clientY - pos.y });
  }

  _endDragging = e => {
    this._state.get('header').classList.remove('grabbing');
    document.removeEventListener('mousemove', this._moving);
    document.removeEventListener('mouseup', this._endDragging);
  }


  _init = () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<div class='remodal-bg'>
        <div class='remodal' data-remodal-id='modal'>
          <div class='remodal-header'>
            <button data-remodal-action='close' class='remodal-close'>&#x00D7;</button>
            <h2 data-remodal-title></h2>
          </div>
          <div class='remodal-body'>
            <p data-remodal-message></p>
            <p data-remodal-input></p>
          </div>
          <div class='remodal-footer'>
            <button data-remodal-action='cancel' class='remodal-cancel'>cancel</button>
            <button data-remodal-action='confirm' class='remodal-confirm'>OK</button>
          </div>
        </div>
      </div>`
    );

    this._state.set('window', document.querySelector('.remodal'));
    this._state.set('header', document.querySelector('.remodal-header'));

    document.addEventListener('keyup', e => {
      if(e.key === "Escape") {
        var event = new Event('cancellation', { bubbles: true, cancelable: false });
        this._state.get('window').dispatchEvent(event);
      }
    })

    this._state.get('header').addEventListener('mousedown', this._startDragging);

    document.querySelector('.remodal-confirm').addEventListener('click', ev => {
      ev.preventDefault();
      var event = new Event('confirmation', { bubbles: true, cancelable: false });
      this._state.get('window').dispatchEvent(event);
    });

    let cancels = document.querySelectorAll('.remodal-cancel, .remodal-close');
    cancels.forEach(btn =>
      btn.addEventListener('click', ev => {
        ev.preventDefault();
        var event = new Event('cancellation', { bubbles: true, cancelable: false });
        document.querySelector('.remodal').dispatchEvent(event);
      })
    );

    JSUtils.addGlobalEventListener(document, '.remodal', 'cancellation', this.hide);

    JSUtils.addGlobalEventListener(document, '.remodal', 'confirmation', () => {
      if (this._options.type !== this.types.FORM) {
        var inp = document.querySelector('.remodal [name=remodal-data-input]');
        let val = inp ? inp.value : null;
        this._confirm(val);
      } else {
        let form = {};
        let inps = [
          ...document.querySelectorAll('.remodal p[data-remodal-message] input'),
          ...document.querySelectorAll('.remodal p[data-remodal-message] select'),
          ...document.querySelectorAll('.remodal p[data-remodal-message] textarea')
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
        
        this._confirm(form);
      }
    });

    this._initialized = true;
  }
}

JSUtils.domReady(() => {
  if (!window['remodaler'])
  window['remodaler'] = new Remodaler();
})
