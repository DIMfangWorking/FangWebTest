package com.xinwei.cloud.test.Resource.service.impl;

import org.slf4j.Logger;

import com.xinwei.cloud.test.Resource.dao.ResourceDao;
import com.xinwei.cloud.test.Resource.model.vo.ResourceRequest;
import com.xinwei.cloud.test.Resource.service.ResourceService;

public abstract class AbstractResourceService implements ResourceService {
	protected ResourceDao dao = null;
	protected static Logger logger = null;

	public ResourceDao getDao() {
		return dao;
	}

	public void setDao(ResourceDao dao) {
		this.dao = dao;
	}

	@Override
	public String alloc(ResourceRequest message) throws Throwable {
		throw new Exception("not impl");
	}

	@Override
	public String release(ResourceRequest message) throws Throwable {
		throw new Exception("not impl");
	}

}
