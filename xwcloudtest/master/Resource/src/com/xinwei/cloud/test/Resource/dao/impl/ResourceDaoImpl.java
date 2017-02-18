package com.xinwei.cloud.test.Resource.dao.impl;

import org.slf4j.Logger;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.xinwei.cloud.test.Resource.dao.ResourceDao;
import com.xinwei.cloud.test.Resource.model.Resource;

public class ResourceDaoImpl implements ResourceDao {
	protected MongoTemplate mongodb = null;

	protected static Logger logger = null;

	public MongoTemplate getMongodb() {
		return mongodb;
	}

	public void setMongodb(MongoTemplate mongodb) {
		this.mongodb = mongodb;
	}
	@Override
	public Resource get() throws Throwable {
		// TODO Auto-generated method stub
		return null;
	}

}
