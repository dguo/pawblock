if (
  typeof window.browser === 'undefined' &&
  typeof window.chrome === 'object'
) {
  window.browser = window.chrome;
}

let reenableTimeoutId = null;

function changeIcon(on) {
  const status = on ? 'on' : 'off';

  browser.browserAction.setIcon({
    path: {
      16: `images/icon-16-${status}.png`,
      32: `images/icon-32-${status}.png`,
      48: `images/icon-48-${status}.png`,
      128: `images/icon-128-${status}.png`
    }
  });
}

// Disable the browser action icon if PawBlock is turned off
browser.storage.sync.get({on: true}, function (items) {
  if (!items.on) {
    changeIcon(false);
  }
});

browser.webNavigation.onCommitted.addListener(function (details) {
  // Avoid iFrame navigations
  if (details.frameId !== 0) {
    return;
  }

  var storageQuery = {
    rules: [],
    allowedTabId: -1,
    on: true
  };

  browser.storage.sync.get(storageQuery, function (items) {
    var error = browser.runtime.lastError;
    if (error) {
      console.error('Failed to get data from storage:', error);
      return;
    }

    if (!items.on) {
      return;
    }

    if (items.allowedTabId === details.tabId) {
      browser.storage.sync.remove('allowedTabId');
      return;
    }

    var targetUrl = new URL(details.url);
    var targetDomain = targetUrl.hostname.replace(/^www\./, '');

    for (var rule of items.rules) {
      var block = false;

      var domainRegex = new RegExp(rule.domain);
      if (domainRegex.test(targetDomain)) {
        if (!rule.path) {
          block = true;
        } else {
          var pathRegex = new RegExp(rule.path);
          block = pathRegex.test(targetUrl.pathname);
        }
      }

      if (block) {
        var blockedUrl = encodeURIComponent(details.url);
        var blockPageUrl = browser.runtime.getURL(
          'block.html?target=' + blockedUrl
        );

        /* Deal with the edge case of the user adding a rule or turning
             PawBlock on but then trying to navigate backwards in history to
             a now blocked page. The problem with just updating the tab url
             is that it creates an infinite loop because navgiating to that
             blocked page would trigger the PawBlock block, and clicking
             "Never mind" would cause another navigation attempt to that
             blocked page, and so on. The solution is to allow the navigation
             to occur but to immediately replace the page with the PawBlock
             block in the tab's browser history. This solution also works
             when there are multiple newly blocked pages in the history. */

        // Try to avoid flashing the website before the redirect occurs
        browser.tabs.insertCSS(details.tabId, {
          code: '* { display: none !important; }',
          runAt: 'document_start'
        });

        browser.tabs.executeScript(details.tabId, {
          code: 'window.location.replace("' + blockPageUrl + '");',
          runAt: 'document_start'
        });

        break;
      }
    }
  });
});

browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.closeTab && sender.tab && sender.tab.id) {
    browser.tabs.remove(sender.tab.id);
    return;
  }

  if (sender.tab && sender.tab.id) {
    browser.storage.sync.set({allowedTabId: sender.tab.id}, function () {
      var error = browser.runtime.lastError;
      sendResponse({error: Boolean(error)});
    });

    // Allows for an async response
    return true;
  } else {
    sendResponse({error: true});
  }
});

browser.storage.onChanged.addListener((changes) => {
  if (
    changes.reenableMinutes &&
    !changes.reenableMinutes.newValue &&
    reenableTimeoutId
  ) {
    clearTimeout(reenableTimeoutId);
  }

  if (!changes.on) {
    return;
  }

  changeIcon(changes.on.newValue);

  if (changes.on.newValue) {
    if (reenableTimeoutId) {
      clearTimeout(reenableTimeoutId);
    }
  } else {
    browser.storage.sync.get('reenableMinutes', (items) => {
      if (items.reenableMinutes) {
        reenableTimeoutId = setTimeout(() => {
          browser.storage.sync.set({on: true});
          reenableTimeoutId = null;
        }, items.reenableMinutes * 60 * 1000);
      }
    });
  }
});
