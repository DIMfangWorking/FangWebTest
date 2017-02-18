package com.xinwei.taskmanager.dao;

import java.util.List;

public interface CacheDao {
	public List<Object> getCITaskCache(String keyId);
	public List<Object> getEIBasicLog(String keyId);
	public void delCITaskCache(String keyId);
	public void delEIBasicLog(String keyId);
	public void delStepLog(String keyId);
	public void pushCITaskCache(String keyId, String json);
}
