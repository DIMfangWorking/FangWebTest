package com.xinwei.taskmanager.services.facade;

import com.xinwei.taskmanager.model.TaskRecord;
import com.xinwei.taskmanager.model.dto.TaskReqFromWebModel;
import com.xinwei.taskmanager.model.rpcmodel.TaskResultReqModel;

public interface FacadeTaskService {
	public TaskRecord createTask(Object model) throws Throwable;
	public String taskResult(TaskResultReqModel resultReqModel) throws Throwable;
	public String taskStatus() throws Throwable;
}
