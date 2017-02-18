package com.xinwei.taskmanager.dao.impl;

import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import com.xinwei.taskmanager.dao.CIConfigDao;
import com.xinwei.taskmanager.model.CIConfig;

public class CIConfigDaoImpl implements CIConfigDao {
	private MongoTemplate mongoTemplate = null;

	private static final String collectionName = "ciconfigs";

	public MongoTemplate getMongoTemplate() {
		return mongoTemplate;
	}

	public void setMongoTemplate(MongoTemplate mongoTemplate) {
		this.mongoTemplate = mongoTemplate;
	}

	@Override
	public void insert(CIConfig cIConfig) {
		mongoTemplate.insert(cIConfig, collectionName);
	}

	@Override
	public void insertAll(List<CIConfig> list) {
		for (CIConfig cIConfig : list)
			insert(cIConfig);
	}

	@Override
	public void deleteById(int id) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(id));
		mongoTemplate.remove(query, collectionName);
	}

	@Override
	public void delete(CIConfig cIConfig) {
		deleteById(cIConfig.getId());
	}

	@Override
	public void deleteAll() {
		Query query = new Query();
		mongoTemplate.remove(query, collectionName);
	}

	@Override
	public void updateById(CIConfig cIConfig) {
		update(cIConfig);

	}

	@Override
	public void update(CIConfig cIConfig) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(cIConfig.getId()));

		Update update = Update.update(null, null);
		mongoTemplate.upsert(query, update, collectionName);
	}

	public List<CIConfig> findAll() {
		return mongoTemplate.findAll(CIConfig.class, collectionName);
	}

	public CIConfig findById(int id) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(id));
		return (CIConfig) mongoTemplate.find(query, CIConfig.class, collectionName).get(0);
	}

	@Override
	public List<CIConfig> findCIConfigByTypeAndEnvyType(String type, String env_type) {
		Query query = new Query();
		query.addCriteria(Criteria.where("type").is(type));
		query.addCriteria(Criteria.where("env_type").is(env_type));
		return mongoTemplate.find(query, CIConfig.class, collectionName);
	}

	@Override
	public long count() {
		return mongoTemplate.count(new Query(), collectionName);
	}
}
