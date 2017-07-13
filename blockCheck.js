chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
    // Avoid iFrame navigations
    if (details.frameId === 0) {
        chrome.storage.sync.get({domains: []}, function (items) {
            items.domains.forEach(function (domain) {
                if (details.url.indexOf(domain) !== -1) {
                    chrome.tabs.update(details.tabId, {
                        url: chrome.runtime.getURL('block.html')
                    });
                }
            });
        });
    }
});
