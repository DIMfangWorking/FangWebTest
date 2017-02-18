package com.xinwei.taskmanager.model;

import java.util.List;
import java.util.Date;

public class TestGroup {
	
	
	private int id;
	private String name;
	private String type;
	private String user;
	private Date date;
	private Date update;
	private String desc;
	private List<TestCase> testcase;
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
	public List<TestCase> getTestcase() {
		return testcase;
	}
	public void setTestcase(List<TestCase> testcase) {
		this.testcase = testcase;
	}
	
	
	
}
