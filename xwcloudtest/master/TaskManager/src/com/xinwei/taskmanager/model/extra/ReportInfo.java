package com.xinwei.taskmanager.model.extra;

import java.io.Serializable;

public class ReportInfo implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = -841272394435477772L;

	private int minor_id = 0;
	private String resource_type = null;
	private String name = null;
	private String ip = null;
	private String epcip = null;
	private String pdnip = null;
	private String enbName = null;
	private int enbID = 0;
	private String Other = "";
	private String status = null;

	public int getMinor_id() {
		return minor_id;
	}

	public void setMinor_id(int minor_id) {
		this.minor_id = minor_id;
	}

	public String getResource_type() {
		return resource_type;
	}

	public void setResource_type(String resource_type) {
		this.resource_type = resource_type;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public String getEpcip() {
		return epcip;
	}

	public void setEpcip(String epcip) {
		this.epcip = epcip;
	}

	public String getPdnip() {
		return pdnip;
	}

	public void setPdnip(String pdnip) {
		this.pdnip = pdnip;
	}

	public String getEnbName() {
		return enbName;
	}

	public void setEnbName(String enbName) {
		this.enbName = enbName;
	}

	public int getEnbID() {
		return enbID;
	}

	public void setEnbID(int enbID) {
		this.enbID = enbID;
	}

	public String getOther() {
		return Other;
	}

	public void setOther(String other) {
		Other = other;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
}
