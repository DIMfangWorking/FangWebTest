package com.xinwei.taskmanager.services.facade.impl;

import java.util.List;

import com.xinwei.taskmanager.model.TaskRecord;
import com.xinwei.taskmanager.model.dto.TaskReqFromWebModel;
import com.xinwei.taskmanager.model.dto.TestGroupSelection;
import com.xinwei.taskmanager.model.rpcmodel.CreateAutoTaskModel;
import com.xinwei.taskmanager.model.rpcmodel.ResourceResTaskModel;
import com.xinwei.taskmanager.model.rpcmodel.TaskReqResourceModel;
import com.xinwei.taskmanager.services.facade.process.AutoTask;
import com.xinwei.taskmanager.services.facade.process.Common;
import com.xinwei.taskmanager.services.facade.process.TestAndUpdateWork;
import com.xinwei.uem.util.Convert;

public class CreateTaskServiceImpl extends AbstractFacadeTaskServicerImpl {

	public CreateTaskServiceImpl() {

	}

	public CreateTaskServiceImpl(Common common) {
		this.common = common;
	}

	/**
	 * 主要方法 先选择要运行resource的类型 再开启另外一个线程去执行Test，更新Task record和发送一条消息给slave通过RPC
	 */
	@Override
	public TaskRecord createTask(Object model) {
		if (model instanceof TaskReqFromWebModel) {
			TaskReqFromWebModel taskReqFromWebModel = (TaskReqFromWebModel) model;
			return createTask(taskReqFromWebModel);
		} else if (model instanceof CreateAutoTaskModel) {
			CreateAutoTaskModel autoTask = (CreateAutoTaskModel) model;
			return rerunAutoTask(autoTask);
		} else if (model instanceof Integer) {
			Integer reRunTaskId = (Integer) model;
			return rerunAutoTask(reRunTaskId);
		}
		return null;
	}

	private TaskRecord createTask(TaskReqFromWebModel taskReqModel) {
		try {
			TaskReqResourceModel taskReqResourceModel = new TaskReqResourceModel();
			TestAndUpdateWork testAndUpdateWork = null;
			TestGroupSelection testGroupSelection = null;
			taskReqResourceModel.setType(taskReqModel.getType());
			ResourceResTaskModel resourceResTaskModel = resourceService.chooseRealOrSimResource(taskReqResourceModel);
			if (resourceResTaskModel != null && resourceResTaskModel.getMajor_id() != -1) {

				taskRecordGot = common.saveRecordOfTask(resourceResTaskModel);
				testGroupSelection = caseManagerService.chooseTestGroup(taskRecordGot.getType(),
						taskRecordGot.getEnv_type());
				testAndUpdateWork = new TestAndUpdateWork(testGroupSelection, taskReqModel, resourceResTaskModel);
				// 开启另外线程去执行Test和更新
				taskExecutor.execute(testAndUpdateWork);
				return taskRecordGot;
			} else {
				throw new Throwable("No normal resource");
			}
		} catch (Throwable e) {
			logger.error("error when create Task : " + e);
		}
		return null;
	}

	private TaskRecord createAutoTask(CreateAutoTaskModel createAutoTaskModel) {
		AutoTask autoTask = new AutoTask();
		TaskRecord original_task = autoTask.getRerunTaskInfo(createAutoTaskModel);
		return original_task;
	}

	private TaskRecord rerunAutoTask(Object taskObj) {
		int task_id;
		TaskRecord original_task = null;
		ResourceResTaskModel resourceResTaskModel = null;
		TestGroupSelection testGroupSelection = null;
		AutoTask autoTask = new AutoTask();
		if (taskObj != null) {
			logger.info("rerun auto task start ", taskObj);
			if (taskObj instanceof Integer) {
				task_id = (Integer) taskObj;
				original_task = autoTask.getRerunTaskInfo(task_id);
				original_task.setTask_type("auto");
			} else if (taskObj instanceof CreateAutoTaskModel) {
				original_task = createAutoTask((CreateAutoTaskModel) taskObj);
			}

		}
		TaskReqResourceModel taskReqResourceModel = new TaskReqResourceModel();
		taskReqResourceModel.setType(original_task.getType());
		resourceResTaskModel = resourceService.chooseRealOrSimResource(taskReqResourceModel);
		if (resourceResTaskModel.getMajor_id() != -1) {
			String type = original_task.getType();
			String env_type = original_task.getEnv_type();
			testGroupSelection = caseManagerService.chooseTestGroup(type, env_type);
			if (testGroupSelection == null) {
				try {
					throw new Throwable("not found ci config");
				} catch (Throwable e) {
					logger.info("not found ci config");
				}
			}
		} else {
			String original_task_json = Convert.toJson(original_task);
			cacheService.pushCITaskCache("ci_task_cache", original_task_json);
		}
		autoTask.setTestGroupSelection(testGroupSelection);
		autoTask.setOriginal_task(original_task);
		return original_task;
	}

}
