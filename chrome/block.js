var backButton = document.querySelector('#back-button');
var happyImage = document.querySelector('#happy-image');
var sadImage = document.querySelector('#sad-image');
var sets = [
  {
    name: 'cat',
    happy: 'images/default-happy.jpg',
    sad: 'images/default-sad.jpg'
  }
];

function loadRandomSet() {
  var randomIndex = Math.floor(Math.random() * sets.length);
  var choice = sets[randomIndex];
  // Make sure we load a new set.
  if (happyImage.src === choice.happy && sets.length > 1) {
    // Use the next element or the first one if we are at the end of the array.
    choice = sets[randomIndex + 1 < sets.length ? randomIndex + 1 : 0];
  }
  happyImage.src = choice.happy;
  sadImage.src = choice.sad;
}

fetch('https://s3.us-east-2.amazonaws.com/pawblock-sources/images.json')
  .then(function(res) {
    return res.json();
  })
  .then(function(json) {
    sets = sets.concat(json.sets);
    loadRandomSet();
  })
  .catch(function(err) {
    console.error('Failed to get images json:', err);

    happyImage.src = 'images/default-happy.jpg';
    sadImage.src = 'images/default-sad.jpg';
  });

var targetUrl = '';
var params = window.location.search.substring(1).split('&');
params.forEach(function(param) {
  var split = param.split('=');
  if (split[0] === 'target') {
    targetUrl = decodeURIComponent(split[1]);
  }
});

document.querySelector('#target').textContent =
  targetUrl.length > 80 ? targetUrl.substr(0, 80) + '...' : targetUrl;

happyImage.onerror = function() {
  console.error('Failed to load:', happyImage.src);
  happyImage.src = 'images/default-happy.jpg';
};

sadImage.onerror = function() {
  console.error('Failed to load:', sadImage.src);
  sadImage.src = 'images/default-sad.jpg';
};

backButton.addEventListener('click', function() {
  window.history.back();

  /* Close the tab if there's nothing to go back to. Use a timeout because
     there's no way to know if there is backwards history for the tab.
     Checking the history length doesn't work because forward history is
     included in the count. Without a timeout, the tab will always close. */
  setTimeout(window.close, 500);
});

backButton.addEventListener('mouseenter', function() {
  happyImage.style.display = 'inline';
  sadImage.style.display = 'none';
});

backButton.addEventListener('mouseleave', function() {
  happyImage.style.display = 'none';
  sadImage.style.display = 'inline';
});

document.querySelector('#refresh-button').addEventListener('click', function() {
  loadRandomSet();
});

document
  .querySelector('#continue-button')
  .addEventListener('click', function() {
    if (this.getAttribute('disabled')) {
      return;
    }

    chrome.tabs.getCurrent(function(tab) {
      if (tab && tab.id) {
        chrome.storage.sync.set({allowedTabId: tab.id}, function() {
          var error = chrome.runtime.lastError;
          if (error || !targetUrl) {
            document.querySelector('#message').style.display = 'block';
            return;
          }

          // Use replace so that the block page isn't in the tab's history
          window.location.replace(targetUrl);
        });
      }
    });
  });

document.querySelector('#options-link').onclick = function() {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
};

document.querySelector('#copyright').textContent = new Date().getFullYear();

chrome.storage.sync.get(
  {
    blockType: 'soft',
    softBlockDelay: 5
  },
  function(items) {
    var continueButton = document.querySelector('#continue-button');
    if (items.blockType === 'hard') {
      continueButton.style.display = 'none';
    } else if (items.softBlockDelay > 0) {
      continueButton.setAttribute('disabled', 'true');
      var continueIcon = document.querySelector('#continue-icon');
      var continueText = document.querySelector('#continue-text');
      var continueIconStyle = continueIcon.style.display;

      continueIcon.style.display = 'none';
      var counter = items.softBlockDelay;
      continueText.innerText = counter;

      var countdown = setInterval(function() {
        counter--;
        continueText.innerText = counter;
        if (counter <= 0) {
          clearInterval(countdown);
          continueButton.removeAttribute('disabled');
          continueText.innerText = 'Yes';
          continueIcon.style.display = continueIconStyle;
        }
      }, 1000);
    }
  }
);
