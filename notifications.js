if (typeof window.notifications === 'undefined') {
  class Notifcations {
    show = (message, type = 'info') => {
      let id = `notification_${Math.floor(Math.random() * 10000000)}`;

      const icons = {
        info: 'info-circle',
        success: 'check-circle',
        error: 'exclamation-circle'
      };

      document.body.insertAdjacentHTML(
        'beforeend',
        `
      <div class='notification_wrapper' id=${id}>
        <div class='notification ${type}'>
          <i class='fa fa-${icons[type]}'></i>
          <span>${message}</span>
        </div>
      </div>
    `
      );

      setTimeout(() => {
        let elem = document.querySelector(`#${id}`);
        elem.parentNode.removeChild(elem);
      }, 3000);
    };
  }

  window.notifications = new Notifcations();
}
