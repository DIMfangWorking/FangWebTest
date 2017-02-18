package com.xinwei.cloud.test.Resource.model.vo;

import java.io.Serializable;

/**
 * 
 * Task请求释放资源的模型
 *
 */
public class TaskReqReleaseResourceModel implements Serializable {
	private static final long serialVersionUID = -6865858661718078005L;
	private int major_id;
	private int minor_id;

	public int getMajor_id() {
		return major_id;
	}

	public void setMajor_id(int major_id) {
		this.major_id = major_id;
	}

	public int getMinor_id() {
		return minor_id;
	}

	public void setMinor_id(int minor_id) {
		this.minor_id = minor_id;
	}

}
