package com.xinwei.taskmanager.services.basic;

import java.util.List;

import com.xinwei.taskmanager.model.EIDetailed;
import com.xinwei.taskmanager.model.TestCase;
import com.xinwei.taskmanager.model.TestGroup;
import com.xinwei.taskmanager.model.dto.TestGroupSelection;

public interface CaseManagerService {
	public String saveTestCase(TestCase testCase);

	public String updateTestCase(TestCase testCase);

	public TestCase getTestCaseById(int id);

	public List<TestCase> findAllTestCase();

	public String insertAll(List<TestCase> testCase);

	public TestGroup findByName(String name);

	public List<TestCase> getTestCaseFromTestGroup(String name);

	public TestGroupSelection chooseTestGroup(String type, String env_type);

	public List<TestCase> findTestCaseByIds(List<Integer> ids);

	public List<EIDetailed> getEIDetailed();
}
