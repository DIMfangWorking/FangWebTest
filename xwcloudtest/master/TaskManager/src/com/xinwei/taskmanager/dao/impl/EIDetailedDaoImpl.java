package com.xinwei.taskmanager.dao.impl;

import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;

import com.xinwei.taskmanager.dao.EIDetailedDao;
import com.xinwei.taskmanager.model.EIDetailed;

public class EIDetailedDaoImpl implements EIDetailedDao {
	private MongoTemplate mongoTemplate = null;

	private static final String collectionName = "eidetaileds";

	public MongoTemplate getMongoTemplate() {
		return mongoTemplate;
	}

	public void setMongoTemplate(MongoTemplate mongoTemplate) {
		this.mongoTemplate = mongoTemplate;
	}

	@Override
	public List<EIDetailed> findAll() {
		return mongoTemplate.findAll(EIDetailed.class, collectionName);
	}

}
