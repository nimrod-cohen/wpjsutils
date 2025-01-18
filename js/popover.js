class Popover {
  constructor(element) {
    // prevent double initialization
    if (element._jsutils_popover) return;

    this.element = element;
    this.element.style.position = 'relative';
    this.element.addEventListener('mouseover', this.showPopover);

    this.element.addEventListener('mouseleave', ev => {
      ev.stopPropagation();
      if (!this.element.contains(ev.relatedTarget)) {
        this.hidePopover();
      }
    });

    this.element._jsutils_popover = true;
  }

  showPopover = () => {
    if (this.element.querySelector('.popover')) return;

    let content = this.element.getAttribute('data-content');

    this.element.insertAdjacentHTML('beforeend', `<div class='popover'>${content}</div>`);

    let popover = this.element.querySelector('.popover');
    popover.style.top = `${-1 * popover.getBoundingClientRect().height - 8}px`;
  };

  hidePopover = () => {
    let popover = this.element.querySelector('.popover');
    if (popover) {
      this.element.removeChild(popover);
    }
  };
}
