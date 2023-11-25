/**
 * Class representing a tag cloud component
 */
class TagCloud {
  state = window.StateManagerFactory();

  /**
   * Create a tag cloud component.
   * @param {DOMElement} container - the containing div, should be empty dom elemenet.
   * @param {Array} initialValues - initial tag list.
   * @param {function} callback - a callback function to update the list of tags
   * @param {Object} options - a set of options:
   *  unique - should the list be unique values,
   *  ignoreCase - should the uniqueness be kept with case insensitivity.
   *  lowerCase - should the tags be low cased before saving
   */
  constructor({ container, initialValues, callback, options }) {
    let opts = {
      unique: true,
      lowerCase: true,
      ...options
    };

    this.state.set('options', opts);

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

    let val = e.target.value.trim();

    const options = this.state.get('options');
    const tags = this.state.get('tags');

    if (options.lowerCase) val = val.toLowerCase();

    if (options.unique && tags.includes(val)) return;

    let newTags = [...tags, val];
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
