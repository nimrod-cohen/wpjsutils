class TagCloud {
  state = window.StateManagerFactory();

  constructor({ container, initialValues, callback }) {
    this.state.listen('tags', this.render);
    container.classList.add('tag-cloud');
    this.state.set('container', container);
    this.state.set('callback', callback);
    const inputId = JSUtils.guid('inp_');
    this.state.set('input-id', inputId);

    JSUtils.addGlobalEventListener(container, 'i.remove-tag', 'click', this.removeTag);
    JSUtils.addGlobalEventListener(container, `#${inputId}`, 'keydown', this.addTag, false);

    this.state.set('tags', initialValues || []);
  }

  addTag = e => {
    if (!['Enter', ','].includes(e.key)) return;

    e.stopPropagation();
    e.preventDefault();

    let newTags = [...this.state.get('tags'), e.target.value];
    e.target.value = '';
    this.state.set('tags', newTags);
    this.state.get('callback')(newTags);
  };

  removeTag = e => {
    e.preventDefault();

    let value = e.target.closest('span.tag').dataset.value;
    let newTags = this.state.get('tags');
    let index = newTags.indexOf(value);
    newTags = [...newTags.slice(0, index), ...newTags.slice(index + 1)];
    this.state.get('callback')(newTags);
    this.state.set('tags', newTags);
  };

  render = () => {
    const tags = this.state.get('tags');
    const container = this.state.get('container');
    const inputId = this.state.get('input-id');
    if (!container.querySelector(`#${inputId}`)) {
      container.insertAdjacentHTML('beforeend', `<input class='new-tag-input' id=${inputId} type='text' value=''>`);
    }

    const input = container.querySelector(`#${inputId}`);

    container.querySelectorAll('.tag').forEach(tag => tag.remove());

    container.dataset.tags = tags.join(',');

    tags.forEach(tag => {
      input.insertAdjacentHTML(
        'beforebegin',
        `<span data-value='${tag}' class='tag'>${tag} <i class='remove-tag'>+</i></span>`
      );
    });
  };
}
