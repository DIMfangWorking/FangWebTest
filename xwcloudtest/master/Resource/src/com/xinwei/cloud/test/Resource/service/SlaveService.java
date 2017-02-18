package com.xinwei.cloud.test.Resource.service;

import com.xinwei.cloud.test.Resource.model.vo.SlaveReport;

public interface SlaveService {
	String online(SlaveReport sp) throws Throwable;
	String beatheart(SlaveReport sp) throws Throwable;
}