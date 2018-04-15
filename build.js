const fs = require('fs');

const FONT_FILES = [
  'FontAwesome.otf', 'fontawesome-webfont.eot',
  'fontawesome-webfont.svg', 'fontawesome-webfont.ttf',
  'fontawesome-webfont.woff', 'fontawesome-webfont.woff2'
];

for (const file of FONT_FILES) {
  fs.copyFileSync(
    `node_modules/font-awesome/fonts/${file}`,
    `extension/fonts/${file}`
  );
}

fs.copyFileSync(
  `node_modules/font-awesome/css/font-awesome.min.css`,
  `extension/styles/font-awesome.min.css`
);

fs.copyFileSync(
  `node_modules/bulma/css/bulma.css`,
  `extension/styles/bulma.css`
);
