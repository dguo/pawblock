test('action popup', () => {
  document.body.innerHTML = `
    <a id="on-button"></a>
    <a id="off-button"></a>
    <a id="options-link"></a>
  `;

  window.browser = {
    storage: {
      sync: {
        get: jest.fn()
      }
    }
  };

  require('../extension/popup');

  document.dispatchEvent(new Event('DOMContentLoaded'));

  expect(browser.storage.sync.get.mock.calls.length).toBe(1);
});
