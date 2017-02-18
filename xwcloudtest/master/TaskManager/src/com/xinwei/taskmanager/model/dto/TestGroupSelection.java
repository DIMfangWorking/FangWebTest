package com.xinwei.taskmanager.model.dto;

import java.io.Serializable;

import com.xinwei.taskmanager.model.CIConfig;
import com.xinwei.taskmanager.model.TestGroup;

public class TestGroupSelection implements Serializable{
	private static final long serialVersionUID = -1015311635029448559L;
	private TestGroup test_group;
	private String Another_Name;
	private CIConfig cIConfig;

	public TestGroup getTest_group() {
		return test_group;
	}

	public void setTest_group(TestGroup test_group) {
		this.test_group = test_group;
	}

	public String getAnother_Name() {
		return Another_Name;
	}

	public void setAnother_Name(String another_Name) {
		Another_Name = another_Name;
	}

	public CIConfig getcIConfig() {
		return cIConfig;
	}

	public void setcIConfig(CIConfig cIConfig) {
		this.cIConfig = cIConfig;
	}

}
