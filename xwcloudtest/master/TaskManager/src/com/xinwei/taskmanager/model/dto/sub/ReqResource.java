package com.xinwei.taskmanager.model.dto.sub;

import java.io.Serializable;

public class ReqResource implements Serializable {

	private static final long serialVersionUID = -2069144606527478485L;
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
