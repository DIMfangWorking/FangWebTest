package com.xinwei.taskmanager.services.util.model;

public class Callee {
	private Object type;
	private Object computed;
	private CalleeObject object;
	private Property property;
	public Object getType() {
		return type;
	}
	public void setType(Object type) {
		this.type = type;
	}
	public Object getComputed() {
		return computed;
	}
	public void setComputed(Object computed) {
		this.computed = computed;
	}
	public CalleeObject getObject() {
		return object;
	}
	public void setObject(CalleeObject object) {
		this.object = object;
	}
	public Property getProperty() {
		return property;
	}
	public void setProperty(Property property) {
		this.property = property;
	}
	@Override
	public String toString() {
		return "Callee [type=" + type + ", computed=" + computed + ", object=" + object + ", property=" + property
				+ "]";
	}
	
}
