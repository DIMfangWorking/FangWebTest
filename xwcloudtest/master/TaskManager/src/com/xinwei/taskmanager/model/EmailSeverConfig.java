package com.xinwei.taskmanager.model;

public class EmailSeverConfig {

	private String Ip;
	private String Port;
	private Boolean Security;
	private String User;
	private String Password;
	private String Suffix;

	public String getIp() {
		return Ip;
	}

	public void setIp(String ip) {
		Ip = ip;
	}

	public String getPort() {
		return Port;
	}

	public void setPort(String port) {
		Port = port;
	}

	public Boolean getSecurity() {
		return Security;
	}

	public void setSecurity(Boolean security) {
		Security = security;
	}

	public String getUser() {
		return User;
	}

	public void setUser(String user) {
		User = user;
	}

	public String getPassword() {
		return Password;
	}

	public void setPassword(String password) {
		Password = password;
	}

	public String getSuffix() {
		return Suffix;
	}

	public void setSuffix(String suffix) {
		Suffix = suffix;
	}

}
