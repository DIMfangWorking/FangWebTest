var esprima = require('esprima');

function DBSetOptionParse(scriptStr) {
    var obj = esprima.parse(scriptStr);

    this.table = '';
    this.option = [];

    var self = this;

    function deepArgumentItem(item) {
        if (item.type != 'ObjectExpression') {
            throw Error('Arguments error. must be object');
        }

        var argv = {};
        item.properties.forEach(function (item) {
            if (item.value.type == 'Literal') {
                argv[item.key.name] = item.value.value;
            }
            else {
                argv[item.key.name] = deepArgumentItem(item.value);
            }
        });

        return argv;
    }

    function deepArguments(arg) {
        var result = [];
        arg.forEach(function (item) {
            if (item.type != 'ObjectExpression') {
                throw Error('Arguments error. must be object');
            }

            result.push(deepArgumentItem(item));
        });
        return result;
    }

    function deepProcess(obj) {
        if (obj.object) {
            if (obj.object.name) {
                self.table = obj.object.name;
                // console.log('object name ', obj.object.name);
            }
            else if (obj.object.callee) {
                deepProcess(obj.object.callee);
                self.option.push({
                    name: obj.object.callee.property.name
                    , arguments: deepArguments(obj.object.arguments)
                });
                // console.log('callee property name ', obj.object.callee.property.name);
                // console.log('callee object arguments ', obj.object.arguments);
            }
        }
        else {
            console.log('else ', obj);
        }
    }

    if (obj.body.length > 1) {
        throw Error('db set option error');
    }

    if (obj.body[0].expression.object) {
        console.log('expression object ', obj.body[0].expression.object);
    }
    else if (obj.body[0].expression.callee) {
        deepProcess(obj.body[0].expression.callee);
        this.option.push({
            name: obj.body[0].expression.callee.property.name
            , arguments: deepArguments(obj.body[0].expression.arguments)
        });
        // console.log('expression property name ', obj.body[0].expression.callee.property.name);
        // console.log('expression arguments ', obj.body[0].expression.arguments);
    }

    this.check = function () {
        this.option.forEach(function (item) {
            switch (item.name) {
                case 'insert':
                case 'save':
                case 'update':
                case 'overwrite':
                case 'remove':
                case 'delete':
                case 'find':
                case 'select':
                    break;
                default:
                    throw Error('not suport option ' + item.name);
                    break;
            }
        });
    };
}

function test() {
    try {
        var option = new DBSetOptionParse('at.update({a:1,z:26},{$set:{b:{r:5}}}).select({c:3},{d:{e:{t:6}}}).find()');

        //var option = new DBSetOptionParse('a.b({a:1},{$set:{b:2}}).c()');

        // not suport
        // var option = new DBSetOptionParse('a.b(d.e()).c()');

        // var option = new DBSetOptionParse('a.b({a:1},{$set:{b:{c:2}}}).c()');

        // not suport
        // var option = new DBSetOptionParse('a.b(1).c()');

        // var option = new DBSetOptionParse('a.b().c().d()');

        //var option = new DBSetOptionParse('a.b()');

        console.log(JSON.stringify(option, null, 2));
        option.check();
    } catch (e) {
        console.log(e.message);
    }
}

if (module == require.main) {
    test();
}

module.exports = DBSetOptionParse;