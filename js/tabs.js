JSUtils.domReady(() => {
  const showPanel = (tabArea, panelId) => {
    [...tabArea.querySelectorAll('.panel')].forEach(panel => panel.classList.remove('active'));
    tabArea.querySelector(`#${panelId}.panel`).classList.add('active');
    [...tabArea.querySelectorAll('.tab-list li')].forEach(tab => tab.classList.remove('active'));
    tabArea.querySelector(`.tab-list li[data-panel-id='${panelId}']`).classList.add('active');
  };

  const tabClicked = e => {
    e.preventDefault();
    let tabArea = e.target.closest('.wpjsutils-tabs')
    showPanel(tabArea, e.target.dataset.panelId);
  };

  const tabAreas = document.querySelectorAll('.wpjsutils-tabs');

  [...tabAreas].forEach(tabArea => {
    var panels = tabArea.querySelectorAll('.panel');
    panels = [...panels];
    
    if(!panels.some((tab) => tab.classList.contains('active'))) {
      showPanel(tabArea, panels[0].id)
    }

    var tabs = tabArea.querySelectorAll('.tab-list li');
    
    [...tabs].forEach(tab => {
      tab.addEventListener('click', tabClicked);
    })
  });
});