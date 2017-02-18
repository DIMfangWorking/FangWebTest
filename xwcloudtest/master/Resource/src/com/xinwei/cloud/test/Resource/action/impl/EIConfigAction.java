package com.xinwei.cloud.test.Resource.action.impl;

import com.xinwei.cloud.test.Resource.action.AbstractAction;
import com.xinwei.cloud.test.Resource.model.vo.EIConfigNotify;
import com.xinwei.cloud.test.Resource.service.impl.concrete.EIConfigServices;

public class EIConfigAction  extends AbstractAction<EIConfigNotify, EIConfigServices> {

	@Override
	public String process(EIConfigNotify opt) throws Throwable {
		return services.update(opt);
	}
}