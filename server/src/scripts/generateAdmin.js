const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;
const { findOneUser } = require("../modules/user/model");

function generateAdmin() {
  console.log(argv.username);

  findOneUser({});
}

generateAdmin();

// Upsampling -> linearní interpolací
