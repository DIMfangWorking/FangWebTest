package com.xinwei.taskmanager.services.basic.impl;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;

import com.xinwei.taskmanager.dao.CacheDao;
import com.xinwei.taskmanager.model.dto.CICache;
import com.xinwei.taskmanager.model.dto.CacheLogMessage;
import com.xinwei.taskmanager.services.basic.CacheService;
import com.xinwei.uem.util.Convert;

public class CacheServiceImpl implements CacheService {
	private CacheDao cacheDao;
	private static Logger logger = null;

	public void setCacheDao(CacheDao cacheDao) {
		this.cacheDao = cacheDao;
	}

	@Override
	public List<Object> getCITaskCache(String keyId) {
		return cacheDao.getCITaskCache(keyId);
	}

	@Override
	public List<Object> getEIBasicLog(String keyId) {
		return cacheDao.getEIBasicLog(keyId);
	}

	@Override
	public void delCITaskCache(String keyId) {
		cacheDao.delCITaskCache(keyId);
	}

	@Override
	public void delEIBasicLog(String keyId) {
		cacheDao.delEIBasicLog(keyId);
	}

	@Override
	public void delStepLog(String keyId) {
		cacheDao.delStepLog(keyId);
	}

	@Override
	public List<CICache> getCacheLog(String key, String testGroup) {
		logger.info("run get Cache Log start ");
		List<Object> result = getCITaskCache(key);
		List<CICache> cICaches = new ArrayList<CICache>();
		List<String> logs = new ArrayList<String>();
		CICache ciCache = new CICache();
		String atomPatt = "^run Atom\\w+ result : False$\n";
		String patt1 = "^group " + testGroup + " run result: (False|True)$\n";

		for (Object object : result) {
			String messageString = (String) object;
			CacheLogMessage cacheLogMessage = (CacheLogMessage) Convert.parserJson(messageString,
					CacheLogMessage.class);
			String message = cacheLogMessage.getMessage();
			logs.add(message);
			if (message.matches(atomPatt)) {
				ciCache.setFail_message(message);
			} else {
				if (message.matches(patt1)) {
					if (message.contains("False")) {
						ciCache.setResult("fail");
					} else {
						ciCache.setResult("success");
					}

				}
			}
			ciCache.setLogs(logs);
			cICaches.add(ciCache);
		}
		return cICaches;
	}

	@Override
	public void pushCITaskCache(String keyId, String json) {
		cacheDao.pushCITaskCache(keyId, json);
	}

	@Override
	public List<Object> getEiBasicLog(String keyId) {
		return getEIBasicLog(keyId);
	}
}
