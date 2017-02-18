package com.xinwei.cloud.test.Resource.service.impl;

import org.slf4j.Logger;

import com.xinwei.cloud.test.Resource.dao.SlaveDao;
import com.xinwei.cloud.test.Resource.model.vo.SlaveReport;
import com.xinwei.cloud.test.Resource.service.SlaveService;

public abstract class AbstractSlaveService implements SlaveService {
	protected SlaveDao dao = null;
	protected static Logger logger = null;

	public SlaveDao getDao() {
		return dao;
	}

	public void setDao(SlaveDao dao) {
		this.dao = dao;
	}

	@Override
	public String online(SlaveReport sp) throws Throwable {
		throw new Exception("not impl");
	}

	@Override
	public String beatheart(SlaveReport sp) throws Throwable {
		throw new Exception("not impl");
	}

}
