package com.xinwei.taskmanager.dao;

import java.util.List;

import com.xinwei.taskmanager.model.TestGroup;

public interface TestGroupDao {
	void insert(TestGroup testGroup);

	void insertAll(List<TestGroup> testGroup);

	void deleteById(int id);

	void delete(TestGroup testGroup);

	void deleteAll();

	void updateById(TestGroup testGroup);

	void update(TestGroup testGroup);

	TestGroup findById(int id);

	List<TestGroup> findAll();

	TestGroup findByName(String name);

	long count();
}
