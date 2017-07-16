var backButton = document.querySelector('#back-button');

backButton.onclick = function () {
  // If we're on a new tab, just close it.
  if (window.history.length === 1) {
    window.close();
  }
  else {
    history.back();
  }
}

backButton.addEventListener('mouseenter', function () {
  document.querySelector('#happy-image').style.display = 'inline';
  document.querySelector('#sad-image').style.display = 'none';
});

backButton.addEventListener('mouseleave', function () {
  document.querySelector('#happy-image').style.display = 'none';
  document.querySelector('#sad-image').style.display = 'inline';
});

document.querySelector('#continue-button').onclick = function () {
  var params = window.location.search.substring(1).split('&');
  params.forEach(function (param) {
    var split = param.split('=');
    if (split[0] === 'target') {
      chrome.tabs.getCurrent(function (tab) {
        if (tab && tab.id) {
          chrome.storage.sync.set({allowedTabId: tab.id}, function () {
            var error = chrome.runtime.lastError;
            if (error || !split[1]) {
              document.querySelector('#message').style.display = 'block';
              return;
            }

            var url = decodeURIComponent(split[1]);

            // Use replace so that the block page isn't in the
            // tab's history
            window.location.replace(url);
          });
        }
      });
    }
  });
}

document.querySelector('#options-link').onclick = function () {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  }
  else {
    window.open(chrome.runtime.getURL('options.html'));
  }
}

document.querySelector('#copyright-year').textContent =
  new Date().getFullYear();
