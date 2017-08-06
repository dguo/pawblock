// Disable the browser action icon if PawBlock is turned off
chrome.storage.sync.get({on: true}, function(items) {
  if (!items.on) {
    chrome.browserAction.setIcon({
      path: {
        '16': 'images/icon-16-off.png',
        '32': 'images/icon-32-off.png',
        '48': 'images/icon-48-off.png',
        '128': 'images/icon-128-off.png'
      }
    });
  }
});

chrome.webNavigation.onCommitted.addListener(function(details) {
  // Avoid iFrame navigations
  if (details.frameId !== 0) {
    return;
  }

  var storageQuery = {
    rules: [],
    allowedTabId: -1,
    on: true
  };

  chrome.storage.sync.get(storageQuery, function(items) {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error('Failed to get data from storage:', error);
      return;
    }

    if (!items.on) {
      return;
    }

    if (items.allowedTabId === details.tabId) {
      chrome.storage.sync.remove('allowedTabId');
      return;
    }

    var slashes = /^\/|\/$/g;
    var targetUrl = new URL(details.url);
    var targetDomain = targetUrl.hostname.replace(/^www\./, '');
    var targetPath = targetUrl.pathname.replace(slashes, '').split('/');

    items.rules.forEach(function(rule) {
      if (targetDomain === rule.domain) {
        var rulePath = rule.path.replace(slashes, '').split('/');

        /* Only block the site if the target path includes all of
           the rule path, which means that each segment matches up.

           So with a rule of /foo/bar/baz, allow /foo/bar,
           allow /foo/bar/bazs, block /foo/bar/baz, and block
           /foo/bar/baz/qux. */
        var i = 0;
        while (
          i < targetPath.length &&
          i < rulePath.length &&
          (rulePath[i] === '' || targetPath[i] === rulePath[i])
        ) {
          i++;
        }

        if (i === rulePath.length) {
          var blockedUrl = encodeURIComponent(details.url);
          var blockPageUrl = chrome.runtime.getURL(
            'block.html?target=' + blockedUrl
          );

          /* Deal with the edge case of the user adding a rule or turning
             PawBlock on but then trying to navigate backwards in history to
             a now blocked page. The problem with just updating the tab url
             is that it creates an infinite loop because navgiating to that
             blocked page would trigger the PawBlock block, and clicking
             "Never mind" would cause another navigation attempt to that
             blocked page, and so on. The solution is to allow the navigation
             to occur but to immediaately replace the page with the PawBlock
             block in the tab's browser history. This solution also works
             when there are multiple newly blocked pages in the history. */

          // Try to avoid flashing the website before the redirect occurs
          chrome.tabs.insertCSS(details.tabId, {
            code: '* { display: none !important; }',
            runAt: 'document_start'
          });

          chrome.tabs.executeScript(details.tabId, {
            code: 'window.location.replace("' + blockPageUrl + '");',
            runAt: 'document_start'
          });
        }
      }
    });
  });
});
