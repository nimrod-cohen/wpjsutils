class Dropdown {
  state = window.StateManagerFactory();

  constructor(button, options) {
    this.state.set('open', false);
    this.state.set('options', options);
    this.state.set('button', button);
    this.state.listen('open', this.render);

    let domButton = document.querySelector(button);
    //catch events out of scope and close picker
    domButton.addEventListener('click', this.click);
    document.addEventListener('click', this.hide);
  }

  hide = e => {
    this.state.set('open', false);
  };

  click = e => {
    e.stopPropagation();

    let open = this.state.get('open');
    this.state.set('open', !open);
  };

  render = () => {
    let open = this.state.get('open');
    let button = this.state.get('button');
    button = document.querySelector(button);
    let wrapperId = this.state.get('wrapper-id');

    if (!wrapperId) {
      let parent = button.parentNode;
      //wrap button
      wrapperId = `menu-wrapper-${Math.floor(Math.random() * 1000000)}`;
      this.state.set('wrapper-id', wrapperId);

      parent.insertAdjacentHTML('beforeend', `<span class='menu-wrapper' id='${wrapperId}'></span>`);

      let wrapper = document.querySelector(`#${wrapperId}`);
      wrapper.appendChild(button);

      let options = this.state.get('options');
      let menuOptions =
        `<ul class='dropdown-menu'>` +
        options.reduce((agg, curr, idx) => {
          agg += `<div class='menu-option' data-action-id=${idx}>${curr.text}</div>`;
          return agg;
        }, '') +
        '</ul>';

      wrapper.insertAdjacentHTML('beforeend', menuOptions);

      //add actions
      let opts = wrapper.querySelectorAll('.menu-option');
      opts.forEach(opt => {
        let idx = opt.dataset.actionId;
        opt.addEventListener('click', e => {
          e.stopPropagation();
          this.hide();
          options[idx].action();
        });
      });

      //push the menu below the button
      let menu = document.querySelector(`#${wrapperId} .dropdown-menu`);
      menu.style.top = button.offsetHeight + 'px';
    }

    let menu = document.querySelector(`#${wrapperId} .dropdown-menu`);
    if (open) menu.classList.add('visible');
    else menu.classList.remove('visible');
  };
}
