package com.xinwei.cloud.test.Resource.action;

public interface ActionInterface<T> {
	public abstract T action(T message) throws Throwable;
}