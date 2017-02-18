package com.xinwei.taskmanager.services.util.impl;

import com.xinwei.taskmanager.services.facade.process.TestAndUpdateWork;
import com.xinwei.taskmanager.services.util.AtomActionService;

public class LoadVersionActionServiceImpl extends AtomAction implements AtomActionService {

	@Override
	public void atomAction(Object...objects) {
		TestAndUpdateWork.loadedVersionFalg = true;
	}

}
