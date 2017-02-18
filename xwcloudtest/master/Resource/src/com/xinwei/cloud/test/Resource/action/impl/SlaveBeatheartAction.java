package com.xinwei.cloud.test.Resource.action.impl;

import com.xinwei.cloud.test.Resource.action.AbstractAction;
import com.xinwei.cloud.test.Resource.model.vo.SlaveReport;
import com.xinwei.cloud.test.Resource.service.SlaveService;

public class SlaveBeatheartAction extends AbstractAction<SlaveReport, SlaveService>{

	@Override
	public String process(SlaveReport sp) throws Throwable {
		return services.beatheart(sp);
	}

}
