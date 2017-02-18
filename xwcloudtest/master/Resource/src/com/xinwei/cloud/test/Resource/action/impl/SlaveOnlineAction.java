package com.xinwei.cloud.test.Resource.action.impl;

import com.xinwei.cloud.test.Resource.action.AbstractAction;
import com.xinwei.cloud.test.Resource.model.vo.SlaveReport;
import com.xinwei.cloud.test.Resource.service.SlaveService;

public class SlaveOnlineAction extends AbstractAction<SlaveReport, SlaveService> {

	@Override
	public String process(SlaveReport opt) throws Throwable {
		return services.online(opt);
	}

}
