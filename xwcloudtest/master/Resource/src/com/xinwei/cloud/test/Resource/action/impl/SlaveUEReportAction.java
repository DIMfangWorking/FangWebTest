package com.xinwei.cloud.test.Resource.action.impl;

import com.xinwei.cloud.test.Resource.action.AbstractAction;
import com.xinwei.cloud.test.Resource.model.vo.SlaveUEReport;
import com.xinwei.cloud.test.Resource.service.SlaveUeServices;

public class SlaveUEReportAction extends AbstractAction<SlaveUEReport, SlaveUeServices> {
	@Override
	public String process(SlaveUEReport opt) throws Throwable {
		return services.ueBeatheart(opt);
	}

}
