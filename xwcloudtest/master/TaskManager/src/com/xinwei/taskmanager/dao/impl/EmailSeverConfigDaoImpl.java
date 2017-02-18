package com.xinwei.taskmanager.dao.impl;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import com.xinwei.taskmanager.dao.EmailSeverConfigDao;
import com.xinwei.taskmanager.model.EmailSeverConfig;

public class EmailSeverConfigDaoImpl implements EmailSeverConfigDao {
	private MongoTemplate mongoTemplate = null;

	private static final String collectionName = "emailseverconfigs";

	public MongoTemplate getMongoTemplate() {
		return mongoTemplate;
	}

	public void setMongoTemplate(MongoTemplate mongoTemplate) {
		this.mongoTemplate = mongoTemplate;
	}

	@Override
	public EmailSeverConfig findOne() {
		return (EmailSeverConfig) mongoTemplate.findOne(new Query(), EmailSeverConfig.class, collectionName);
	}
}