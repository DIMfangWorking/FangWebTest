package com.xinwei.taskmanager.services.util.model;

public class Properties {
	private Object type;
	private PropertiesKey key;
	private PropertiesValue value;
	private Object kind;

	public Object getType() {
		return type;
	}

	public void setType(Object type) {
		this.type = type;
	}

	public PropertiesKey getKey() {
		return key;
	}

	public void setKey(PropertiesKey key) {
		this.key = key;
	}

	public PropertiesValue getValue() {
		return value;
	}

	public void setValue(PropertiesValue value) {
		this.value = value;
	}

	public Object getKind() {
		return kind;
	}

	public void setKind(Object kind) {
		this.kind = kind;
	}

	@Override
	public String toString() {
		return "Properties [type=" + type + ", key=" + key + ", value=" + value + ", kind=" + kind + "]";
	}
	
}
