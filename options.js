let domains = [];

function restoreSettings() {
    chrome.storage.sync.get({domains: []}, function (items) {
        domains = items.domains;
        console.log(domains);
    });
}

function handleAdd() {
    var domain = document.getElementById('new-domain').value;
    domains.push(domain);
    chrome.storage.sync.set({domains: domains});
}

document.addEventListener('DOMContentLoaded', restoreSettings);
document.getElementById('add-domain').addEventListener('click', handleAdd);
