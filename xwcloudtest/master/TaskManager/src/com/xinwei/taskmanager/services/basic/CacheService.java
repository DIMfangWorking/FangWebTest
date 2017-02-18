package com.xinwei.taskmanager.services.basic;

import java.util.List;

import com.xinwei.taskmanager.model.dto.CICache;

public interface CacheService {
	public List<Object> getCITaskCache(String keyId);
	public List<Object> getEIBasicLog(String keyId);
	public void delCITaskCache(String keyId);
	public void delEIBasicLog(String keyId);
	public void delStepLog(String keyId);
	public List<CICache> getCacheLog(String key, String testGroup);
	public void pushCITaskCache(String keyId, String json);
	List<Object> getEiBasicLog(String keyId);
}
