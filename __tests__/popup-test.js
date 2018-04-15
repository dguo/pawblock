const fs = require('fs');
const path = require('path');

test('action popup', () => {
  const popup = fs.readFileSync(
    path.join(__dirname, '../extension/popup.html'),
    'utf-8'
  );

  document.write(popup);

  window.browser = {
    storage: {
      sync: {
        get: jest.fn()
      }
    }
  };

  require('../extension/scripts/popup.js');

  document.dispatchEvent(new Event('DOMContentLoaded'));

  expect(browser.storage.sync.get.mock.calls.length).toBe(1);
});
