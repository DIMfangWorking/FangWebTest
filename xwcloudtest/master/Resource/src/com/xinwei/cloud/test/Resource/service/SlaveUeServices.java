package com.xinwei.cloud.test.Resource.service;

import com.xinwei.cloud.test.Resource.model.vo.SlaveUEReport;

public interface SlaveUeServices {
	 String ueOnline(SlaveUEReport message) throws Throwable;
	 String ueBeatheart(SlaveUEReport message) throws Throwable;
}
