package com.xinwei.taskmanager.model;

public class EIDetailed {
	
	private int MsgId;
	private String name;
	private int DspId;
	private int CoreId;
	private Object Tlv;
	private Object Struct;
	public int getMsgId() {
		return MsgId;
	}
	public void setMsgId(int msgId) {
		MsgId = msgId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getDspId() {
		return DspId;
	}
	public void setDspId(int dspId) {
		DspId = dspId;
	}
	public int getCoreId() {
		return CoreId;
	}
	public void setCoreId(int coreId) {
		CoreId = coreId;
	}
	public Object getTlv() {
		return Tlv;
	}
	public void setTlv(Object tlv) {
		Tlv = tlv;
	}
	public Object getStruct() {
		return Struct;
	}
	public void setStruct(Object struct) {
		Struct = struct;
	}
	
}
