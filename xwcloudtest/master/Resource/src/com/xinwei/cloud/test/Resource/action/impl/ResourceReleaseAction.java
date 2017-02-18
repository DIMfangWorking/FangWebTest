package com.xinwei.cloud.test.Resource.action.impl;

import com.xinwei.cloud.test.Resource.action.AbstractAction;
import com.xinwei.cloud.test.Resource.model.vo.ResourceRequest;
import com.xinwei.cloud.test.Resource.service.ResourceService;

public class ResourceReleaseAction extends AbstractAction<ResourceRequest, ResourceService> {

	@Override
	public String process(ResourceRequest opt) throws Throwable {
		return services.release(opt);
	}

}
