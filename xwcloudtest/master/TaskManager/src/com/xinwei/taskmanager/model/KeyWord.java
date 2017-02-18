package com.xinwei.taskmanager.model;

import java.util.Date;
import java.util.List;

import com.xinwei.taskmanager.model.extra.Argv;

public class KeyWord {
	
	private int id;
	private String name;
	private String env;
	private String type;
	private String user;
	private Date date;
	private Date update;
	private String desc;
	private String code;
	private List<Argv> argv;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEnv() {
		return env;
	}

	public void setEnv(String env) {
		this.env = env;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public Date getUpdate() {
		return update;
	}

	public void setUpdate(Date update) {
		this.update = update;
	}

	public String getDesc() {
		return desc;
	}

	public void setDesc(String desc) {
		this.desc = desc;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public List<Argv> getArgv() {
		return argv;
	}

	public void setArgv(List<Argv> argv) {
		this.argv = argv;
	}

}
