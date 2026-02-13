class Dropdown {
  state = window.StateManagerFactory();

  constructor(button, options, settings = {}) {
    this.state.set('open', false);
    this.state.set('button', button);
    this.state.set('options', options);
    this.state.set('settings', settings);

    this.state.listen('open', this.render);

    let domButton = document.querySelector(button);
    //catch events out of scope and close picker
    domButton.addEventListener('click', this.click);
    document.addEventListener('click', this.hide);

    // Listen for window resize and scroll to reposition menu
    window.addEventListener('resize', this.hide);
    window.addEventListener('scroll', this.updateMenuPosition);
  }

  hide = e => {
    this.state.set('open', false);
  };

  click = e => {
    e.preventDefault();
    e.stopPropagation();

    let open = this.state.get('open');
    this.state.set('open', !open);
  };

  updateMenuPosition = () => {
    let menuId = this.state.get('menu-id');
    if (!menuId) return;

    let button = document.querySelector(this.state.get('button'));
    let menu = document.getElementById(menuId);

    if (button && menu) {
      let buttonRect = button.getBoundingClientRect();
      const settings = this.state.get('settings');

      menu.style.top = buttonRect.bottom + window.scrollY + 'px';
      menu.style.minWidth = buttonRect.width + 'px';

      // Check if dropdown should align to the right
      if (settings?.alignRight) {
        menu.style.left = 'auto';
        menu.style.right = window.innerWidth - buttonRect.right + 'px';
      } else {
        menu.style.left = buttonRect.left + 'px';
        menu.style.right = 'auto';
      }
    }
  };

  render = () => {
    let open = this.state.get('open');
    let menuId = this.state.get('menu-id');
    const settings = this.state.get('settings');

    if (!menuId) {
      // Create menu as external element
      menuId = `dropdown-menu-${Math.floor(Math.random() * 1000000)}`;
      this.state.set('menu-id', menuId);

      let options = this.state.get('options');
      let menuHtml = `
        <span id='${menuId}' class='menu-wrapper ${settings?.class || ''}'><ul class='dropdown-menu'>
          ${options.map((curr, idx) => `<li class='menu-option' data-action-id=${idx}></li>`).join('')}
        </ul></span>
      `;

      document.body.insertAdjacentHTML('beforeend', menuHtml);

      let menu = document.getElementById(menuId);

      //add actions
      let opts = menu.querySelectorAll('.menu-option');
      opts.forEach(opt => {
        let idx = opt.dataset.actionId;
        opt.addEventListener('click', e => {
          e.stopPropagation();
          if (options[idx].action() !== false) {
            this.hide();
          } else if (typeof options[idx].text === 'function') {
            //update if needed
            opt.innerHTML = options[idx].text();
          }
        });
      });
    }

    // Update dropdown text on every render
    let options = this.state.get('options');
    let menuOptions = document.querySelectorAll(`#${menuId} .menu-option`);
    menuOptions.forEach((opt, idx) => {
      let text = typeof options[idx].text === 'function' ? options[idx].text() : options[idx].text;
      opt.innerHTML = text;
    });

    let menu = document.getElementById(menuId);
    if (open) {
      this.updateMenuPosition();
      menu.style.display = 'block';
      menu.classList.add('visible');
    } else {
      menu.style.display = 'none';
      menu.classList.remove('visible');
    }
  };

  // Add cleanup method for when dropdown is destroyed
  destroy = () => {
    let menuId = this.state.get('menu-id');
    if (menuId) {
      let menu = document.getElementById(menuId);
      if (menu) {
        menu.remove();
      }
    }

    window.removeEventListener('resize', this.hide);
    window.removeEventListener('scroll', this.updateMenuPosition);
  };
}
