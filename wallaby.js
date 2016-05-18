module.exports = function (wallaby) {
  return {
    files: [
      "scripts/**/*.ts",
      "typings/**/*.d.ts",
      "!test/**/*Spec.ts"
    ],
    tests: [
      "test/**/*.ts"
    ],
    compilers: {
      "**/*.ts*": wallaby.compilers.typeScript()
    },
    env: {
      type: "node"
    },
    testFramework: "mocha"
  };
};