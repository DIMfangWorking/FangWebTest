var ldapConfig;

function setLdapConfig(LDAPConfig) {
	ldapConfig = LDAPConfig;
}
function getLdapConfig() {
	return ldapConfig;
}


module.exports = {setLdapConfig : setLdapConfig, getLdapConfig : getLdapConfig};