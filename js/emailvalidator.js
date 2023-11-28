JSUtils.loadDisposableEmailDomains = async () => {
  try {
    if (JSUtils.disposable_email_domains) return;

    JSUtils.unlikely_email_domains = [
      {
        test: /(?:gnail|gimil|gmail|gimail|gemail|gamil|gimal|gmale|gmal|gmai|gmil|gmial|gmaill|gmsil|g\-mail|gimeil|gmaiil)\.(?:com|con|co|co\.il|comm|comn)$/i,
        corrected: /gmail\.com/i
      },
      {
        test: /(?:yaho|tahoo|yaoo|yahoo|yhaoo)\.(?:com|con|co|co\.il|comm|comn)$/i,
        corrected: /yahoo\.com/i
      },
      {
        test: /(?:walka|wall|walla)\.(?:co\.li|co\.il)$/i,
        corrected: /walla\.co\.il/i
      },
      {
        test: /(?:walka|wall|walla)\.(?:com|con|co|comm|comn)$/i,
        corrected: /walla\.com/i
      },
      {
        test: /(?:hitmail|hotmail)\.(?:com|con|co|comm|comn)/i,
        corrected: /hotmail\.com/i
      }
    ];

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

  for (regx of JSUtils.unlikely_email_domains) {
    if (regx.test.test(domain) && !regx.corrected.test(domain)) return false;
  }

  if (Object.keys(JSUtils.unlikely_email_domains).indexOf(domain) >= 0) return false;

  if (JSUtils.disposable_email_domains && JSUtils.disposable_email_domains.indexOf(domain) >= 0) return false;

  let result = await JSUtils.fetch(window.wpjsutils_data.ajax_url, {
    action: 'check_email',
    email: encodeURIComponent(email)
  });

  return !!result.success;
};
