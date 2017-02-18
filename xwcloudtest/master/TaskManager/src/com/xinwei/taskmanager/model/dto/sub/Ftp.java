package com.xinwei.taskmanager.model.dto.sub;

public class Ftp {
	/**
	 * host: '172.31.2.16', port: 21, user: null, password: null, path:
	 * '/LTE-LM/McLTE_macro_V3.2.1.0T826/software/McLTE.3.2.1.0T826.BIN',
	 * original: 'McLTE.3.2.1.0T826.BIN'
	 */

	private String host;
	private int port;
	private String user;
	private String password;
	private String path;
	private String original;

	public String getHost() {
		return host;
	}

	public void setHost(String host) {
		this.host = host;
	}

	public int getPort() {
		return port;
	}

	public void setPort(int port) {
		this.port = port;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getOriginal() {
		return original;
	}

	public void setOriginal(String original) {
		this.original = original;
	}

}
