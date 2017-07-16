chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  // Avoid iFrame navigations
  if (details.frameId === 0) {
    var storageQuery = {
      rules: [],
      allowedTabId: -1,
      on: true
    };

    chrome.storage.sync.get(storageQuery, function (items) {
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

      items.rules.forEach(function (rule) {
        if (targetDomain === rule.domain) {
          var rulePath = rule.path.replace(slashes, '').split('/');

          /* Only block the site if the target path includes all of
             the rule path, which means that each segment matches up.

             So with a rule of /foo/bar/baz, allow /foo/bar,
             allow /foo/bar/bazs, block /foo/bar/baz, and block
             /foo/bar/baz/qux. */
          var i = 0;
          while (i < targetPath.length && i < rulePath.length &&
                 (rulePath[i] === '' || targetPath[i] === rulePath[i])) {
            i++;
          }

          if (i === rulePath.length)  {
            var blockedUrl = encodeURIComponent(details.url);
            chrome.tabs.update(details.tabId, {
              url: chrome.runtime.getURL('block.html?target=' + blockedUrl)
            });
          }
        }
      });
    });
  }
});
