package com.xinwei.cloud.test.Resource.datamanipulation.impl;

import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import com.xinwei.cloud.test.Resource.datamanipulation.MongodbDao;
import com.xinwei.cloud.test.Resource.model.Resource;


public class MongodbDaoimpl implements MongodbDao {
	
	private MongoTemplate mongoTemplate = null;
	private static final String collectionName = "resources";

	public MongoTemplate getMongoTemplate() {
		return mongoTemplate;
	}

	public void setMongoTemplate(MongoTemplate mongoTemplate) {
		this.mongoTemplate = mongoTemplate;
	}

	@Override
	public void insert(Resource resource) {
		
		mongoTemplate.insert(resource, collectionName);
	}

	@Override
	public void insertAll(List<Resource> list) {
		
		for (Resource resource : list)
			insert(resource);
	}

	@Override
	public void deleteById(int majorId) {
		
		Query query = new Query();
		query.addCriteria(Criteria.where("major_id").is(majorId));
		mongoTemplate.remove(query, collectionName);
	}

	@Override
	public void delete(Resource resource) {
		
		deleteById(resource.getMajor_id());
	}

	@Override
	public void deleteAll() {
		
		Query query = new Query();
		mongoTemplate.remove(query, collectionName);
	}

	@Override
	public void updateById(Resource resource) {
		
		update(resource);
	}

	@Override
	public void update(Resource resource) {
		
		Query query = new Query();
		query.addCriteria(Criteria.where("major_id").is(resource.getMajor_id()));
		
		Update update = Update.update(null, null);
		mongoTemplate.upsert(query, update, collectionName);
	}

	@Override
	public Resource findById(int majorId) {
		
		Query query = new Query();
		query.addCriteria(Criteria.where("major_id").is(majorId));
		return (Resource) mongoTemplate.find(query, Resource.class, collectionName).get(0);
	}

	@Override
	public List<Resource> findAll() {
		
		return mongoTemplate.findAll(Resource.class, collectionName);
	}

	@Override
	public List<Resource> find() {
		
		return findAll();
	}

	@Override
	public long count() {
		
		return mongoTemplate.count(new Query(), collectionName);
	}
	
	public Resource findOne(Query query) {
		
		List<Resource> resource = mongoTemplate.find(query, Resource.class, collectionName);
		if(resource.isEmpty())
		{
			return null;
		}
		else
		{
		    return resource.get(0);
		}
	}

}
