package com.xinwei.taskmanager.model.rpcmodel;

import java.io.Serializable;

/**
 * Task请求Resource的数据模型
 *
 */
public class TaskReqResourceModel implements Serializable {
	private static final long serialVersionUID = -6795915838709668191L;
	// real or simulation
	private String type;
	// 真实资源ID, 两者ID为空则为自动去执行
	private String major_id;
	// 虚拟资源ID
	private String minor_id;

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getMajor_id() {
		return major_id;
	}

	public void setMajor_id(String major_id) {
		this.major_id = major_id;
	}

	public String getMinor_id() {
		return minor_id;
	}

	public void setMinor_id(String minor_id) {
		this.minor_id = minor_id;
	}

}
