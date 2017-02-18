package com.xinwei.taskmanager.dao;

import java.util.List;

import com.mongodb.operation.FindAndDeleteOperation;
import com.xinwei.taskmanager.model.TaskRecord;

public interface TaskRecordDao {
	void insert(TaskRecord taskRecord);

	void insertAll(List<TaskRecord> taskRecord);

	void deleteById(int id);

	void delete(TaskRecord taskRecord);

	void deleteAll();

	void updateById(TaskRecord taskRecord);

	void update(TaskRecord taskRecord);

	TaskRecord findById(int id);

	List<TaskRecord> findAll();

	List<TaskRecord> find();

	int findTheLargestId();

	long count();
}
