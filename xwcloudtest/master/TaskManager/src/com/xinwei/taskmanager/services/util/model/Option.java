package com.xinwei.taskmanager.services.util.model;

import java.util.List;

public class Option {
	private String name;
	private List<Object> arguments;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<Object> getArguments() {
		return arguments;
	}

	public void setArguments(List<Object> arguments) {
		this.arguments = arguments;
	}

}
