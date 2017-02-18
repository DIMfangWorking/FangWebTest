var Q = require('q');

function makePromise(func, argv)
{
    var deferred = Q.defer();
    try 
    {
        func(argv, deferred.resolve, deferred.reject);
    }
    catch(e)
    {
        logger.error(e.message, e.stack);
        argv.error = e;
        deferred.reject(argv);
    }

    return deferred.promise;
}

function makePromiseFunction(callback)
{
    return function (data) { return makePromise(function (data, r, j){
            callback(data, r, j);
        },data); };
}

function defaultErrorProcess(err)
{
    var deferred = Q.defer();
    deferred.reject(err);
    return deferred.promise;
}

function defaultProcess(err)
{
    var deferred = Q.defer();
    deferred.resolve(err);
    return deferred.promise;
}

exports.makePromise = makePromise;
exports.makePromiseFunction = makePromiseFunction;
exports.defaultProcess = defaultProcess;
exports.defaultErrorProcess = defaultErrorProcess;
