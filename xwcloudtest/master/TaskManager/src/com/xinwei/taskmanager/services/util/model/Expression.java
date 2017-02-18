package com.xinwei.taskmanager.services.util.model;

public class Expression {
	private Object type;
	private Callee callee;
	private Object arguments;
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
	public Object getArguments() {
		return arguments;
	}
	public void setArguments(Object arguments) {
		this.arguments = arguments;
	}
	
}
