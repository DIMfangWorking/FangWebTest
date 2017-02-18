package com.xinwei.taskmanager.dao.impl;

import java.util.List;

import org.bson.AbstractBsonReader;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.BasicQuery;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import com.xinwei.taskmanager.dao.TaskRecordDao;
import com.xinwei.taskmanager.model.TaskRecord;

public class TaskRecordDaoImpl implements TaskRecordDao {
	private MongoTemplate mongoTemplate = null;

	private static final String collectionName = "taskrecords";
	public MongoTemplate getMongoTemplate() {
		return mongoTemplate;
	}

	public void setMongoTemplate(MongoTemplate mongoTemplate) {
		this.mongoTemplate = mongoTemplate;
	}

	@Override
	public void insert(TaskRecord taskRecord) {
		mongoTemplate.insert(taskRecord, collectionName);
	}

	@Override
	public void insertAll(List<TaskRecord> list) {
		for (TaskRecord taskRecord : list)
			insert(taskRecord);
	}

	@Override
	public void deleteById(int id) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(id));
		mongoTemplate.remove(query, collectionName);
	}

	@Override
	public void delete(TaskRecord taskRecord) {
		deleteById(taskRecord.getId());
	}

	@Override
	public void deleteAll() {
		Query query = new Query();
		mongoTemplate.remove(query, collectionName);
	}

	@Override
	public void updateById(TaskRecord taskRecord) {
		update(taskRecord);

	}

	@Override
	public void update(TaskRecord taskRecord) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(taskRecord.getId()));
		Update update = new Update();
		update.set("id", taskRecord.getId());
		update.set("rerun_id", taskRecord.getRerun_id());
		update.set("type", taskRecord.getType());
		update.set("resource", taskRecord.getResource());
		update.set("resource_snapshot", taskRecord.getResource_snapshot());
		update.set("task_type", taskRecord.getTask_type());
		update.set("env_type", taskRecord.getEnv_type());
		update.set("user", taskRecord.getUser());
		update.set("date", taskRecord.getDate());
		update.set("status", taskRecord.getStatus());
		update.set("step", taskRecord.getStep());
		update.set("run_time", taskRecord.getRun_time());
		update.set("revision", taskRecord.getRevision());
		update.set("code_path", taskRecord.getCode_path());
		update.set("bin_file", taskRecord.getBin_file());
		update.set("test_group", taskRecord.getTest_group());
		update.set("taskgroup_snapshot", taskRecord.getTaskgroup_snapshot());
		update.set("result", taskRecord.getResult());
		update.set("logs", taskRecord.getLogs());
		update.set("ei_basic", taskRecord.getEi_basic());
		update.set("ei_basic_image", taskRecord.getEi_basic_image());
		update.set("url", taskRecord.getUrl());
		update.set("log_file", taskRecord.getLog_file());
		update.set("fail_message", taskRecord.getFail_message());
		mongoTemplate.upsert(query, update, collectionName);
	}

	public List<TaskRecord> findAll() {
		return mongoTemplate.findAll(TaskRecord.class, collectionName);
	}

	public TaskRecord findById(int id) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(id));
		return (TaskRecord) mongoTemplate.find(query, TaskRecord.class, collectionName).get(0);
	}

	@Override
	public List<TaskRecord> find() {
		return findAll();
	}

	@Override
	public long count() {
		return mongoTemplate.count(new Query(), collectionName);
	}

	@Override
	public int findTheLargestId() {
		Query query = new BasicQuery("{}").with(new Sort(new Sort.Order(Sort.Direction.DESC, "id"))).limit(1);
		TaskRecord record = (TaskRecord) mongoTemplate.findOne(query, TaskRecord.class, collectionName);
		
		return record.getId();
	}
}
