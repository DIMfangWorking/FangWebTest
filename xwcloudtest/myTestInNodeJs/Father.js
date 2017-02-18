/**
 * just a dispatcher interface
 */
function Father() {
    this.test = function () {
        console.log("test");
    };
}
module.exports = Father;