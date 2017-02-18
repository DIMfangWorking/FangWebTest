package com.xinwei.taskmanager.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import org.omg.CORBA.PUBLIC_MEMBER;

import com.xinwei.taskmanager.model.extra.Ei_basic_image;
import com.xinwei.uem.util.Convert;

public class TaskRecord implements Serializable {

	private static final long serialVersionUID = 1541896136569605493L;
	private int id;
	private int rerun_id;
	private String type;
	private Resource resource;
	private String resource_snapshot;
	private String task_type;
	private String env_type;
	private String user;
	private Date date;
	private String status;
	private String step;
	private int run_time;
	private String revision;
	private String code_path;
	private String bin_file;
	private String test_group;
	private String taskgroup_snapshot;
	private String result;
	private List<String> logs;
	private List<Object> ei_basic;
	private List<Ei_basic_image> ei_basic_image;
	private String url;
	private String log_file;
	private String fail_message;
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public int getRerun_id() {
		return rerun_id;
	}
	public void setRerun_id(int rerun_id) {
		this.rerun_id = rerun_id;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public Resource getResource() {
		return resource;
	}
	public void setResource(Resource resource) {
		this.resource = resource;
	}
	public String getResource_snapshot() {
		return resource_snapshot;
	}
	public void setResource_snapshot(String resource_snapshot) {
		this.resource_snapshot = resource_snapshot;
	}
	public String getTask_type() {
		return task_type;
	}
	public void setTask_type(String task_type) {
		this.task_type = task_type;
	}
	public String getEnv_type() {
		return env_type;
	}
	public void setEnv_type(String env_type) {
		this.env_type = env_type;
	}
	public String getUser() {
		return user;
	}
	public void setUser(String user) {
		this.user = user;
	}
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getStep() {
		return step;
	}
	public void setStep(String step) {
		this.step = step;
	}
	public int getRun_time() {
		return run_time;
	}
	public void setRun_time(int run_time) {
		this.run_time = run_time;
	}
	public String getRevision() {
		return revision;
	}
	public void setRevision(String revision) {
		this.revision = revision;
	}
	public String getCode_path() {
		return code_path;
	}
	public void setCode_path(String code_path) {
		this.code_path = code_path;
	}
	public String getBin_file() {
		return bin_file;
	}
	public void setBin_file(String bin_file) {
		this.bin_file = bin_file;
	}
	public String getTest_group() {
		return test_group;
	}
	public void setTest_group(String test_group) {
		this.test_group = test_group;
	}
	public String getTaskgroup_snapshot() {
		return taskgroup_snapshot;
	}
	public void setTaskgroup_snapshot(String taskgroup_snapshot) {
		this.taskgroup_snapshot = taskgroup_snapshot;
	}
	public String getResult() {
		return result;
	}
	public void setResult(String result) {
		this.result = result;
	}
	public List<String> getLogs() {
		return logs;
	}
	public void setLogs(List<String> logs) {
		this.logs = logs;
	}
	public List<Object> getEi_basic() {
		return ei_basic;
	}
	public void setEi_basic(List<Object> ei_basic) {
		this.ei_basic = ei_basic;
	}
	public List<Ei_basic_image> getEi_basic_image() {
		return ei_basic_image;
	}
	public void setEi_basic_image(List<Ei_basic_image> ei_basic_image) {
		this.ei_basic_image = ei_basic_image;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	public String getLog_file() {
		return log_file;
	}
	public void setLog_file(String log_file) {
		this.log_file = log_file;
	}
	public String getFail_message() {
		return fail_message;
	}
	public void setFail_message(String fail_message) {
		this.fail_message = fail_message;
	}
	
	public String toJson(TaskRecord taskRecord) {
		String taskRecordJson = Convert.toJson(taskRecord);
		return taskRecordJson;
	}
	
	
}
