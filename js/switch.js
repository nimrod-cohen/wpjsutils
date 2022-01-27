JSUtils.domReady(() => {
  JSUtils.switch = input => {
    const round = input.classList.contains('round');
    const wrapper = document.createElement('label');
    wrapper.classList.add('switch-wrapper');
    input.parentNode.insertBefore(wrapper, input);

    wrapper.appendChild(input);
    wrapper.insertAdjacentHTML('beforeend', `<span class="slider ${round ? 'round' : ''}"></span>`);
  };

  let inputs = document.querySelectorAll('.wpjsutils.switch');
  inputs.forEach(input => JSUtils.switch(input));
});
