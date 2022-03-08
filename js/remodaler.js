(function () {
  if (!window['remodaler'])
    window['remodaler'] = {
      types: {
        ALERT: 0,
        CONFIRM: 1,
        INPUT: 2,
        FORM: 3
      },
      _initialized: false,
      _options: null,
      show: function (options) {
        var self = this;

        self._options = options;

        if (!self._initialized) self._init();

        if (typeof self._options.type === 'undefined') self._options.type = self.types.ALERT;

        document.querySelector('.remodal h2[data-remodal-title]').innerText = self._options.title;
        document.querySelector('.remodal p[data-remodal-message]').innerHTML = self._options.message;

        if (self._options.type === self.types.INPUT) {
          if (typeof self._options.values === 'undefined')
            document.querySelector('.remodal p[data-remodal-input]').innerHTML =
              "<input type='text' name='remodal-data-input'>";
          else {
            var select = "<select name='remodal-data-input'>";
            for (var i = 0; i < self._options.values.length; i++) {
              var val = self._options.values[i];
              select += "<option value='" + val.value + "'>" + val.title + '</option>';
            }
            select += '</select>';
            document.querySelector('.remodal p[data-remodal-input]').innerHTML = select;
          }
        }

        document.querySelector(".remodal button[data-remodal-action='confirm']").innerText =
          self._options.confirmText || 'Confirm';
        document.querySelector(".remodal button[data-remodal-action='cancel']").innerText =
          self._options.cancelText || 'Cancel';

        switch (self._options.type) {
          case self.types.ALERT:
            document.querySelector(".remodal button[data-remodal-action='cancel']").style.display = 'none';
            break;
          case self.types.CONFIRM:
          case self.types.FORM:
          case self.types.INPUT:
            document.querySelector(".remodal button[data-remodal-action='cancel']").style.display = 'block';
            break;
        }

        document.querySelector('[data-remodal-input]').style.display =
          self._options.type !== self.types.INPUT ? 'none' : 'block';

        if (typeof this._options.init === 'function') this._options.init();

        self._show();
      },

      _show: function () {
        document.querySelector('.remodal-bg').style.display = 'flex';
      },

      _confirm: function (val) {
        if (typeof this._options.confirm === 'function') this._options.confirm(val);
      },

      _init: function () {
        document.body.insertAdjacentHTML(
          'afterend',
          `<div class='remodal-bg'>
            <div class='remodal' data-remodal-id='modal'>
              <div class='remodal-header'>
                <button data-remodal-action='close' class='remodal-close'>&#x00D7;</button>
                <h2 data-remodal-title></h2>
              </div>
              <p data-remodal-message></p>
              <p data-remodal-input></p>
              <button data-remodal-action='confirm' class='remodal-confirm'>OK</button>
              <button data-remodal-action='cancel' class='remodal-cancel'>cancel</button>
            </div>
          </div>`
        );

        document.querySelector('.remodal-confirm').addEventListener('click', ev => {
          ev.preventDefault();
          document.querySelector('.remodal-bg').style.display = 'none';
          var event = new Event('confirmation', { bubbles: true, cancelable: false });
          document.querySelector('.remodal').dispatchEvent(event);
        });

        let cancels = document.querySelectorAll('.remodal-cancel, .remodal-close');
        cancels.forEach(btn =>
          btn.addEventListener('click', ev => {
            ev.preventDefault();
            document.querySelector('.remodal-bg').style.display = 'none';
            var event = new Event('cancellation', { bubbles: true, cancelable: false });
            document.querySelector('.remodal').dispatchEvent(event);
          })
        );

        var self = this;
        JSUtils.addGlobalEventListener(document, '.remodal', 'confirmation', () => {
          if (self._options.type !== self.types.FORM) {
            var inp = document.querySelector('.remodal [name=remodal-data-input]');
            let val = inp ? inp.value : null;
            self._confirm(val);
          } else {
            let form = {};
            document.querySelectorAll('.remodal p[data-remodal-message] input').forEach(inp => {
              let name = inp.getAttribute('name');
              if (!name) return;
              if (inp.type === 'checkbox') form[name] = inp.checked;
              //if radio - take value only if checked, otherwise ignore
              else if (inp.type !== 'radio' || inp.checked) form[name] = inp.value;
            });
            self._confirm(form);
          }
        });

        this._initialized = true;
      }
    };
})();
