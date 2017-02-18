function verifyInfo(accessInformation) {
    if (isPort(accessInformation.port) && isIP(accessInformation.hostname)) {
        if (isUrl(accessInformation.url)) {
            if (isMethod(accessInformation.method)) {
                optionsJsonData.port = accessInformation.port;
                optionsJsonData.hostname = accessInformation.hostname;
                optionsJsonData.method = accessInformation.method;
                optionsJsonData.path = accessInformation.url;
            }
        }
        return true;
    }
    return false;
}

function isPort(port) {
    if (port <= 65535 && port >= 0) {
        return true;
    }
    return false;
}

function isIP(ip) {
    var pattern = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/g
    if (pattern.test(ip)) {
        return true;
    }
    return false;
}

function isMethod(method) {
    if (method.toLowerCase() === "get" || method.toLowerCase() === "post" || method.toLowerCase() === "put" || method.toLowerCase() === "delete") {
        return true;
    }
}

function isUrl(url) {
    if (url.indexOf("/") !== -1 && url.lastIndexOf("/") !== -1) {
        return true;

    }
    return false;
}

module.exports = {
    "verifyInfo": verifyInfo,
}