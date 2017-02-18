package com.xinwei.taskmanager.dao.impl;

import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import com.xinwei.taskmanager.dao.TestGroupDao;
import com.xinwei.taskmanager.model.TestGroup;

public class TestGroupDaoImpl implements TestGroupDao {
	private MongoTemplate mongoTemplate = null;

	private static final String collectionName = "testgroups";

	public MongoTemplate getMongoTemplate() {
		return mongoTemplate;
	}

	public void setMongoTemplate(MongoTemplate mongoTemplate) {
		this.mongoTemplate = mongoTemplate;
	}

	@Override
	public void insert(TestGroup testGroup) {
		mongoTemplate.insert(testGroup, collectionName);
	}

	@Override
	public void insertAll(List<TestGroup> list) {
		for (TestGroup testGroup : list)
			insert(testGroup);
	}

	@Override
	public void deleteById(int id) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(id));
		mongoTemplate.remove(query, collectionName);
	}

	@Override
	public void delete(TestGroup testGroup) {
		deleteById(testGroup.getId());
	}

	@Override
	public void deleteAll() {
		Query query = new Query();
		mongoTemplate.remove(query, collectionName);
	}

	@Override
	public void updateById(TestGroup testGroup) {
		update(testGroup);

	}

	@Override
	public void update(TestGroup testGroup) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(testGroup.getId()));

		Update update = Update.update(null, null);
		mongoTemplate.upsert(query, update, collectionName);
	}

	public List<TestGroup> findAll() {
		return mongoTemplate.findAll(TestGroup.class, collectionName);
	}

	public TestGroup findById(int id) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(id));
		return (TestGroup) mongoTemplate.find(query, TestGroup.class, collectionName).get(0);
	}

	@Override
	public TestGroup findByName(String name) {
		Query query = new Query();
		query.addCriteria(Criteria.where("name").is(name));
		return (TestGroup) mongoTemplate.find(query, TestGroup.class, collectionName).get(0);
	}

	@Override
	public long count() {
		return mongoTemplate.count(new Query(), collectionName);
	}

	
}
