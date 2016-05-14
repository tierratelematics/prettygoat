module.exports = function (wallaby) {
  return {
    files: [
      "scripts/**/*.ts",
      "typings/**/*.d.ts"
    ],
    tests: [
      "test/**/*.ts"
    ],
    compilers: {
      "**/*.ts*": wallaby.compilers.typeScript({module: 'es6'})
    },
    env: {
      type: "node"
    },
    testFramework: "mocha",
    bootstrap: function () {
      global.expect = require("expect.js");
    }
  };
};