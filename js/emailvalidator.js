JSUtils.loadDisposableEmailDomains = async () => {
  try {
    if (JSUtils.disposable_email_domains) return;

    JSUtils.unlikely_email_domains = {
      'gmail.co': 'gmail.com',
      'gmail.con': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gimal.com': 'gmail.com',
      'gmale.com': 'gmail.com',
      'gmil.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'gmsil.com': 'gmail.com',
      'yaoo.com': 'yahoo.com',
      'yahoo.con': 'yahoo.com',
      'yhaoo.com': 'yahoo.com',
      'walka.co.il': 'walla.co.il',
      'wall.co.il': 'walla.co.il'
    };

    let result = await (
      await fetch('https://raw.githubusercontent.com/ivolo/disposable-email-domains/master/index.json')
    ).json();
    JSUtils.disposable_email_domains = result;
  } catch (e) {
    console.error(e);
  }
};

//background loading, do not wait
JSUtils.loadDisposableEmailDomains();

JSUtils.validateEmailAddress = async email => {
  email = email.toLowerCase().trim();
  var emailRE = /^(?:\w+\+?(?:[\w\-]+)?\.?)+@[\w\-]+(\.\w+){1,}$/gi;

  if (!emailRE.test(email)) return false;

  let domain = email.split('@').pop();

  if (Object.keys(JSUtils.unlikely_email_domains).indexOf(domain) >= 0) return false;

  if (JSUtils.disposable_email_domains && JSUtils.disposable_email_domains.indexOf(domain) >= 0) return false;

  let result = await JSUtils.fetch(window.wpjsutils_data.ajax_url, {
    action: 'check_email',
    email: encodeURIComponent(email)
  });

  if (!result.success) return false;

  return true;
};
