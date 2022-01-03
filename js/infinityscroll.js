class InfinityScroll {
  element = null;
  retrieving = false;
  page = 0;
  finished = false;
  callback = null;

  constructor(element, callback) {
    this.callback = callback;
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    this.element.addEventListener('scroll', this.handleScroll);
    this.handleScroll();
  }

  handleScroll = async e => {
    if (
      this.finished ||
      this.retrieving ||
      this.element.scrollTop + this.element.clientHeight < this.element.scrollHeight - 200 ||
      this.element.scrollTop + this.element.clientHeight < this.element.scrollHeight * 0.8
    )
      return;

    this.retrieving = true;

    this.page++;
    this.finished = await this.callback(this.page); //callback should return false if done, otherwise true
    this.retrieving = false;
  };
}
