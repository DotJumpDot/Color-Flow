const path = require("path");
const Mocha = require("mocha");

const mocha = new Mocha({
  ui: "bdd",
  timeout: 5000,
  reporter: "spec",
});

const testDir = path.join(__dirname);

mocha.addFile(path.join(testDir, "colorConverter.test.js"));
mocha.addFile(path.join(testDir, "styleParser.test.js"));
mocha.addFile(path.join(testDir, "decorationManager.test.js"));

mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
