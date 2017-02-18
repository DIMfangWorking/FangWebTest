package com.xinwei.taskmanager.action;

import org.slf4j.Logger;

import com.xinwei.taskmanager.services.basic.TaskRecordService;
import com.xinwei.taskmanager.services.facade.FacadeTaskService;
import com.xinwei.uem.model.AbstractInnerMessage;

public abstract class AbstractAction {
	// Service for Create task
	protected FacadeTaskService facadeTaskService = null;
	// Service for Task Report
	protected TaskRecordService taskRecordService = null;
	protected static Logger logger;

	public void setFacadeTaskService(FacadeTaskService facadeTaskService) {
		this.facadeTaskService = facadeTaskService;
	}

	public void setTaskRecordService(TaskRecordService taskRecordService) {
		this.taskRecordService = taskRecordService;
	}

	public abstract AbstractInnerMessage action(AbstractInnerMessage message) throws Throwable;
}