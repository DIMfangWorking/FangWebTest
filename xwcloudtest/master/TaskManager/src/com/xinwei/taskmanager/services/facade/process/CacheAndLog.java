package com.xinwei.taskmanager.services.facade.process;

import com.xinwei.taskmanager.model.rpcmodel.TaskResultReqModel;
import com.xinwei.taskmanager.services.facade.impl.TaskResultServiceImpl;

public class CacheAndLog extends TaskResultServiceImpl implements Runnable {

	@Override
	public void run() {

	}

	public CacheAndLog() {

	}

	public CacheAndLog(TaskResultReqModel resultReqModel) {
		String key = resultReqModel.getCache_key();
		String testGroup = resultReqModel.getTest_group();
		CICacheList = cacheService.getCacheLog(key, testGroup);
	}

	public void getCacheLog() {
		cacheService.delCITaskCache(resultReqModel.getCache_key());
	}

	public void delStepLog() {
		cacheService.delCITaskCache(resultReqModel.getCache_key() + ".step");
	}

	public void getEiBasicLog() {
		// 发消息
	}

	public void closeTask() {
		taskRecordForResult.setStatus("close");
		taskRecordService.updateTaskRecord(taskRecordForResult);
	}

	public void manualTaskResult() {
		//从redis里面取出TaskRecordStory
		//给 task result process发消息 生成图片
	}

	public void updateTaskRecord() {

	}

	public void updateResourceStatus() {

	}

	public void autoTaskResult() {

	}
}
