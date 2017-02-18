package com.xinwei.taskmanager.services.util.model;

import java.util.Map;

public class Arguments {
	private Object type;
	private Map<Object, Properties> properties;
	private Object value;
	private Object raw;
	private Callee callee;
	private Map<Object, Arguments> arguments;

	public Object getType() {
		return type;
	}

	public void setType(Object type) {
		this.type = type;
	}

	public Map<Object, Properties> getProperties() {
		return properties;
	}

	public void setProperties(Map<Object, Properties> properties) {
		this.properties = properties;
	}

	@Override
	public String toString() {
		return "Arguments [type=" + type + ", properties=" + properties + "]";
	}

	public Object getValue() {
		return value;
	}

	public void setValue(Object value) {
		this.value = value;
	}

	public Object getRaw() {
		return raw;
	}

	public void setRaw(Object raw) {
		this.raw = raw;
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

}
