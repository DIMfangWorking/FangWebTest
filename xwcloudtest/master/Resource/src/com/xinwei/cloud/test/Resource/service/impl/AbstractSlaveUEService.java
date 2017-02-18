package com.xinwei.cloud.test.Resource.service.impl;

import org.slf4j.Logger;

import com.xinwei.cloud.test.Resource.dao.SlaveUEDao;
import com.xinwei.cloud.test.Resource.model.vo.SlaveUEReport;
import com.xinwei.cloud.test.Resource.service.SlaveUeServices;

public abstract class AbstractSlaveUEService implements SlaveUeServices {
	protected SlaveUEDao dao = null;
	protected static Logger logger = null;

	public SlaveUEDao getDao() {
		return dao;
	}

	public void setDao(SlaveUEDao dao) {
		this.dao = dao;
	}

	@Override
	public String ueOnline(SlaveUEReport message) throws Throwable {
		throw new Exception("not impl");
	}

	@Override
	public String ueBeatheart(SlaveUEReport message) throws Throwable{
		throw new Exception("not impl");
	}

}
