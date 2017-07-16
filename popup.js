var onButton = document.querySelector('#on-button');
var offButton = document.querySelector('#off-button');

function setStatus(on, saveToStorage) {
  if (on) {
    onButton.classList.add('is-info');
    offButton.classList.remove('is-info');
  }
  else {
    onButton.classList.remove('is-info');
    offButton.classList.add('is-info');
  }

  if (saveToStorage) {
    chrome.storage.sync.set({on: on}, function () {
      var error = chrome.runtime.lastError;
      if (error) {
        console.error('Failed to set the status:', error.message);
      }
      else {
        var status = on ? 'on' : 'off';
        chrome.browserAction.setIcon({
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
  chrome.storage.sync.get({on: true}, function (items) {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error('Failed to retrieve settings:', error.message);
    }
    else {
      setStatus(items.on, false);
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreSettings);

onButton.addEventListener('click', function () {
  setStatus(true, true);
});

offButton.addEventListener('click', function () {
  setStatus(false, true);
});

document.querySelector('#options-link').addEventListener('click', function () {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  }
  else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});
