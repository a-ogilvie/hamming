const { expect } = require("chai");
const {
  toBinary,
  chunk,
  addParityBits,
  encode,
  findError,
  correctErrors,
  join,
  toAscii,
  decode,
} = require("./index");

describe("Hamming", () => {
  const message = "hello";
  const encodedMessage = "0110100001100101011011000110110001101111";
  const chunkedMessage = [
    [
      undefined,
      undefined,
      undefined,
      0,
      undefined,
      1,
      1,
      0,
      undefined,
      1,
      0,
      0,
      0,
      0,
      1,
      1,
    ],
    [
      undefined,
      undefined,
      undefined,
      0,
      undefined,
      0,
      1,
      0,
      undefined,
      1,
      0,
      1,
      1,
      0,
      1,
      1,
    ],
    [
      undefined,
      undefined,
      undefined,
      0,
      undefined,
      0,
      0,
      1,
      undefined,
      1,
      0,
      1,
      1,
      0,
      0,
      0,
    ],
    [
      undefined,
      undefined,
      undefined,
      1,
      undefined,
      1,
      0,
      1,
      undefined,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
    ],
  ];
  const hammedMessage = [
    [0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
    [0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  ];
  const hammedMessageWithErrors = hammedMessage.map((block) => {
    const blockWithPossibleError = block.slice();
    const errorPosition = Math.floor(Math.random() * block.length);
    if (Math.random() > 0.5) {
      blockWithPossibleError[errorPosition] =
        (blockWithPossibleError[errorPosition] + 1) % 2;
    }
    return blockWithPossibleError;
  });

  describe("toBinary", () => {
    it("should transform the given string into its ASCII binary representation", () => {
      const actual = toBinary(message);

      expect(actual).to.equal(encodedMessage);
    });
  });

  describe("chunk", () => {
    it("should break the given message into blocks of the given blockSize", () => {
      const actual = chunk(encodedMessage, 16);

      expect(actual).to.be.an("array").with.lengthOf(chunkedMessage.length);
      for (let i = 0; i < chunkedMessage.length; i++)
        expect(actual[i], `block ${i}`).to.have.ordered.members(
          chunkedMessage[i]
        );
    });
  });

  describe("addParityBits", () => {
    it("should calculate and add parity bits", () => {
      for (let i = 0; i < chunkedMessage.length; i++) {
        const actual = addParityBits(chunkedMessage[i]);

        expect(actual, `block ${i}`).to.have.ordered.members(hammedMessage[i]);
      }
    });
  });

  describe("encode", () => {
    it("should encode the given message for transmission", () => {
      const actual = encode(message, 16);

      expect(actual).to.be.an("array").with.lengthOf(hammedMessage.length);
      for (let i = 0; i < hammedMessage.length; i++)
        expect(actual[i], `block ${i}`).to.have.ordered.members(
          hammedMessage[i]
        );
    });
  });

  describe("findError", () => {
    it("should find the error in the given block", () => {
      for (const block of hammedMessage) {
        const errorPosition = Math.floor(Math.random() * block.length);
        const blockWithError = block.slice();
        blockWithError[errorPosition] = (blockWithError[errorPosition] + 1) % 2;

        const actual = findError(blockWithError);

        expect(actual).to.equal(errorPosition);
      }
    });

    it("should return -1 if there is no error in the given block", () => {
      for (const block of hammedMessage) {
        const actual = findError(block);

        expect(actual).to.equal(-1);
      }
    });
  });

  describe("correctErrors", () => {
    it("should correct errors in the given message", () => {
      const actual = correctErrors(hammedMessageWithErrors);

      expect(actual).to.be.an("array").with.lengthOf(hammedMessage.length);
      for (let i = 0; i < hammedMessage.length; i++)
        expect(actual[i], `block ${i}`).to.have.ordered.members(
          hammedMessage[i]
        );
    });
  });

  describe("join", () => {
    it("should return a binary encoded string, with all parity bits removed", () => {
      const actual = join(hammedMessage);

      expect(actual).to.equal(encodedMessage);
    });
  });

  describe("toAscii", () => {
    it("should decode a binary string", () => {
      const actual = toAscii(encodedMessage);

      expect(actual).to.equal(message);
    });
  });

  describe("decode", () => {
    it("should decode the given message, correcting any transmission errors (up to 1 per block)", () => {
      const actual = decode(hammedMessageWithErrors);

      expect(actual).to.equal(message);
    });
  });
});
