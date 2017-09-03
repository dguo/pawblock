if (
  typeof window.browser === 'undefined' &&
  typeof window.chrome === 'object'
) {
  window.browser = window.chrome;
}

var onButton = document.querySelector('#on-button');
var offButton = document.querySelector('#off-button');

function setStatus(on, saveToStorage) {
  if (on) {
    onButton.classList.add('is-info');
    offButton.classList.remove('is-info');
  } else {
    onButton.classList.remove('is-info');
    offButton.classList.add('is-info');
  }

  if (saveToStorage) {
    browser.storage.sync.set({on: on}, function() {
      var error = browser.runtime.lastError;
      if (error) {
        console.error('Failed to set the status:', error.message);
      } else {
        var status = on ? 'on' : 'off';
        browser.browserAction.setIcon({
          path: {
            '16': 'images/icon-16-' + status + '.png',
            '32': 'images/icon-32-' + status + '.png',
            '48': 'images/icon-48-' + status + '.png',
            '128': 'images/icon-128-' + status + '.png'
          }
        });
      }
    });
  }
}

function restoreSettings() {
  browser.storage.sync.get({on: true}, function(items) {
    var error = browser.runtime.lastError;
    if (error) {
      console.error('Failed to retrieve settings:', error.message);
    } else {
      setStatus(items.on, false);
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreSettings);

onButton.addEventListener('click', function() {
  setStatus(true, true);
});

offButton.addEventListener('click', function() {
  setStatus(false, true);
});

document.querySelector('#options-link').addEventListener('click', function() {
  if (browser.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    browser.runtime.openOptionsPage();
  } else {
    window.open(browser.runtime.getURL('options.html'));
  }
});
