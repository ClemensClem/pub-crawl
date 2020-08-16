const bcrypt = require("bcryptjs");
let { genSalt, hash, compare } = bcrypt;
const { promisify } = require("util");

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

//compare accepts two arguments ("password from inputfield", "hashed password from table or whatever")
module.exports.compare = compare;
module.exports.hash = (clearTextPw) =>
    genSalt().then((salt) => hash(clearTextPw, salt));
