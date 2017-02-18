package com.xinwei.taskmanager.model.dto.sub;

import java.io.Serializable;

public class MeasuredObject implements Serializable {

	private static final long serialVersionUID = -6220320584573739035L;
	/*
	 * "measured_object" : { "exe_file":"可执行文件路径", "db_file":"db文件路径",
	 * "url":"版本文件或lte_app的ftp地址" } { url:
	 * 'ftp://172.31.2.16/LTE-LM/McLTE_macro_V3.2.1.0T826\\software\\McLTE.3.2.1
	 * .0T826.BIN', ftp: { host: '172.31.2.16', port: 21, user: null, password:
	 * null, path:
	 * '/LTE-LM/McLTE_macro_V3.2.1.0T826/software/McLTE.3.2.1.0T826.BIN',
	 * original: 'McLTE.3.2.1.0T826.BIN' }, exe_file:
	 * '/LTE-LM/McLTE_macro_V3.2.1.0T826/software/McLTE.3.2.1.0T826.BIN' },
	 */
	private String exe_file;
	private String db_file;
	private String url;
	private Ftp ftp;

	public String getExe_file() {
		return exe_file;
	}

	public void setExe_file(String exe_file) {
		this.exe_file = exe_file;
	}

	public String getDb_file() {
		return db_file;
	}

	public void setDb_file(String db_file) {
		this.db_file = db_file;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public Ftp getFtp() {
		return ftp;
	}

	public void setFtp(Ftp ftp) {
		this.ftp = ftp;
	}

}
