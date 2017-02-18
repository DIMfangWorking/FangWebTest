package com.xinwei.taskmanager.services.util.model;

import java.util.Map;

public class JavaScriptObject {
	private Map<String, Body> body;
	private Object type;
	public Map<String, Body> getBody() {
		return body;
	}

	public void setBody(Map<String, Body> body) {
		this.body = body;
	}

	public Object getType() {
		return type;
	}

	public void setType(Object type) {
		this.type = type;
	}
	
}
