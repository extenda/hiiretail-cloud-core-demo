const java = require("java");
const { promisify } = require("util");

java.classpath.push("libs/lib.jar");
java.asyncOptions = {
  syncSuffix: "Sync",
  promiseSuffix: "P",
  promisify: promisify,
};

/**
 * @type {{
 *   parseP: (input: string) => Promise<number>,
 *   parseSync: (input: string) => number
 * }}
 */
module.exports = java.import("Lib");
