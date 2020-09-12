/**
 * Transforms the given message into its ASCII binary representation
 *
 * @param {string} message - the message to be transformed
 * @returns {string} the binary encoding of the message
 */
function toBinary(message) {
  return message
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}

/**
 * Breaks the given message into blocks.
 *
 * Power-of-2 bits are reserved for encoding i.e. if blockSize = 16, each chunk should contain 11 message bits and 5 parity bits initialised to undefined.
 *
 * If the final block is too short, it should be padded with 0 to the desired size.
 *
 * @param {string} message - the binary message to be broken into blocks
 * @param {number} blockSize  - the desired size of each block
 * @returns {Array<Array<0|1|undefined>>}
 */
function chunk(message, blockSize) {
  const bits = message.split("").map(Number);

  const result = [];
  while (bits.length) {
    const block = [];
    for (let i = 0; i < blockSize; i++) {
      const isPowerOfTwo = i === 0 || Number.isInteger(Math.log2(i));
      block.push(isPowerOfTwo ? undefined : bits.shift() || 0);
    }

    result.push(block);
  }

  return result;
}

/**
 * Calculates and inserts parity bits according to the Hamming algorithm.
 *
 * @param {Array<0|1|undefined>} block
 * @returns {Array<0|1>}
 */
function addParityBits(block) {
  const numParityBits = Math.log2(block.length);
  const positionToBinary = Object.fromEntries(
    block.map((_, i) => [i, i.toString(2).padStart(numParityBits, "0")])
  );

  for (let i = 0; i < numParityBits; i++) {
    const positionsInParityGroup = Object.entries(positionToBinary)
      .filter(([, binary]) => binary.charAt(i) === "1")
      .map(([position]) => position);

    const parityBitPosition = positionsInParityGroup.shift();

    let parityBit = 0;
    for (const position of positionsInParityGroup) parityBit += block[position];

    block[parityBitPosition] = parityBit % 2;
  }

  block[0] = block.filter((value) => value === 1).length % 2 === 0 ? 0 : 1;

  return block;
}

/**
 * Encodes the given message for transmission.
 *
 * This function should use toBinary, chunk, addParityBits
 *
 * @param {string} message
 * @param {number} blockSize
 * @returns {Array<Array<0|1>>}
 */
function encode(message, blockSize) {
  return chunk(toBinary(message), blockSize).map(addParityBits);
}

/**
 * Finds the index of an errored bit
 *
 * @param {Array<0|1>} block
 * @returns {number} - the index of the error. -1 if no error found.
 */
function findError(block) {
  const errorPosition = block
    .map((value, position) => [position, value])
    .filter(([, value]) => value)
    .reduce((acc, [cur]) => acc ^ cur, 0);

  if (errorPosition) return errorPosition;

  return block.filter((value) => value === 1).length % 2 === 0 ? -1 : 0;
}

/**
 * Fixes up to 1 error in each of the given blocks.
 *
 * This function should use the findError function.
 *
 * @param {Array<Array<0|1>>} blocks
 * @returns {Array<Array<0|1>>}
 */
function correctErrors(blocks) {
  return blocks.map((block) => {
    const errorPosition = findError(block);
    if (errorPosition >= 0) {
      block[errorPosition] = (block[errorPosition] + 1) % 2;
    }
    return block;
  });
}

/**
 * Joins the blocks into a binary encoded message, stripping out parity bits and removing extra 0s from the end.
 *
 * @param {Array<Array<0|1>>} blocks
 * @returns {string}
 */
function join(blocks) {
  const message = blocks
    .flatMap((block) =>
      block.filter(
        (_, position) =>
          position !== 0 && !Number.isInteger(Math.log2(position))
      )
    )
    .join("");

  return message.slice(0, Math.floor(message.length / 8) * 8);
}

/**
 * Converts the given binaryMessage into an ASCII-encoded string
 *
 * @param {string} binaryMessage
 * @returns {string}
 */
function toAscii(binaryMessage) {
  return binaryMessage
    .match(/.{8}/g)
    .map((binaryValue) => String.fromCharCode(Number.parseInt(binaryValue, 2)))
    .join("");
}

/**
 * Decodes the given message received after transmission, correcting any transmission errors (up to 1 per block).
 *
 * This function should use correctErrors, join, toAscii
 *
 * @param {Array<Array<0|1>>} blocks
 * @returns {string}
 */
function decode(blocks) {
  return toAscii(join(correctErrors(blocks)));
}

module.exports = {
  toBinary,
  chunk,
  addParityBits,
  encode,
  findError,
  correctErrors,
  join,
  toAscii,
  decode,
};
