/**
 * just a dispatcher interface
 */
function dispatcher() {
    this.dispatch = function () {
        console.log("dispatch");
    }
}
module.exports = dispatcher;