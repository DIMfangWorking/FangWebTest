var xmlbuilder = require('xmlbuilder');

function createXmlRoot(root)
{
    var xml = xmlbuilder.create(root,{version: '1.0', encoding: 'UTF-8', standalone: true},
                     {pubID: null, sysID: null},
                     {allowSurrogateChars: false, skipNullAttributes: false,
                      headless: false, ignoreDecorators: false, stringify: {}});
    return xml;
}
function builderAtomXml(atomAction)
{
    logger.debug("test case atom action: ", atomAction.name);
    var atomActionXml = root.ele('AtomAction', { name : atomAction.name });
    if (atomAction.name == 'LoadedVersion' && (!data.task.measured_object || ! data.task.measured_object.ftp))
    {
        data.error = 'No version was found';
        reject(data);
        return ;
    }

    if (atomAction.name == 'LoadedVersion')
    {
        data.loadedVersionFalg = true;
    }

    if (atomAction.name == 'EIDetail')
    {
        var ei = eiDetail.getEIDetailed();
        var eiConfig = { };
        for (var msg in ei)
        {
            var atom = atomActionXml.ele('Property', { name : 'msg', 'msg' : msg, 'DspId' : ei[msg].DspId, 'CoreId' : ei[msg].CoreId });
            for (var key in ei[msg].Tlv)
            {
                atom.ele('tlv', { 'id' : key, 'name' : ei[msg].Tlv[key].name });
            }
        }
    }

    atomAction.argv.forEach(function (arg) {
        logger.debug("test case atom action Property: ", arg);
        switch(arg.name)
        {
            case 'EnbID':
                atomActionXml.ele('Property', { name : arg.name, value : subResource.enbID });
                break;
            case 'PDNIP':
                atomActionXml.ele('Property', { name : arg.name, value : subResource.pdnip });
                break;
            case 'VersionName':
                if (atomAction.name == 'LoadedVersion' || atomAction.name == 'CheckVersion')
                {
                    atomActionXml.ele('Property', { name : arg.name, value : data.task.measured_object.ftp.original });
                    break;
                }
            case 'Option':
                if (atomAction.name == 'SetDataBase' || atomAction.name == 'ReConfigEnb')
                {
                    try{
                        var option = new DBSetOptionParse(arg.value);

                        option.check();

                        var value = JSON.stringify(option);
                    }catch(e){
                        data.error = 'db option error. ' + e.message;
                        reject(data);
                        throw e;
                    }
                    atomActionXml.ele('Property', { 'name' : arg.name, 'value' : value });
                    break;
                }
            default:
                atomActionXml.ele('Property', { name : arg.name, value : arg.value });
                break;
        }
}

function builderTestcaseXml()
{
	var root = createXmlRoot('TestCase', {name : testcase.name, tcg_name : data.task.taskgroup_snapshot.name});

    root.ele('SupportEnvironment', {}, 0);

    logger.debug("test case : ", testcase.name);

    testcase.sequenceOfOpera.forEach(function(atomAction) { builderAtomXml(atomAction); });
}

function builderXmlTask(data)
{
    if (err || !list)
    {
        logger.error("find test case error. ", err);
        if (err)
        {
            data.error = err.message;
        }
        else
        {
            data.error = 'not found test case : \'' + data.task.test_group + '\'';
        }
        reject(data);
    }

    logger.debug("list : ", list);

    data.task.taskgroup_snapshot.testcase = {};

    list.forEach(function(testcase){
        builderElementTask(testcase);
    });

    data.task.taskgroup_snapshot.testcase[testcase.name] = root.end({ pretty: true, indent: '  ', newline: '\n' });
}

module.exports = function () {

}
