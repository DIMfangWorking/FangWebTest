package com.xinwei.taskmanager.services.basic;

import java.util.List;

import com.xinwei.taskmanager.model.CIConfig;

public interface CIConfigService {
	public String saveCIConfig(CIConfig cIConfig);
	public String updateCIConfig(CIConfig cIConfig);
	public CIConfig getCIConfigById(int id);
	public List<CIConfig> findAllCIConfig();
	public String insertAll(List<CIConfig> cIConfig);
}
