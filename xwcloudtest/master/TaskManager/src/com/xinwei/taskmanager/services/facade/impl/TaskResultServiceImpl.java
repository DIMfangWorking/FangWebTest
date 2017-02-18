package com.xinwei.taskmanager.services.facade.impl;

import com.xinwei.taskmanager.model.rpcmodel.TaskResultReqModel;
import com.xinwei.taskmanager.services.facade.process.CacheAndLog;

public class TaskResultServiceImpl extends AbstractFacadeTaskServicerImpl {
	public TaskResultServiceImpl() {
	}
	@Override
	public String taskResult(TaskResultReqModel resultReqModel) {
		CacheAndLog cacheAndLog = new CacheAndLog(resultReqModel);
		taskExecutor.execute(cacheAndLog);
		return "success";
	}
}
