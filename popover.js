class Popover {
  constructor(element) {
    this.element = element;
    this.element.style.position = 'relative';

    this.showPopover();
  }

  showPopover = () => {
    if (this.element.querySelector('.popover')) return;

    let content = this.element.getAttribute('data-content');

    this.element.insertAdjacentHTML('beforeend', `<div class='popover'>${content}</div>`);

    this.element.addEventListener('mouseout', this.hidePopover);

    let popover = this.element.querySelector('.popover');
    popover.style.top = `${-1 * popover.getBoundingClientRect().height - 8}px`;
  };

  hidePopover = () => {
    let popover = this.element.querySelector('.popover');
    if (popover) {
      this.element.removeChild(popover);
    }

    this.element.removeEventListener('mouseout', this.hidePopover);
  };
}
