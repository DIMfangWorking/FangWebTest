package com.xinwei.taskmanager.model.extra;

import java.io.Serializable;

public class Ei_basic_image implements Serializable{

	
	private static final long serialVersionUID = 4089403879004215144L;
	private String name;
	private String url;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
}
