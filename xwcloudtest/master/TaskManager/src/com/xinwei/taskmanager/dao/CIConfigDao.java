package com.xinwei.taskmanager.dao;

import java.util.List;

import com.xinwei.taskmanager.model.CIConfig;

public interface CIConfigDao {
	void insert(CIConfig cIConfig);

	void insertAll(List<CIConfig> cIConfig);

	void deleteById(int id);

	void delete(CIConfig cIConfig);

	void deleteAll();

	void updateById(CIConfig cIConfig);

	void update(CIConfig cIConfig);

	CIConfig findById(int id);

	List<CIConfig> findAll();
	
	long count();

	List<CIConfig> findCIConfigByTypeAndEnvyType(String type, String env_type);
}