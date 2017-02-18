package com.xinwei.taskmanager.dao.impl;

import java.util.List;

import org.springframework.data.redis.core.RedisTemplate;

import com.xinwei.taskmanager.dao.CacheDao;

public class CacheDaoImpl implements CacheDao {

	protected RedisTemplate<String, Object> redis0Template = null;
	protected RedisTemplate<String, Object> redis2Template = null;

	public void setRedis0Template(RedisTemplate<String, Object> redis0Template) {
		this.redis0Template = redis0Template;
	}

	public void setRedis2Template(RedisTemplate<String, Object> redis2Template) {
		this.redis2Template = redis2Template;
	}
	@Override
	public void pushCITaskCache(String keyId, String json) {
		redis0Template.opsForList().rightPush(keyId, json);
	}
	@Override
	public List<Object> getCITaskCache(String keyId) {
		List<Object> result = redis0Template.opsForList().range(keyId, 0, -1);
		return result;
	}

	@Override
	public List<Object> getEIBasicLog(String keyId) {
		List<Object> result = redis2Template.opsForList().range(keyId, 0, -1);
		return result;
	}


	@Override
	public void delCITaskCache(String key) {
		redis0Template.delete(key);
	}

	@Override
	public void delEIBasicLog(String key) {
		redis2Template.delete(key);
	}

	@Override
	public void delStepLog(String key) {
		redis0Template.delete(key);
	}
}
