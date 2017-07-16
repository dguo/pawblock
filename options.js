var rules = [];
var onButton = document.querySelector('#on-button');
var offButton = document.querySelector('#off-button');

function showErrorMessage(message) {
  var errorMessage = document.querySelector('#generic-error');
  errorMessage.style.display = 'block';
  errorMessage.firstElementChild.textContent = message;
}

function deleteRule() {
  // Traverse up the tree to get the parent row node
  var row = this.parentNode;
  while (row.nodeName !== 'TR') {
    row = row.parentNode;
  }

  // Account for both the header and input rows
  var ruleIndex = row.rowIndex - 2;

  // Remove the rule from the local state, the browser storage, and the UI
  var rule = rules[ruleIndex];
  rules.splice(ruleIndex, 1);
  chrome.storage.sync.set({rules: rules}, function () {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error('Failed to delete a rule:', error.message);
      showErrorMessage('Failed to delete the rule.');
      // Add the rule back to the local state
      rules.splice(ruleIndex, 0, rule);
    }
    else {
      row.remove();
    }
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

  if (path && !/^\/.+/.test(path)) {
    pathError.style.display = 'block';
    pathInput.classList.add('is-danger');
    return;
  }

  // Check for a duplicate rule
  var newRule = {
    domain: domain,
    path: path ? path : ''
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
      showErrorMessage('Failed to add the new rule.');
      rules.shift();
    }
    else {
      prependRuletoTable(newRule);
      domainInput.value = '';
      pathInput.value = '';
      domainInput.focus();
    }
  });
}

function setStatus(on, saveToStorage) {
  if (on) {
    onButton.classList.add('is-success');
    offButton.classList.remove('is-danger');
  }
  else {
    onButton.classList.remove('is-success');
    offButton.classList.add('is-danger');
  }

  if (saveToStorage) {
    chrome.storage.sync.set({on: on}, function () {
      var error = chrome.runtime.lastError;
      if (error) {
        console.error('Failed to set the status:', error.message);
        showErrorMessage('Failed to save the status.');
      }
    });
  }
}

function restoreSettings() {
  var storageQuery = {
    on: true,
    rules: [],
    schemaVersion: null
  };

  chrome.storage.sync.get(storageQuery, function (items) {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error('Failed to retrieve settings:', error.message);
      showErrorMessage('Failed to retrieve your current settings.');
    }
    else {
      setStatus(items.on, false);

      rules = items.rules;
      for (var i = rules.length - 1; i >= 0; i--) {
        prependRuletoTable(rules[i]);
      }

      if (!items.schemaVersion) {
        // Store the schema version to make future schema changes easier.
        chrome.storage.sync.set({schemaVersion: '0.1.0'});
      }
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

document.querySelector('#copyright-year').textContent =
  new Date().getFullYear();
