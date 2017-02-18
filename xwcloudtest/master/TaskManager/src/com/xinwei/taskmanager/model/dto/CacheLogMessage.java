package com.xinwei.taskmanager.model.dto;

import java.io.Serializable;

public class CacheLogMessage implements Serializable {
	private static final long serialVersionUID = -7599777459293904940L;
	
	private String message;

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

}
