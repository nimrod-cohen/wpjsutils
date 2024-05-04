console.log('wpjsutils initializing');

window.JSUtils = window.JSUtils || {
  copyToClipboard: text => {
    if (!navigator.clipboard) {
      var inp = document.createElement('input');
      inp.value = text;
      inp.style.position = 'fixed';
      inp.style.top = '-1000px';
      document.body.appendChild(inp);
      inp.focus();
      inp.select();
      inp.setSelectionRange(0, 99999);
      document.execCommand('copy');
      document.body.removeChild(inp);
    } else {
      navigator.clipboard.writeText(text);
    }
  },

  guid: (prefix = '') => {
    const s4 = () =>
      Math.floor(Math.random() * 65536)
        .toString(16)
        .padStart(4, '0');
    let p = prefix || '';
    return p + s4() + s4() + '-' + s4() + '-' + '4' + s4().substring(1) + '-' + s4() + '-' + s4() + s4() + s4();
  },

  //deep clone an object
  clone: obj => {
    if (
      obj === null ||
      typeof obj !== 'object' ||
      obj instanceof Node ||
      obj instanceof HTMLElement ||
      obj instanceof Element
    ) {
      return obj; // Return the value if not an object
    }

    // Create a new object or array based on the original's constructor
    const clone = Array.isArray(obj) ? [] : {};

    // Iterate through each key in the object
    for (let key in obj) {
      // Recursively deep clone nested objects and arrays
      clone[key] = JSUtils.clone(obj[key]);
    }

    return clone;
  },

  //wait for document to be ready
  domReady: fn => {
    if (
      document.readyState === 'complete' ||
      (document.readyState !== 'loading' && !document.documentElement.doScroll)
    ) {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  },

  //listen to an event with selector dynamically. the selector might yield empty result during assignment
  addGlobalEventListener: (parent, selector, eventName, fn, options) => {
    const { preventDefault, stopPropagation, captureChildClicks } = {
      preventDefault: true,
      stopPropagation: true,
      captureChildClicks: true,
      ...options
    };

    if (typeof parent === 'string') parent = document.querySelector(parent);
    parent.addEventListener(eventName, e => {
      parent.querySelectorAll(selector).forEach(elem => {
        if (elem.isSameNode(e.target) || (captureChildClicks && elem.contains(e.target))) {
          preventDefault && e.preventDefault();
          stopPropagation && e.stopPropagation();

          fn(e, elem);
        }
      });
    });
  },

  formatCurrency: ({ sum, currency = 'ILS', locale = 'he-IL', fractions = 2 }) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: fractions
    }).format(sum);
  },

  fetch: async (url, values) => {
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      },
      credentials: 'same-origin',
      body: Object.keys(values).reduce((str, key) => `${str}&${key}=${values[key]}`, '')
    });
    response = await response.json();
    return response;
  }
};

//observers - call a list of functions when state changes
if (typeof window.StateManagerFactory === 'undefined') {
  window.StateManagerFactory = () => {
    class StateManager {
      state = {};

      constructor() {}

      emptyItem = () => {
        return {
          value: null,
          fns: []
        };
      };

      get = item => (this.state[item] ? this.state[item].value : undefined);

      //force calls the liseners even if no change has occured
      set = (item, value, force = false) => {
        if (!this.state[item]) {
          this.state[item] = this.emptyItem();
        }

        //no change, no events
        if (!force && value === this.state[item].value) return;

        let oldState = JSUtils.clone(this.state);
        let old = this.state[item].value;
        this.state[item].value = value;
        this.state[item].fns.forEach(fn => fn(value, old, oldState));
      };

      listen = (item, fn) => {
        if (!this.state[item]) {
          this.state[item] = this.emptyItem();
        }
        this.state[item].fns.push(fn);
      };
    }

    return new StateManager();
  };
}
