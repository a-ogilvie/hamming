/**
 * Transforms the given message into its ASCII binary representation
 *
 * @param {string} message - the message to be transformed
 * @returns {string} the binary encoding of the message
 */
function toBinary(message) {}

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
function chunk(message, blockSize) {}

/**
 * Calculates and inserts parity bits according to the Hamming algorithm.
 *
 * @param {Array<0|1|undefined>} block
 * @returns {Array<0|1>}
 */
function addParityBits(block) {}

/**
 * Encodes the given message for transmission.
 *
 * This function should use toBinary, chunk, addParityBits
 *
 * @param {string} message
 * @param {number} blockSize
 * @returns {Array<Array<0|1>>}
 */
function encode(message, blockSize) {}

/**
 * Finds the index of an errored bit
 *
 * @param {Array<0|1>} block
 * @returns {number} - the index of the error. -1 if no error found.
 */
function findError(block) {}

/**
 * Fixes up to 1 error in each of the given blocks.
 *
 * This function should use the findError function.
 *
 * @param {Array<Array<0|1>>} blocks
 * @returns {Array<Array<0|1>>}
 */
function correctErrors(blocks) {}

/**
 * Joins the blocks into a binary encoded message, stripping out parity bits and removing extra 0s from the end.
 *
 * @param {Array<Array<0|1>>} blocks
 * @returns {string}
 */
function join(blocks) {}

/**
 * Converts the given binaryMessage into an ASCII-encoded string
 *
 * @param {string} binaryMessage
 * @returns {string}
 */
function toAscii(binaryMessage) {}

/**
 * Decodes the given message received after transmission, correcting any transmission errors (up to 1 per block).
 *
 * This function should use correctErrors, join, toAscii
 *
 * @param {Array<Array<0|1>>} blocks
 * @returns {string}
 */
function decode(blocks) {}

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
