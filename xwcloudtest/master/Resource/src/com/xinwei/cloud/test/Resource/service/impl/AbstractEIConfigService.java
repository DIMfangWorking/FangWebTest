package com.xinwei.cloud.test.Resource.service.impl;

import org.slf4j.Logger;

import com.xinwei.cloud.test.Resource.dao.EIConfigDao;
import com.xinwei.cloud.test.Resource.model.vo.EIConfigNotify;
import com.xinwei.cloud.test.Resource.service.EIConfigService;

public abstract class AbstractEIConfigService implements EIConfigService {
	protected EIConfigDao dao = null;
	protected static Logger logger = null;

	public EIConfigDao getDao() {
		return dao;
	}

	public void setDao(EIConfigDao dao) {
		this.dao = dao;
	}

	@Override
	public String update(EIConfigNotify opt) throws Throwable {
		throw new Exception("not impl");
	}

}
