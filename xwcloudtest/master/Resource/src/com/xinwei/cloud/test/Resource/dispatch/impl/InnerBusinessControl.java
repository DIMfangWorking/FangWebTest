package com.xinwei.cloud.test.Resource.dispatch.impl;

import java.lang.reflect.Method;
import java.util.Map;

import org.slf4j.Logger;

import com.xinwei.cloud.test.Resource.action.ActionInterface;
import com.xinwei.cloud.test.Resource.dispatch.BusinessControl;
import com.xinwei.uem.model.AbstractInnerMessage;

@SuppressWarnings("unused")
public class InnerBusinessControl extends BusinessControl {
	private Map<String, ActionInterface<AbstractInnerMessage>> normalConfig = null;

	private static Logger logger = null;

	public Map<String, ActionInterface<AbstractInnerMessage>> getNormalConfig() {
		return normalConfig;
	}

	public void setNormalConfig(Map<String, ActionInterface<AbstractInnerMessage>> normalConfig) {
		this.normalConfig = normalConfig;
	}

	@Override
	public AbstractInnerMessage process(AbstractInnerMessage message) throws Throwable {
		String MessageID = message.getMessageId();
		String[] StrOption = MessageID.split(" ");

		logger.info("message process");

		ActionInterface<AbstractInnerMessage> ai = normalConfig.get(message.getMessageId());
		return (AbstractInnerMessage) ai.action(message);
	}
}
