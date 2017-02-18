package com.xinwei.taskmanager.action.outter;

import com.xinwei.taskmanager.action.AbstractAction;
import com.xinwei.taskmanager.model.TaskRecord;
import com.xinwei.taskmanager.model.rpcmodel.TaskReportReqModel;
import com.xinwei.taskmanager.model.rpcmodel.ResultAndMessageModel;
import com.xinwei.uem.model.AbstractInnerMessage;
import com.xinwei.uem.util.Convert;

public class TaskReportAction extends AbstractAction {

	@Override
	public AbstractInnerMessage action(AbstractInnerMessage message) throws Throwable {
		String result = message.getBody();
		TaskReportReqModel reportReqModel = (TaskReportReqModel) Convert.parserJson(result, TaskReportReqModel.class);
		###########################################################TaskRecord taskRecordNeedShow = taskRecordService.getTaskById(reportReqModel.getTask_id());
		taskRecordNeedShow.setStatus(reportReqModel.getStatus());
		taskRecordNeedShow.setResult(reportReqModel.getResult());
		taskRecordNeedShow.setRun_time(reportReqModel.getRun_time());
		taskRecordNeedShow.setFail_message(reportReqModel.getFail_message());
		taskRecordNeedShow.setStep(reportReqModel.getStep());
		String updateResult = taskRecordService.updateTaskRecord(taskRecordNeedShow);
		if (updateResult.equals("success")) {
			AbstractInnerMessage replyMsg = new AbstractInnerMessage();
			replyMsg.setMessageId("reply report task msg");
			logger.info("test task complete. result :" + taskRecordNeedShow.getResult());
			ResultAndMessageModel resultAndMessageModel = new ResultAndMessageModel();
			resultAndMessageModel.setResult(0);
			resultAndMessageModel.setMessage(updateResult);
			String responseBody = Convert.toJson(resultAndMessageModel);
			replyMsg.setBody(responseBody);
			return replyMsg;
		} else {
			throw new Throwable("Error when update");
		}
	}

}
