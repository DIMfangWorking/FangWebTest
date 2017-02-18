package com.xinwei.taskmanager.model.dto;

import java.io.Serializable;
import java.util.List;

public class CICache implements Serializable {
	private static final long serialVersionUID = 8421658151197212086L;
	private String result;
	private List<String> logs;
	private String fail_message;

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public List<String> getLogs() {
		return logs;
	}

	public void setLogs(List<String> logs) {
		this.logs = logs;
	}

	public String getFail_message() {
		return fail_message;
	}

	public void setFail_message(String fail_message) {
		this.fail_message = fail_message;
	}
}
