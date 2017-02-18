package com.xinwei.taskmanager.model.dto;

import java.io.Serializable;

import com.xinwei.taskmanager.model.dto.sub.MeasuredObject;
import com.xinwei.taskmanager.model.dto.sub.ReqResource;

public class TaskReqFromWebModel implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = -3122961816681958069L;
	/*
	 * { "user":"用户名", "type":"模拟环境/真实环境", "revision":"对应要测试的svn编号",
	 * "code_path":"url", "test_group":"测试组编号", "resource":{"major_id":"主设备号",
	 * "minor_id":"子设备号"}, "measured_object" : { "exe_file":"可执行文件路径",
	 * "db_file":"db文件路径", "url":"版本文件或lte_app的ftp地址" }
	 */
	private String user;
	private String type;
	private String revision;
	private String code_path;
	private String test_group;
	private ReqResource resource;
	private MeasuredObject measured_object;

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getRevision() {
		return revision;
	}

	public void setRevision(String revision) {
		this.revision = revision;
	}

	public String getCode_path() {
		return code_path;
	}

	public void setCode_path(String code_path) {
		this.code_path = code_path;
	}

	public String getTest_group() {
		return test_group;
	}

	public void setTest_group(String test_group) {
		this.test_group = test_group;
	}

	public ReqResource getResource() {
		return resource;
	}

	public void setResource(ReqResource resource) {
		this.resource = resource;
	}

	public MeasuredObject getMeasured_object() {
		return measured_object;
	}

	public void setMeasured_object(MeasuredObject measured_object) {
		this.measured_object = measured_object;
	}

}
