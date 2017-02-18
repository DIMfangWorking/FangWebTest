var util = require("util");
var Father = require("./Father.js");
function Son() {
    Father.call(this);
    //Override the father's test
    this.test = function () {
        console.log("Son test");
    }
    //private
    function testPrivate() {
        console.log("private");
    }
}
util.inherits(Son, Father);

module.exports = Son;

if (require.main === module) {
    var son = new Son();
    son.testPrivate();
}