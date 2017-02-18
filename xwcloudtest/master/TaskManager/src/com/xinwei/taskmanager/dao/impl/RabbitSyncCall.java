package com.xinwei.taskmanager.dao.impl;

import org.slf4j.Logger;

import com.xinwei.taskmanager.dao.InnerCommunicate;
import com.xinwei.uem.model.AbstractInnerMessage;
import com.xinwei.uem.util.RPCClient;

public class RabbitSyncCall implements InnerCommunicate{
	private RPCClient rpcClient = null;

	private static Logger logger = null;

	public RabbitSyncCall(RPCClient rpcClient) {
		super();
		this.rpcClient = rpcClient;
	}

	public void notifyServices(AbstractInnerMessage message) throws Throwable {
		logger.debug("notifyServices");
		rpcClient.asynchronousCallMethod(message);
	}

	public AbstractInnerMessage syncCallServices(AbstractInnerMessage message)
			throws Throwable {
		logger.debug("syncCallServices");
		return rpcClient.InvokeMethod(message);
	}

}
