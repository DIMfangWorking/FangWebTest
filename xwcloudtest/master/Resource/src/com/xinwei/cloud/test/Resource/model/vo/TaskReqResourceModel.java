package com.xinwei.cloud.test.Resource.model.vo;

import java.io.Serializable;

/**
 * Task请求Resource的数据模型
 *
 */
public class TaskReqResourceModel implements Serializable {
	private static final long serialVersionUID = -6795915838709668191L;
	private String type;
	private String major_id;
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
