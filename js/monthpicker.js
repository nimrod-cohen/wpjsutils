class MonthPicker {
  state = window.StateManagerFactory();

  constructor() {
    let date = new Date();
    this.state.set('current-year', date.getFullYear());

    //set default value
    this.state.set('selected', { year: null, month: null });
    this.state.set('visible', false);
    this.state.set('current-picker', null);

    //init events
    JSUtils.addGlobalEventListener(document, '.monthpicker-container .years .promote', 'click', this.promoteYear);
    JSUtils.addGlobalEventListener(document, '.monthpicker-container .months > div', 'click', this.chooseMonth);

    //catch events out of scope and close picker
    document.addEventListener('click', this.hidePicker);

    ///attach picker functionallity to all dom elements.
    let inputs = document.querySelectorAll('.monthpicker');
    inputs.forEach(input => {
      if (input.value) {
        input.setAttribute('year', input.value.substring(3));
        input.setAttribute('month', input.value.substring(0, 2));
      }
      input.addEventListener('focus', () => this.showPicker(input));
    });

    this.state.listen('visible', this.loadPersistance);
    this.state.listen('current-year', this.render);
    this.state.listen('selected', this.render);
    this.state.listen('selected', this.updateInput);
  }

  updateInput = selected => {
    let input = this.state.get('current-picker');
    if (!input) return;

    input.value = `${selected.month.toString().padStart(2, '0')}/${selected.year.toString().padStart(4, '0')}`;
    input.setAttribute('year', selected.year);
    input.setAttribute('month', selected.month);
  };

  chooseMonth = e => {
    let year = this.state.get('current-year');
    let month = e.target.getAttribute('data');
    let today = new Date();
    if (year === today.getFullYear() && month > today.getMonth() + 1) return;

    this.state.set('selected', { year, month });
  };

  hidePicker = e => {
    let container = document.body.querySelector('.monthpicker-container');
    if (!container) {
      this.state.set('current-picker', null);
      this.state.set('visible', false);
      this.state.set('selected', { year: null, month: null });
      return;
    }

    let picker = this.state.get('current-picker');
    if (e.target === container || container.contains(e.target) || e.target === picker) {
      e.stopPropagation();
    } else {
      this.state.set('current-picker', null);
      this.state.set('visible', false);
      this.state.set('selected', { year: null, month: null });
      this.render();
    }
  };

  showPicker = input => {
    this.state.set('current-picker', input);
    if (input.getAttribute('month')) {
      let selected = {
        month: parseInt(input.getAttribute('month')),
        year: parseInt(input.getAttribute('year'))
      };
      this.state.set('selected', selected);
      this.state.set('current-year', selected.year);
    }
    this.state.set('visible', true);
  };

  promoteYear = e => {
    let yearField = document.querySelector('.monthpicker-container #mp-year');
    let val = parseInt(e.target.getAttribute('data-value'));
    let year = this.state.get('current-year');
    year += val;

    if (year > new Date().getFullYear()) return;

    this.state.set('current-year', year);
    yearField.innerText = year;
  };

  loadPersistance = visible => {
    if (!visible) return;

    //load selection from persistance
    let input = this.state.get('current-picker');
    if (input.getAttribute('month')) {
      let selected = {
        month: parseInt(input.getAttribute('month')),
        year: parseInt(input.getAttribute('year'))
      };
      this.state.set('selected', selected);
    } else {
      this.render();
    }
  };

  render = () => {
    let visible = this.state.get('visible');

    let container = document.body.querySelector('.monthpicker-container');
    if (!container) {
      document.body.insertAdjacentHTML(
        'beforeend',
        `<div class='monthpicker-container'>
          <div class='years'>
            <div class='promote prev' data-value='-1'>&larr;</div>
            <div id='mp-year'></div>
            <div class='promote next' data-value='1'>&rarr;</div>
          </div>
          <div class='months'>
            <div data='1'>JAN</div>
            <div data='2'>FEB</div>
            <div data='3'>MAR</div>
            <div data='4'>APR</div>
            <div data='5'>MAY</div>
            <div data='6'>JUN</div>
            <div data='7'>JUL</div>
            <div data='8'>AUG</div>
            <div data='9'>SEP</div>
            <div data='10'>OCT</div>
            <div data='11'>NOV</div>
            <div data='12'>DEC</div>
          </div>
        </div>`
      );
      container = document.body.querySelector('.monthpicker-container');
    }

    if (!visible) {
      container.classList.remove('visible');
      return;
    }
    container.classList.add('visible');

    let selected = this.state.get('selected');
    let currentYear = this.state.get('current-year');

    //fix calendar
    let picker = this.state.get('current-picker');
    let pos = picker.getBoundingClientRect();
    pos = {
      top: pos.top + picker.offsetHeight + window.scrollY + 2,
      left: pos.left + window.scrollX
    };
    container.style.top = `${pos.top}px`;
    container.style.left = `${pos.left}px`;

    container.querySelector('.years #mp-year').innerText = currentYear;
    container.querySelectorAll('.months > div').forEach(month => month.classList.remove('selected'));

    if (currentYear === selected.year)
      container.querySelector(`.months div[data='${selected.month}']`).classList.add('selected');

    //disable future
    let today = new Date();
    if (currentYear === today.getFullYear()) {
      container.querySelector('.years .promote.next').classList.add('disabled');
      let month = today.getMonth() + 2; //months are counted from 0, and we want the next month and on.
      for (month; month <= 12; month++) {
        container.querySelector(`.months > div[data='${month}']`).classList.add('disabled');
      }
    } else {
      container.querySelector('.years .promote.next').classList.remove('disabled');
      container.querySelectorAll('.months > div').forEach(month => month.classList.remove('disabled'));
    }
  };
}

//run as global
window.monthPicker = null;
JSUtils.domReady(() => {
  window.monthPicker = new MonthPicker();
});

//TODO: window resize event
//catch drop up if no place down
