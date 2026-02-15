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
        test: /(?:hitmail|hotmail|htmail|hotmal|hotmil)\.(?:com|con|co|comm|comn)/i,
        corrected: /hotmail\.com/i
      }
    ];
    // List of sources
    const sources = [
      'https://raw.githubusercontent.com/ivolo/disposable-email-domains/master/index.json',
      'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/refs/heads/main/disposable_email_blocklist.conf',
      'https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.txt'
    ];

    // Fetch all sources in parallel
    const responses = await Promise.allSettled(sources.map(url => fetch(url).then(res => res.text())));

    let mergedDomains = new Set();

    responses.forEach(response => {
      if (response.status !== 'fulfilled') return;
      try {
        let data = response.value.trim().split(/\r?\n/);
        data.forEach(domain => mergedDomains.add(domain.toLowerCase()));
      } catch (error) {
        console.error('Error parsing domain list:', error);
      }
    });

    JSUtils.disposable_email_domains = Array.from(mergedDomains);
  } catch (e) {
    console.error(e);
  }
};

//background loading, do not wait
JSUtils.loadDisposableEmailDomains();

JSUtils.validateEmailAddress = async email => {
  email = email.toLowerCase().trim();
  var emailRE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/gi;

  if (!emailRE.test(email)) return false;

  let domain = email.split('@').pop();

  for (regx of JSUtils.unlikely_email_domains) {
    if (regx.test.test(domain) && !regx.corrected.test(domain)) return false;
  }

  if (Object.keys(JSUtils.unlikely_email_domains).indexOf(domain) >= 0) return false;

  if (JSUtils.disposable_email_domains && JSUtils.disposable_email_domains.indexOf(domain) >= 0) return false;

  let result = await JSUtils.fetch(window.wpjsutils_data.ajax_url, {
    action: 'check_email',
    email: email
  });

  return !!result.success;
};
