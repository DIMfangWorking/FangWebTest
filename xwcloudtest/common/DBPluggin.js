var authDao;

function dbInitialComplete(findLDAPInfo) {
	authDao = findLDAPInfo;
}
function getAuthDaoInit() {
	return authDao;
}


module.exports = {dbInitialComplete : dbInitialComplete, getAuthDaoInit : getAuthDaoInit};