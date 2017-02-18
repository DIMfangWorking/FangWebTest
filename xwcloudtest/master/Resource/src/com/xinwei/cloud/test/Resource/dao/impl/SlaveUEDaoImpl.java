package com.xinwei.cloud.test.Resource.dao.impl;

import org.slf4j.Logger;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.redis.core.RedisTemplate;

import com.xinwei.cloud.test.Resource.dao.SlaveUEDao;
import com.xinwei.cloud.test.Resource.model.UE;

public class SlaveUEDaoImpl implements SlaveUEDao {
	protected RedisTemplate<String, String> redis0Template = null;
	protected RedisTemplate<String, String> redis1Template = null;
	protected RedisTemplate<String, String> redis2Template = null;

	protected MongoTemplate mongodb = null;

	protected static Logger logger = null;

	public MongoTemplate getMongodb() {
		return mongodb;
	}

	public void setMongodb(MongoTemplate mongodb) {
		this.mongodb = mongodb;
	}

	public RedisTemplate<String, String> getRedis0Template() {
		return redis0Template;
	}

	public void setRedis0Template(RedisTemplate<String, String> redis0Template) {
		this.redis0Template = redis0Template;
	}

	public RedisTemplate<String, String> getRedis1Template() {
		return redis1Template;
	}

	public void setRedis1Template(RedisTemplate<String, String> redis1Template) {
		this.redis1Template = redis1Template;
	}

	public RedisTemplate<String, String> getRedis2Template() {
		return redis2Template;
	}

	public void setRedis2Template(RedisTemplate<String, String> redis2Template) {
		this.redis2Template = redis2Template;
	}

	@Override
	public UE get() {
		return null;
	}

}
