package com.xinwei.taskmanager.model.dto;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

import com.xinwei.taskmanager.model.TestCase;

public class TaskGroupSnapshot implements Serializable {
	private static final long serialVersionUID = 3471676783322420356L;
	private String name;
	private String type;
	private List<TestCase> testCases;
	private String XML;
	private Map<String, String> testCase;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public List<TestCase> getTestCases() {
		return testCases;
	}

	public void setTestCases(List<TestCase> testCases) {
		this.testCases = testCases;
	}

	public String getXML() {
		return XML;
	}

	public void setXML(String xML) {
		XML = xML;
	}

	public Map<String, String> getTestCase() {
		return testCase;
	}

	public void putAllTestCase(Map<String, String> testCase) {
		this.testCase.putAll(testCase);
	}

}
