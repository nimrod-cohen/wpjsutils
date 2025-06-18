class Popover {
  constructor(element) {
    if (element._jsutils_popover) return;

    this.element = element;
    this.element.addEventListener('mouseover', this.showPopover);
    this.element.addEventListener('mouseleave', this.hidePopover);

    this.element._jsutils_popover = true;
  }

  showPopover = () => {
    if (document.querySelector('.popover')) return;

    const content = this.element.getAttribute('data-content');
    let direction =
      ['pop-top', 'pop-right', 'pop-bottom', 'pop-left'].find(dir => this.element.classList.contains(dir)) || 'pop-top';
    direction = direction.replace('pop-', '');

    const popover = document.createElement('div');
    popover.className = `popover ${direction}`;
    popover.textContent = content;

    document.body.appendChild(popover);

    const rect = this.element.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    let top, left;

    switch (direction) {
      case 'top':
        top = rect.top + window.scrollY - popoverRect.height - 8;
        left = rect.left + window.scrollX + rect.width / 2 - popoverRect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + window.scrollY + 8;
        left = rect.left + window.scrollX + rect.width / 2 - popoverRect.width / 2;
        break;
      case 'right':
        top = rect.top + window.scrollY + rect.height / 2 - popoverRect.height / 2;
        left = rect.right + window.scrollX + 8;
        break;
      case 'left':
        top = rect.top + window.scrollY + rect.height / 2 - popoverRect.height / 2;
        left = rect.left + window.scrollX - popoverRect.width - 8;
        break;
    }

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    this._popoverEl = popover;
  };

  hidePopover = () => {
    if (this._popoverEl) {
      this._popoverEl.remove();
      this._popoverEl = null;
    }
  };
}
