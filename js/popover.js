/**
 *  Single, delegated popover manager
 * Uses data-content attribute on elements with .tooltip class
 */
class Popover {
  constructor() {
    this.popover = null;
    this.currentTrigger = null;
    this.TRIGGER_SELECTOR = '.tooltip[data-content]';

    // bind global listeners
    document.addEventListener('mouseover', this.handleMouseOver);
    document.addEventListener('mouseout', this.handleMouseOut);
    window.addEventListener('scroll', this.hide, { passive: true });
    window.addEventListener('resize', this.hide);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleMouseOver = e => {
    const trigger = e.target.closest(this.TRIGGER_SELECTOR);
    if (!trigger || trigger === this.currentTrigger) return;
    this.show(trigger);
  };

  handleMouseOut = e => {
    const fromTrigger = e.target.closest(this.TRIGGER_SELECTOR);
    if (!fromTrigger) return;
    const toTrigger = e.relatedTarget && e.relatedTarget.closest(this.TRIGGER_SELECTOR);
    if (fromTrigger !== toTrigger) this.hide();
  };

  handleKeyDown = e => {
    if (e.key === 'Escape') this.hide();
  };

  getDirection = el => {
    const dir = ['pop-top', 'pop-right', 'pop-bottom', 'pop-left'].find(d => el.classList.contains(d)) || 'pop-top';
    return dir.replace('pop-', '');
  };

  show = trigger => {
    this.hide();
    const content = trigger.getAttribute('data-content');
    if (!content) return;

    const direction = this.getDirection(trigger);
    this.popover = document.createElement('div');
    this.popover.className = `popover ${direction}`;
    this.popover.textContent = content;
    document.body.appendChild(this.popover);

    const rect = trigger.getBoundingClientRect();
    const popoverRect = this.popover.getBoundingClientRect();
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

    this.popover.style.top = `${top}px`;
    this.popover.style.left = `${left}px`;

    this.currentTrigger = trigger;
  };

  hide = () => {
    if (this.popover) {
      this.popover.remove();
      this.popover = null;
      this.currentTrigger = null;
    }
  };
}

// instantiate once
new Popover();
