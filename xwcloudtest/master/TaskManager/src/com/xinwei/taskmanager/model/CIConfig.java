package com.xinwei.taskmanager.model;

public class CIConfig {

	private int Id;
	private String type;
	private String env_type;
	private String Another_Name;
	private String svn_user;
	private String svn_password;
	private String email_notify;
	private String test_group;

	public int getId() {
		return Id;
	}

	public void setId(int id) {
		Id = id;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getEnv_type() {
		return env_type;
	}

	public void setEnv_type(String env_type) {
		this.env_type = env_type;
	}

	public String getAnother_Name() {
		return Another_Name;
	}

	public void setAnother_Name(String another_name) {
		Another_Name = another_name;
	}

	public String getSvn_user() {
		return svn_user;
	}

	public void setSvn_user(String svn_user) {
		this.svn_user = svn_user;
	}

	public String getSvn_password() {
		return svn_password;
	}

	public void setSvn_password(String svn_password) {
		this.svn_password = svn_password;
	}

	public String getEmail_notify() {
		return email_notify;
	}

	public void setEmail_notify(String email_notify) {
		this.email_notify = email_notify;
	}

	public String getTest_group() {
		return test_group;
	}

	public void setTest_group(String test_group) {
		this.test_group = test_group;
	}

}
