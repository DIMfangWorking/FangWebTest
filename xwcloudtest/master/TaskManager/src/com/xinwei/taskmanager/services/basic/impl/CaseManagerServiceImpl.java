package com.xinwei.taskmanager.services.basic.impl;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;

import com.xinwei.taskmanager.dao.CIConfigDao;
import com.xinwei.taskmanager.dao.EIDetailedDao;
import com.xinwei.taskmanager.dao.TestCaseDao;
import com.xinwei.taskmanager.dao.TestGroupDao;
import com.xinwei.taskmanager.model.CIConfig;
import com.xinwei.taskmanager.model.EIDetailed;
import com.xinwei.taskmanager.model.TestCase;
import com.xinwei.taskmanager.model.TestGroup;
import com.xinwei.taskmanager.model.dto.TestGroupSelection;
import com.xinwei.taskmanager.services.basic.CaseManagerService;

public class CaseManagerServiceImpl implements CaseManagerService {
	private TestCaseDao testCaseDao;
	private TestGroupDao testGroupDao;
	private CIConfigDao CIConfigDao;
	private EIDetailedDao EIDetailedDao;
	private static Logger logger = null;

	public void setCIConfigDao(CIConfigDao CIConfigDao) {
		this.CIConfigDao = CIConfigDao;
	}

	public void setTestCaseDao(TestCaseDao testCaseDao) {
		this.testCaseDao = testCaseDao;
	}

	public void setTestGroupDao(TestGroupDao testGroupDao) {
		this.testGroupDao = testGroupDao;
	}

	public void setEIConfigDao(EIDetailedDao EIDetailedDao) {
		this.EIDetailedDao = EIDetailedDao;
	}

	@Override
	public String saveTestCase(TestCase testcase) {
		if (testcase != null) {
			testCaseDao.insert(testcase);
			return "success";
		}
		return "failed";
	}

	@Override
	public String updateTestCase(TestCase testcase) {
		if (testcase != null) {
			testCaseDao.update(testcase);
			return "success";
		}
		return "failed";
	}

	@Override
	public TestCase getTestCaseById(int id) {
		TestCase testcase = testCaseDao.findById(id);
		if (testcase != null) {
			return testcase;
		}
		return null;
	}

	@Override
	public List<TestCase> findAllTestCase() {
		List<TestCase> testcases = null;
		try {
			testcases = testCaseDao.findAll();
		} catch (Throwable e) {
			logger.error("Occur error when find all testcases : ", e);
		}
		return testcases;
	}

	@Override
	public String insertAll(List<TestCase> testcases) {
		try {
			testCaseDao.insertAll(testcases);

		} catch (Throwable e) {
			logger.error("Occur error when insert all TestCase records : ", e);
			return "Occur error when insert all TestCase records : " + e;
		}
		return "success";
	}

	@Override
	public TestGroup findByName(String name) {
		return testGroupDao.findByName(name);
	}

	@Override
	public List<TestCase> getTestCaseFromTestGroup(String name) {
		TestGroup testGroup = findByName(name);
		List<TestCase> testCasesFromTestGroup = testGroup.getTestcase();
		List<TestCase> testCases = new ArrayList<>();
		for (TestCase testCase : testCasesFromTestGroup) {
			TestCase testCaseTemp = getTestCaseById(testCase.getId());
			testCases.add(testCaseTemp);
		}
		return testCases;
	}

	@Override
	public TestGroupSelection chooseTestGroup(String type, String env_type) {
		List<CIConfig> CIConfigs = CIConfigDao.findCIConfigByTypeAndEnvyType(type, env_type);
		if (CIConfigs == null || CIConfigs.size() == 0) {
			logger.info("not found ci config");
			return null;
		}
		CIConfig ciConfig = CIConfigs.get(0);
		TestGroupSelection testGroupSelection = new TestGroupSelection();
		testGroupSelection.setcIConfig(ciConfig);
		if (type.equals("real")) {
			testGroupSelection.setAnother_Name(ciConfig.getAnother_Name());
		}
		TestGroup testGroup = testGroupDao.findByName(ciConfig.getTest_group());
		testGroup.setTestcase(getTestCaseFromTestGroup(testGroup.getName()));
		testGroupSelection.setTest_group(testGroup);
		return testGroupSelection;
	}

	@Override
	public List<TestCase> findTestCaseByIds(List<Integer> ids) {
		return testCaseDao.findByIds(ids);
	}

	@Override
	public List<EIDetailed> getEIDetailed() {
		return EIDetailedDao.findAll();
	}

}
