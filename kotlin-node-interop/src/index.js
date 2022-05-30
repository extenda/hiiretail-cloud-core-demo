const Lib = require("./lib");

const res = Lib.parseSync("123");
console.log(`Parsed: ${res} (${typeof res})`);

process.exit();
