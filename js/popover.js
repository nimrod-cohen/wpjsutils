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
    const popover = document.createElement('div');
    popover.className = 'popover';
    popover.textContent = content;

    document.body.appendChild(popover);

    const rect = this.element.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    popover.style.top = `${rect.top + window.scrollY - popoverRect.height - 8}px`;
    popover.style.left = `${rect.left + window.scrollX}px`;

    this._popoverEl = popover;
  };

  hidePopover = () => {
    if (this._popoverEl) {
      this._popoverEl.remove();
      this._popoverEl = null;
    }
  };
}
