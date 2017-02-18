package com.xinwei.taskmanager.model.rpcmodel;

import java.io.Serializable;

public class ReplyCreateTaskModel implements Serializable{

	private static final long serialVersionUID = 5496305460748423970L;
	
	private int taskId;
	private int result;
	private String message;
	public int getTaskId() {
		return taskId;
	}
	public void setTaskId(int taskId) {
		this.taskId = taskId;
	}
	public int getResult() {
		return result;
	}
	public void setResult(int result) {
		this.result = result;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	
	
	
}
