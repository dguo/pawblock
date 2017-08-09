var rules = [];
var onButton = document.querySelector('#on-button');
var offButton = document.querySelector('#off-button');

function showErrorMessage(message) {
  var errorMessage = document.querySelector('#generic-error');
  errorMessage.style.display = 'block';
  errorMessage.firstElementChild.textContent = message;
}

function hideErrorMessage() {
  var errorMessage = document.querySelector('#generic-error');
  errorMessage.style.display = 'none';
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
  chrome.storage.sync.set({rules: rules}, function() {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error('Failed to delete a rule:', error.message);
      showErrorMessage('Failed to delete the rule.');
      // Add the rule back to the local state
      rules.splice(ruleIndex, 0, rule);
    } else {
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
  t.content.querySelector('.try-it-button').href = href;

  var newRow = document.importNode(t.content, true);
  newRow.querySelector('.delete-button').onclick = deleteRule;

  var inputRow = document.querySelector('#new-rule-row');
  inputRow.parentNode.insertBefore(newRow, inputRow.nextSibling);
}

function addRule(domain, path) {
  domain = domain.trim();

  if (!domain) {
    return {domainError: 'Domain is required'};
  }

  // Remove 'https://', 'http://', any slashes, and 'www.' for the user
  domain = domain.replace(/https?:|\//g, '');
  domain = domain.replace(/^www\./, '');
  domain = domain.toLowerCase();

  if (!/.+\..+/.test(domain)) {
    return {domainError: 'Invalid domain'};
  }

  path = path.trim().toLowerCase();
  if (path && !/^\/.+/.test(path)) {
    return {pathError: 'Invalid path'};
  }

  // Check for a duplicate rule
  var newRule = {
    domain: domain,
    path: path ? path : ''
  };

  if (
    rules.some(function(rule) {
      return rule.domain === newRule.domain && rule.path === newRule.path;
    })
  ) {
    return {duplicate: true};
  }

  // Add the new rule to the local state, the browser storage, and the UI
  rules.unshift(newRule);
  chrome.storage.sync.set({rules: rules}, function() {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error('Failed to save a new rule:', error.message);
      showErrorMessage('Failed to add the new rule.');
      rules.shift();
    } else {
      prependRuletoTable(newRule);
    }
  });
}

function addRuleFromUI() {
  var domainInput = document.querySelector('#new-domain');
  var domainError = document.querySelector('#domain-error');
  var pathInput = document.querySelector('#new-path');
  var pathError = document.querySelector('#path-error');

  // Reset all the errors
  domainInput.classList.remove('is-danger');
  pathInput.classList.remove('is-danger');
  domainError.style.display = 'none';
  pathError.style.display = 'none';

  var result = addRule(domainInput.value, pathInput.value);
  if (result && result.domainError) {
    domainError.style.display = 'block';
    domainError.textContent = result.domainError;
    domainInput.classList.add('is-danger');
  } else if (result && result.pathError) {
    pathError.style.display = 'block';
    pathError.textContent = result.pathError;
    pathInput.classList.add('is-danger');
  } else if (result && result.duplicate) {
    domainError.style.display = 'block';
    domainError.textContent = 'Duplicate rule';
    domainInput.classList.add('is-danger');
    pathInput.classList.add('is-danger');
  } else {
    domainInput.value = '';
    pathInput.value = '';
    domainInput.focus();
  }
}

function setStatus(on, saveToStorage) {
  if (on) {
    onButton.classList.add('is-info');
    offButton.classList.remove('is-info');
  } else {
    onButton.classList.remove('is-info');
    offButton.classList.add('is-info');
  }

  if (saveToStorage) {
    chrome.storage.sync.set({on: on}, function() {
      var error = chrome.runtime.lastError;
      if (error) {
        console.error('Failed to set the status:', error.message);
        showErrorMessage('Failed to save the status.');
      }
    });
  }

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

function restoreSettings() {
  var storageQuery = {
    on: true,
    rules: [],
    schemaVersion: null,
    blockType: 'soft',
    softBlockDelay: 5
  };

  chrome.storage.sync.get(storageQuery, function(items) {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error('Failed to retrieve settings:', error.message);
      showErrorMessage('Failed to retrieve your current settings.');
    } else {
      setStatus(items.on, false);

      document.querySelector('#seconds').value = items.softBlockDelay;

      if (items.blockType === 'soft') {
        document.querySelector('#soft-block').checked = true;
      } else {
        document.querySelector('#hard-block').checked = true;
        document.querySelector('#seconds').disabled = true;
      }

      rules = items.rules;
      for (var i = rules.length - 1; i >= 0; i--) {
        prependRuletoTable(rules[i]);
      }

      if (!items.schemaVersion) {
        // Store the schema version to make future schema changes easier.
        chrome.storage.sync.set({
          schemaVersion: chrome.runtime.getManifest().version
        });
      }
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

// Handle the user changing the status from the action popup while the options
// page is open.
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'sync' && changes.on) {
    setStatus(changes.on.newValue, false);
  }
});

document.querySelector('#add-rule').addEventListener('click', addRuleFromUI);

// Allow adding a rule by pressing enter on the keyboard rather than
// having to click the button
document.querySelectorAll('input').forEach(function(input) {
  input.onkeypress = function(e) {
    if (e.keyCode === 13) {
      addRuleFromUI();
    }
  };
});

document.querySelector('#copyright').textContent = new Date().getFullYear();

document.querySelector('#export').addEventListener('click', function() {
  var data = window.btoa(JSON.stringify({rules: rules}));
  var url = 'data:application/json;base64,' + data;

  chrome.downloads.download({
    url: url,
    filename: 'pawblock-rules.json',
    saveAs: true
  });
});

document.querySelector('#import').addEventListener('click', function() {
  hideErrorMessage();
  document.querySelector('#filepicker').click();
});

document.querySelector('#filepicker').addEventListener('change', function(e) {
  if (e.target.files.length) {
    var reader = new FileReader();
    reader.onload = function(readerEvent) {
      var json;
      try {
        json = JSON.parse(readerEvent.target.result);
      } catch (e) {
        console.error('Failed to parse the uploaded file.');
        showErrorMessage('Invalid file.');
      }

      if (Array.isArray(json.rules)) {
        // Reverse so that the rules show up in the same order as they
        // originally were (new rules get prepended).
        json.rules.reverse().forEach(function(rule) {
          if (rule.domain && typeof rule.domain === 'string') {
            addRule(
              rule.domain,
              rule.path && typeof rule.path === 'string' ? rule.path : ''
            );
          }
        });
      }
    };
    reader.readAsText(e.target.files[0]);
  }
});

document.querySelector('#hard-block').addEventListener('change', function() {
  document.querySelector('#seconds').disabled = true;
  chrome.storage.sync.set({blockType: 'hard'});
});

document.querySelector('#soft-block').addEventListener('change', function() {
  document.querySelector('#seconds').disabled = false;
  chrome.storage.sync.set({blockType: 'soft'});
});

document.querySelector('#seconds').addEventListener('input', function(e) {
  var seconds = 0;

  if (e.target.value) {
    var cleanValue = e.target.value.replace(/\D/g, '');
    this.value = cleanValue;

    if (cleanValue) {
      seconds = parseInt(cleanValue, 10);
      if (isNaN(seconds)) {
        seconds = 0;
      }
    }
  }

  chrome.storage.sync.set({softBlockDelay: seconds});
});
