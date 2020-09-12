try {
  const { expect } = require("chai");
  process.env.SOLUTION
    ? require("../solutions/hamming.solution.js")
    : require("../index");

  describe("Hamming extra specs", () => {});
  // eslint-disable-next-line no-unused-vars
} catch (e) {}
