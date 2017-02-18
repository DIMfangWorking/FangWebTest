package com.xinwei.taskmanager.dao.impl;

import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import com.xinwei.taskmanager.dao.TestCaseDao;
import com.xinwei.taskmanager.model.TestCase;

import junit.framework.Test;

public class TestCaseDaoImpl implements TestCaseDao {
	private MongoTemplate mongoTemplate = null;

	private static final String collectionName = "testcases";

	public MongoTemplate getMongoTemplate() {
		return mongoTemplate;
	}

	public void setMongoTemplate(MongoTemplate mongoTemplate) {
		this.mongoTemplate = mongoTemplate;
	}

	@Override
	public void insert(TestCase testCase) {
		mongoTemplate.insert(testCase, collectionName);
	}

	@Override
	public void insertAll(List<TestCase> list) {
		for (TestCase testCase : list)
			insert(testCase);
	}

	@Override
	public void deleteById(int id) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(id));
		mongoTemplate.remove(query, collectionName);
	}

	@Override
	public void delete(TestCase testCase) {
		deleteById(testCase.getId());
	}

	@Override
	public void deleteAll() {
		Query query = new Query();
		mongoTemplate.remove(query, collectionName);
	}

	@Override
	public void updateById(TestCase testCase) {
		update(testCase);

	}

	@Override
	public void update(TestCase testCase) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(testCase.getId()));

		Update update = Update.update(null, null);
		mongoTemplate.upsert(query, update, collectionName);
	}

	public List<TestCase> findAll() {
		return mongoTemplate.findAll(TestCase.class, collectionName);
	}

	public TestCase findById(int id) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(id));
		return (TestCase) mongoTemplate.find(query, TestCase.class, collectionName).get(0);
	}

	@Override
	public List<TestCase> find() {
		return findAll();
	}

	@Override
	public long count() {
		return mongoTemplate.count(new Query(), collectionName);
	}

	@Override
	public List<TestCase> findByIds(List<Integer> ids) {
		List<TestCase> res = null;
		Query query = new Query();
		query.addCriteria(Criteria.where("id").in(ids));
		res = mongoTemplate.find(query, TestCase.class, collectionName);
		return res;

	}
}
