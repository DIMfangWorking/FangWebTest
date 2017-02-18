function clone(target) 
{
    var buf;
    if (target instanceof Array) {
        buf = [];  //创建一个空的数组 
        var i = target.length;   
        while (i--) {   
            buf[i] = clone(target[i]);
        }
        return buf;
    }else if (target instanceof Object){
        buf = {};  //创建一个空对象 
        for (var k in target) {  //为这个对象添加新的属性 
            buf[k] = clone(target[k]);   
        }
        return buf;
    }else{
        return target;
    }
}

module.exports = clone;