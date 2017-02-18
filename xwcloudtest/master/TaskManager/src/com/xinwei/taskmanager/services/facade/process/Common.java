package com.xinwei.taskmanager.services.facade.process;

import com.xinwei.taskmanager.model.TaskRecord;
import com.xinwei.taskmanager.model.rpcmodel.CreateAutoTaskModel;
import com.xinwei.taskmanager.model.rpcmodel.ResourceResTaskModel;
import com.xinwei.taskmanager.services.facade.impl.AbstractFacadeTaskServicerImpl;
import com.xinwei.uem.util.Convert;

public class Common extends AbstractFacadeTaskServicerImpl {
	public synchronized TaskRecord saveRecordOfTask(Object... objects) {
		TaskRecord taskRecord = new TaskRecord();
		if (objects.length == 1) {
			if (objects[0] instanceof ResourceResTaskModel) {
				try {
					int uuid = taskRecordService.findTheLargestId();
					taskRecord.setId(uuid + 1);
					taskRecord.setResult("fail");
					taskRecord.setStatus("run");
					taskRecord.setRun_time(0);
					String resource_snapshot = Convert.toJson(resourceResTaskModel);
					taskRecord.setResource_snapshot(resource_snapshot);
					taskRecordService.saveTaskRecord(taskRecord);
				} catch (Throwable e) {
					logger.error("Error when Save task : " + e);
				}
			} else if (objects[0] instanceof CreateAutoTaskModel) {
				int uuid = taskRecordService.findTheLargestId();
				taskRecord.setId(uuid + 1);
				taskRecord.setResult("fail");
				taskRecord.setStatus("run");
				taskRecord.setRun_time(0);
				taskRecord.setTask_type("auto");
				CreateAutoTaskModel createAutoTaskModel = (CreateAutoTaskModel) objects[0];
				taskRecord.setBin_file(createAutoTaskModel.getBin_file());
				taskRecord.setCode_path(createAutoTaskModel.getCode_path());
				taskRecord.setEnv_type(createAutoTaskModel.getEnv_type());
				taskRecord.setRevision(createAutoTaskModel.getRevision());
				taskRecord.setType(createAutoTaskModel.getType());
				taskRecordService.saveTaskRecord(taskRecord);
			}
		}
		return taskRecord;
	}
}
