package com.xinwei.taskmanager.model.rpcmodel;

import com.xinwei.taskmanager.model.Resource;

public class TaskResultReqModel {
	private int task_id;
	private String status;
	private String result;
	private int run_time;
	private String cache_key;
	private String test_group;
	private Resource resource;
	private String fail_message;
	private String log_file;

	public int getTask_id() {
		return task_id;
	}

	public void setTask_id(int task_id) {
		this.task_id = task_id;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public int getRun_time() {
		return run_time;
	}

	public void setRun_time(int run_time) {
		this.run_time = run_time;
	}

	public String getCache_key() {
		return cache_key;
	}

	public void setCache_key(String cache_key) {
		this.cache_key = cache_key;
	}

	public String getTest_group() {
		return test_group;
	}

	public void setTest_group(String test_group) {
		this.test_group = test_group;
	}

	public Resource getResource() {
		return resource;
	}

	public void setResource(Resource resource) {
		this.resource = resource;
	}

	public String getFail_message() {
		return fail_message;
	}

	public void setFail_message(String fail_message) {
		this.fail_message = fail_message;
	}

	public String getLog_file() {
		return log_file;
	}

	public void setLog_file(String log_file) {
		this.log_file = log_file;
	}

}
