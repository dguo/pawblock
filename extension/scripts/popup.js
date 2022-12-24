if (
  typeof window.browser === 'undefined' &&
  typeof window.chrome === 'object'
) {
  window.browser = window.chrome;
}

const onButton = document.querySelector('#on-button');
const offButton = document.querySelector('#off-button');
const areYouSure = document.querySelector('#are-you-sure');
const cancelButton = document.querySelector('#cancel-button');
const confirmButton = document.querySelector('#confirm-button');
let pawblockOn = false;
let countdown;

function setStatus(on, saveToStorage) {
  pawblockOn = on;

  if (on) {
    onButton.classList.add('is-info');
    offButton.classList.remove('is-info');
  } else {
    onButton.classList.remove('is-info');
    offButton.classList.add('is-info');
  }

  if (saveToStorage) {
    browser.storage.sync.set({on: on}, function () {
      var error = browser.runtime.lastError;
      if (error) {
        console.error('Failed to set the status:', error.message);
      }
    });
  }
}

function restoreSettings() {
  browser.storage.sync.get({on: true}, function (items) {
    const error = browser.runtime.lastError;
    if (error) {
      console.error('Failed to retrieve settings:', error.message);
    } else {
      setStatus(items.on, false);
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreSettings);

onButton.addEventListener('click', function () {
  if (pawblockOn) {
    return;
  }

  setStatus(true, true);
});

offButton.addEventListener('click', function () {
  if (!pawblockOn) {
    return;
  }

  areYouSure.style.display = 'block';

  confirmButton.setAttribute('disabled', 'true');
  let counter = 5;
  confirmButton.innerText = counter;

  if (countdown) {
    clearInterval(countdown);
  }

  countdown = setInterval(() => {
    counter--;
    confirmButton.innerText = counter;
    if (counter <= 0) {
      clearInterval(countdown);
      confirmButton.removeAttribute('disabled');
      confirmButton.innerText = 'Yes';
    }
  }, 1000);
});

cancelButton.addEventListener('click', () => {
  areYouSure.style.display = '';

  if (countdown) {
    clearInterval(countdown);
    countdown = null;
  }
});

cancelButton.addEventListener('mouseenter', () => {
  document.querySelector('#animal').src = 'images/happy-cat.svg';
});

cancelButton.addEventListener('mouseleave', () => {
  document.querySelector('#animal').src = 'images/sad-pug.svg';
});

confirmButton.addEventListener('click', () => {
  if (confirmButton.getAttribute('disabled')) {
    return;
  }

  setStatus(false, true);

  areYouSure.style.display = '';

  if (countdown) {
    clearInterval(countdown);
    countdown = null;
  }
});

document.querySelector('#options-link').addEventListener('click', function () {
  if (browser.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    browser.runtime.openOptionsPage();
  } else {
    window.open(browser.runtime.getURL('options.html'));
  }
});
