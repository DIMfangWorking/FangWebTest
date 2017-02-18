package com.xinwei.taskmanager.services.util.model;

import java.util.Map;

public class CalleeObject {
	private Object type;
	private Callee callee;
	private Map<Object, Arguments> arguments;
	private Object name;
	public Object getType() {
		return type;
	}
	public void setType(Object type) {
		this.type = type;
	}
	public Callee getCallee() {
		return callee;
	}
	public void setCallee(Callee callee) {
		this.callee = callee;
	}
	public Map<Object, Arguments> getArguments() {
		return arguments;
	}
	public void setArguments(Map<Object, Arguments> arguments) {
		this.arguments = arguments;
	}
	public Object getName() {
		return name;
	}
	public void setName(Object name) {
		this.name = name;
	}
	@Override
	public String toString() {
		return "CalleeObject [callee=" + callee + ", arguments=" + arguments + ", name=" + name
				+ "]";
	}
	
}
