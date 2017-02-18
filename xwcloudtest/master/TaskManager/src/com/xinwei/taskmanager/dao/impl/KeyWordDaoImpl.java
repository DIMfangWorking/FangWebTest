package com.xinwei.taskmanager.dao.impl;

import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import com.xinwei.taskmanager.dao.KeyWordDao;
import com.xinwei.taskmanager.model.KeyWord;

public class KeyWordDaoImpl implements KeyWordDao {
	private MongoTemplate mongoTemplate = null;

	private static final String collectionName = "keywords";

	public MongoTemplate getMongoTemplate() {
		return mongoTemplate;
	}

	public void setMongoTemplate(MongoTemplate mongoTemplate) {
		this.mongoTemplate = mongoTemplate;
	}

	@Override
	public void insert(KeyWord keyWord) {
		mongoTemplate.insert(keyWord, collectionName);
	}

	@Override
	public void insertAll(List<KeyWord> list) {
		for (KeyWord keyWord : list)
			insert(keyWord);
	}

	@Override
	public void deleteById(int id) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(id));
		mongoTemplate.remove(query, collectionName);
	}

	@Override
	public void delete(KeyWord keyWord) {
		deleteById(keyWord.getId());
	}

	@Override
	public void deleteAll() {
		Query query = new Query();
		mongoTemplate.remove(query, collectionName);
	}

	@Override
	public void updateById(KeyWord keyWord) {
		update(keyWord);

	}

	@Override
	public void update(KeyWord keyWord) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(keyWord.getId()));

		Update update = Update.update(null, null);
		mongoTemplate.upsert(query, update, collectionName);
	}

	public List<KeyWord> findAll() {
		return mongoTemplate.findAll(KeyWord.class, collectionName);
	}

	public KeyWord findById(int id) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(id));
		return (KeyWord) mongoTemplate.find(query, KeyWord.class, collectionName).get(0);
	}

	@Override
	public List<KeyWord> find() {
		return findAll();
	}

	@Override
	public long count() {
		return mongoTemplate.count(new Query(), collectionName);
	}
}
