var rules = [];

function deleteRule() {
    // Traverse up the tree to get the parent row node
    var row = this.parentNode;
    while (row.nodeName !== 'TR') {
        row = row.parentNode;
    }

    // Account for both the header and input rows
    var ruleIndex = row.rowIndex - 2;

    // Remove the rule from the local state, the browser storage, and the UI
    rules.splice(ruleIndex, 1);
    chrome.storage.sync.set({rules: rules}, function () {
        // TODO: handle error

        row.remove();
    });
}

function prependRuletoTable(rule) {
    var t = document.querySelector('#rule-row');
    var td = t.content.querySelectorAll('td');

    td[0].textContent = rule.domain;
    td[1].textContent = rule.path;

    var href = 'http://' + rule.domain + rule.path;
    t.content.querySelector('.try-it-button').href = href

    var newRow = document.importNode(t.content, true);
    newRow.querySelector('.delete-button').onclick = deleteRule;

    var inputRow = document.querySelector('#new-rule-row');
    inputRow.parentNode.insertBefore(newRow, inputRow.nextSibling);
}

function addRule() {
    var domainInput = document.querySelector('#new-domain');
    var domainError = document.querySelector('#domain-error');
    var pathInput = document.querySelector('#new-path');
    var pathError = document.querySelector('#path-error');

    // Reset all the errors
    domainInput.classList.remove('is-danger');
    pathInput.classList.remove('is-danger');
    domainError.style.display = 'none';
    pathError.style.display = 'none';

    // Check for a bad domain
    var domain = domainInput.value.trim();

    if (!domain) {
        domainError.style.display = 'block';
        domainError.textContent = 'Domain is required';
        domainInput.classList.add('is-danger');
        return;
    }

    // Remove 'https://', 'http://', and 'www.' for the user
    domain = domain.replace(/https:\/\/|http:\/\//g, '');
    domain = domain.replace(/^www\./, '');

    if (!/.+\..+/.test(domain)) {
        domainError.style.display = 'block';
        domainError.textContent = 'Invalid domain';
        domainInput.classList.add('is-danger');
        return;
    }

    // Check for a bad path
    var path = pathInput.value.trim();

    if (path && !/\/.+/.test(path)) {
        pathError.style.display = 'block';
        pathInput.classList.add('is-danger');
        return;
    }

    // Check for a duplicate rule
    var newRule = {
        domain: domain,
        path: path
    };

    if (rules.some(function (rule) {
        return rule.domain === newRule.domain && rule.path === newRule.path;
    })) {
        domainError.style.display = 'block';
        domainError.textContent = 'Duplicate rule';
        domainInput.classList.add('is-danger');
        pathInput.classList.add('is-danger');
        return;
    }

    // Add the new rule to the local state, the browser storage, and the UI
    rules.unshift(newRule);
    chrome.storage.sync.set({rules: rules}, function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error('Failed to save a new rule:', error.message);
            // TODO: handle error
        }
        else {
            prependRuletoTable(newRule);
            domainInput.value = '';
            pathInput.value = '';
            domainInput.focus();
        }
    });
}

function restoreSettings() {
    chrome.storage.sync.get({rules: []}, function (items) {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error('Failed to save a new rule:', error.message);
            // TODO: handle error
        }
        else {
            rules = items.rules;
            for (var i = rules.length - 1; i >= 0; i--) {
                prependRuletoTable(rules[i]);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', restoreSettings);
document.querySelector('#add-rule').addEventListener('click', addRule);

// Allow adding a rule by pressing enter on the keyboard rather than
// having to click the button
document.querySelectorAll('input').forEach(function (input) {
    input.onkeypress = function (e) {
        if (e.keyCode === 13) {
            addRule();
        }
    }
});
