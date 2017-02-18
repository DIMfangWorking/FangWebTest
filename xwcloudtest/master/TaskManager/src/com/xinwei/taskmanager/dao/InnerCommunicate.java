package com.xinwei.taskmanager.dao;

import com.xinwei.uem.model.AbstractInnerMessage;

public interface InnerCommunicate {
	void notifyServices(AbstractInnerMessage message) throws Throwable;
	AbstractInnerMessage syncCallServices(AbstractInnerMessage message) throws Throwable;
}