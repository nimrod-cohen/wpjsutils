class Slideout {
  static #instance = null;

  types = {
    FORM: 'form'
  };

  static get_instance() {
    if (!Slideout.#instance) {
      Slideout.#instance = new Slideout();
    }

    return Slideout.#instance;
  }

  _options = null;
  _state = window.StateManagerFactory();

  show = options => {
    this._options = options;

    const panel_id = `slideout-panel-${JSUtils.guid()}`;

    this._setup(panel_id);

    const win = this._state.get('window');

    if (typeof this._options.type === 'undefined') this._options.type = this.types.FORM;

    document.querySelector(`#${panel_id} h2[data-panel-title]`).innerText = this._options.title;
    document.querySelector(`#${panel_id} div[data-panel-message]`).innerHTML = this._options.message;

    document.querySelector(`#${panel_id} button[data-panel-action='confirm']`).innerText =
      this._options.confirmText || 'Confirm';
    document.querySelector(`#${panel_id} button[data-panel-action='cancel']`).innerText =
      this._options.cancelText || 'Cancel';

    // Always show cancel button for forms
    document.querySelector(`#${panel_id} button[data-panel-action='cancel']`).style.display = 'block';

    document.querySelector(`#${panel_id}`).style.display = 'flex';
    
    // Trigger slide-in animation
    setTimeout(() => {
      win.classList.add('slide-in');
    }, 10);
  };

  hide = panel_id => {
    const panel = document.querySelector(`#${panel_id}`);
    if (panel) {
      const slideoutPanel = panel.querySelector('.slideout-panel');
      slideoutPanel.classList.remove('slide-in');
      slideoutPanel.classList.add('slide-out');
      
      setTimeout(() => {
        panel.remove();
      }, 300);
    }
  };

  _confirm = (panel_id, data) => {
    if (this._options.confirm) {
      this._options.confirm(data);
    }
    this.hide(panel_id);
  };

  _setup = panel_id => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `
      <div id="${panel_id}" class="slideout-bg" style="display: none;">
        <div class="slideout-panel">
          <div class="slideout-header">
            <h2 data-panel-title></h2>
            <button class="slideout-close" data-panel-action="close">×</button>
          </div>
          <div class="slideout-body">
            <div data-panel-message></div>
            <div data-panel-input></div>
          </div>
          <div class="slideout-footer">
            <button class="slideout-cancel" data-panel-action="cancel"></button>
            <button class="slideout-confirm" data-panel-action="confirm"></button>
          </div>
        </div>
      </div>
      `
    );

    this._state.set('window', document.querySelector(`#${panel_id} .slideout-panel`));

    setTimeout(() => {
      const checkboxes = document.querySelectorAll(`#${panel_id} input[type='checkbox']`);
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
          if (e.target.type === 'checkbox') {
            e.stopPropagation();
          }
        });
      });
    }, 100);

    // Add event listeners
    JSUtils.addGlobalEventListener(
      document,
      `#${panel_id} button[data-panel-action='close']`,
      'click',
      () => this.hide(panel_id)
    );

    JSUtils.addGlobalEventListener(
      document,
      `#${panel_id} button[data-panel-action='cancel']`,
      'click',
      () => this.hide(panel_id)
    );

    JSUtils.addGlobalEventListener(
      document,
      `#${panel_id} button[data-panel-action='confirm']`,
      'click',
      () => {
        let form = {};
        let inps = [
          ...document.querySelectorAll(`#${panel_id} .slideout-panel div[data-panel-message] input`),
          ...document.querySelectorAll(`#${panel_id} .slideout-panel div[data-panel-message] select`),
          ...document.querySelectorAll(`#${panel_id} .slideout-panel div[data-panel-message] textarea`)
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

        this._confirm(panel_id, form);
      }
    );

    // Close on background click
    JSUtils.addGlobalEventListener(
      document,
      `#${panel_id}`,
      'click',
      (e) => {
        if (e.target.id === panel_id) {
          this.hide(panel_id);
        }
      }
    );
  };
}

JSUtils.domReady(() => {
  if (!window['slideout']) {
    window.slideout = Slideout.get_instance();
  }
});