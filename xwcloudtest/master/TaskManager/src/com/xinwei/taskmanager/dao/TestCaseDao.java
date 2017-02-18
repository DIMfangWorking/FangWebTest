package com.xinwei.taskmanager.dao;

import java.util.List;

import com.xinwei.taskmanager.model.TestCase;

public interface TestCaseDao{
	void insert(TestCase testCase);

	void insertAll(List<TestCase> testCase);

	void deleteById(int id);

	void delete(TestCase testCase);

	void deleteAll();

	void updateById(TestCase testCase);

	void update(TestCase testCase);

	TestCase findById(int id);

	List<TestCase> findAll();

	List<TestCase> find();

	long count();

	List<TestCase> findByIds(List<Integer> ids);
}
