package com.xinwei.taskmanager.model;

import java.util.Date;
import java.util.List;

import com.xinwei.taskmanager.model.extra.Argv;
import com.xinwei.taskmanager.model.extra.SequenceOfOpera;

public class TestCase {
	
	private int id;
	private String name;
	private String type;
	private String user;
	private String version;
	private Date date;
	private Date update;
	private String desc;
	private List<Argv> argv;
	private List<SequenceOfOpera> sequenceOfOpera;

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

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
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

	public List<Argv> getArgv() {
		return argv;
	}

	public void setArgv(List<Argv> argv) {
		this.argv = argv;
	}

	public List<SequenceOfOpera> getSequenceOfOpera() {
		return sequenceOfOpera;
	}

	public void setSequenceOfOpera(List<SequenceOfOpera> sequenceOfOpera) {
		this.sequenceOfOpera = sequenceOfOpera;
	}

}
