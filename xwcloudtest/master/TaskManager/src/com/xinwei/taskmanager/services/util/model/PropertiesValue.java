package com.xinwei.taskmanager.services.util.model;

import java.util.Map;

public class PropertiesValue {
	private Object type;
	private Object value;
	private Object raw;
	private Map<Object, Properties> properties;
	public Object getType() {
		return type;
	}

	public void setType(Object type) {
		this.type = type;
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

	public Map<Object, Properties> getProperties() {
		return properties;
	}

	public void setProperties(Map<Object, Properties> properties) {
		this.properties = properties;
	}

	@Override
	public String toString() {
		return "PropertiesValue [type=" + type + ", value=" + value + ", raw=" + raw + ", properties=" + properties
				+ "]";
	}

}
