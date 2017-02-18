package com.xinwei.taskmanager.model.rpcmodel;

import java.util.List;

import com.xinwei.taskmanager.model.rpcmodel.sub.AccessInformation;

public class SendToSlaveReq<T> {
	private List<AccessInformation> accessInformation;
	private T data;

	public List<AccessInformation> getAccessInformation() {
		return accessInformation;
	}

	public void setAccessInformation(List<AccessInformation> accessInformation) {
		this.accessInformation = accessInformation;
	}

	public T getData() {
		return data;
	}

	public void setData(T data) {
		this.data = data;
	}

}
