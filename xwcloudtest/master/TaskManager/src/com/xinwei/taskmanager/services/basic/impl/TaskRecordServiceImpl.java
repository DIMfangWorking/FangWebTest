package com.xinwei.taskmanager.services.basic.impl;

import java.util.List;

import org.slf4j.Logger;

import com.xinwei.taskmanager.dao.TaskRecordDao;
import com.xinwei.taskmanager.model.TaskRecord;
import com.xinwei.taskmanager.services.basic.TaskRecordService;

public class TaskRecordServiceImpl implements TaskRecordService {
	private TaskRecordDao taskRecordDao;
	private static Logger logger = null;

	public void setTaskRecordDao(TaskRecordDao taskRecordDao) {
		this.taskRecordDao = taskRecordDao;
	}

	@Override
	public TaskRecord saveTaskRecord(TaskRecord taskRecord) {
		if (taskRecord != null) {
			taskRecordDao.insert(taskRecord);
			return taskRecord;
		}
		return null;
	}

	@Override
	public String updateTaskRecord(TaskRecord taskRecord) {
		if (taskRecord != null) {
			taskRecordDao.update(taskRecord);
			return "success";
		}
		return "failed";
	}

	@Override
	public TaskRecord getTaskById(int id) {
		try {

			TaskRecord taskRecord = taskRecordDao.findById(id);
			if (taskRecord != null) {
				return taskRecord;
			}
		} catch (Exception e) {
			logger.error("Error when get task by id", e);
		}
		return null;
	}

	@Override
	public List<TaskRecord> findAllTask() {
		List<TaskRecord> taskRecords = null;
		try {
			taskRecords = taskRecordDao.findAll();
		} catch (Throwable e) {
			logger.error("Occur error when find all tasks : ", e.getMessage());
		}
		return taskRecords;
	}

	@Override
	public String insertAll(List<TaskRecord> taskRecord) {
		try {
			taskRecordDao.insertAll(taskRecord);

		} catch (Throwable e) {
			logger.error("Occur error when insert all task records : ", e.getMessage());
			return "Occur error when insert all task records : " + e.getMessage();
		}
		return "success";
	}

	@Override
	public int findTheLargestId() {
		return taskRecordDao.findTheLargestId();
	}


}
