module.exports = function (par)
{
    return par.express.static(config.web.static_page_path, {index : false});
}