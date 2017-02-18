package com.xinwei.taskmanager.action.outter;

import com.xinwei.taskmanager.action.AbstractAction;
import com.xinwei.taskmanager.model.rpcmodel.ResultAndMessageModel;
import com.xinwei.taskmanager.model.rpcmodel.TaskResultReqModel;
import com.xinwei.uem.model.AbstractInnerMessage;
import com.xinwei.uem.util.Convert;

public class TaskResultAction extends AbstractAction {

	@Override
	public AbstractInnerMessage action(AbstractInnerMessage message) throws Throwable {
		String result = message.getBody();
		TaskResultReqModel resultReqModel = (TaskResultReqModel) Convert.parserJson(result, TaskResultReqModel.class);

		String serviceResult = facadeTaskService.taskResult(resultReqModel);

		AbstractInnerMessage replyMsg = new AbstractInnerMessage();
		replyMsg.setMessageId("reply task result msg");
		ResultAndMessageModel resultAndMessageModel = new ResultAndMessageModel();
		resultAndMessageModel.setResult(0);
		resultAndMessageModel.setMessage(serviceResult);
		String responseBody = Convert.toJson(resultAndMessageModel);
		replyMsg.setBody(responseBody);
		return replyMsg;
	}

}
