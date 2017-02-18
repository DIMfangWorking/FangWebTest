package com.xinwei.cloud.test.Resource.dao.impl;

import org.slf4j.Logger;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.xinwei.cloud.test.Resource.dao.EIConfigDao;

public class EIConfigDaoImpl implements EIConfigDao {
	protected MongoTemplate mongodb = null;

	protected static Logger logger = null;

	public MongoTemplate getMongodb() {
		return mongodb;
	}

	public void setMongodb(MongoTemplate mongodb) {
		this.mongodb = mongodb;
	}

	@Override
	public String get() {
		return null;
	}

}
