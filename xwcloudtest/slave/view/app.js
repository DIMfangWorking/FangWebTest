module.exports = function(moduler){
    var viewObject = new Array();
    var loadArray = undefined;
    
    loadArray = autoLoadModule(pwd + "/slave/view");

    loadArray.forEach(function(item) {
        var loadObj = item(moduler);
        viewObject = viewObject.concat(loadObj); 
    });

    return viewObject;
}