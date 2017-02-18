package com.xinwei.taskmanager.services.basic.impl;

import java.util.List;

import org.slf4j.Logger;

import com.xinwei.taskmanager.dao.CIConfigDao;
import com.xinwei.taskmanager.model.CIConfig;
import com.xinwei.taskmanager.services.basic.CIConfigService;

public class CIConfigServiceImpl implements CIConfigService {
	private CIConfigDao CIConfigDao;
	private static Logger logger = null;

	public void setCIConfigDao(CIConfigDao CIConfigDao) {
		this.CIConfigDao = CIConfigDao;
	}

	@Override
	public String saveCIConfig(CIConfig cIConfig) {
		if (cIConfig != null) {
			CIConfigDao.insert(cIConfig);
			return "success";
		}
		return "failed";
	}

	@Override
	public String updateCIConfig(CIConfig cIConfig) {
		if (cIConfig != null) {
			CIConfigDao.update(cIConfig);
			return "success";
		}
		return "failed";
	}

	@Override
	public CIConfig getCIConfigById(int id) {
		CIConfig cIConfig = CIConfigDao.findById(id);
		if (cIConfig != null) {
			return cIConfig;
		}
		return null;
		
	}

	@Override
	public List<CIConfig> findAllCIConfig() {
		List<CIConfig> cIConfigs = null;
		try {
			cIConfigs = CIConfigDao.findAll();
		} catch (Throwable e) {
			logger.error("Occur error when find all cIConfigs : ", e.getMessage());
		}
		return cIConfigs;
	}

	@Override
	public String insertAll(List<CIConfig> cIConfigs) {
		try {
			CIConfigDao.insertAll(cIConfigs);

		} catch (Throwable e) {
			logger.error("Occur error when insert all CIConfig records : ", e.getMessage());
			return "Occur error when insert all CIConfig records : " + e.getMessage();
		}
		return "success";
	}

}
