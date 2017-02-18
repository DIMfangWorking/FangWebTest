package com.xinwei.taskmanager.dao;

import java.util.List;

import com.xinwei.taskmanager.model.Resource;

public interface ResourceDao {
	void insert(Resource resource);

	void insertAll(List<Resource> Resource);

	void deleteById(int majorId);

	void delete(Resource resource);

	void deleteAll();

	void updateById(Resource resource);

	void update(Resource resource);

	Resource findById(int majorId);

	List<Resource> findAll();

	List<Resource> chooseSimResource();

	List<Resource> chooseRealResource();

	long count();
}