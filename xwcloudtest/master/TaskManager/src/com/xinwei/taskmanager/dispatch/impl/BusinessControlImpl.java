package com.xinwei.taskmanager.dispatch.impl;

import java.util.Map;


import org.slf4j.Logger;

import com.xinwei.taskmanager.action.AbstractAction;
import com.xinwei.taskmanager.dispatch.BusinessControl;
import com.xinwei.uem.model.AbstractInnerMessage;

public class BusinessControlImpl extends BusinessControl {
	private Object defaultConfig = null;
    private Map<String, Object> normalConfig = null;
	private static Logger logger = null;

	@Override
	public AbstractInnerMessage process(AbstractInnerMessage message)
			throws Throwable {		
		logger.debug("message id : " + message.getMessageId());
		
		AbstractAction aa = (AbstractAction) normalConfig.get(message.getMessageId());
		
		return aa.action(message);
	}

	public Object getDefaultConfig() {
		return defaultConfig;
	}

	public void setDefaultConfig(Object defaultConfig) {
		this.defaultConfig = defaultConfig;
	}

	public Map<String, Object> getNormalConfig() {
		return normalConfig;
	}

	public void setNormalConfig(Map<String, Object> normalConfig) {
		this.normalConfig = normalConfig;
	}
}
