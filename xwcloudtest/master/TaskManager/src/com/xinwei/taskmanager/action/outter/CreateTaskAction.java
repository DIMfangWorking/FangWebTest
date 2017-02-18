package com.xinwei.taskmanager.action.outter;

import com.xinwei.taskmanager.action.AbstractAction;
import com.xinwei.taskmanager.model.TaskRecord;
import com.xinwei.taskmanager.model.dto.TaskReqFromWebModel;
import com.xinwei.taskmanager.model.rpcmodel.ReplyCreateTaskModel;
import com.xinwei.uem.model.AbstractInnerMessage;
import com.xinwei.uem.util.Convert;

public class CreateTaskAction extends AbstractAction{
	
	@Override
	public AbstractInnerMessage action(AbstractInnerMessage message) throws Throwable {
		String result = message.getBody();
		TaskReqFromWebModel taskReqModel = (TaskReqFromWebModel)Convert.parserJson(result, TaskReqFromWebModel.class);
		TaskRecord taskRecord = facadeTaskService.createTask(taskReqModel);
		AbstractInnerMessage replyMsg = new AbstractInnerMessage();
		replyMsg.setMessageId("reply create task msg");
		ReplyCreateTaskModel replyCreateTaskModel = new ReplyCreateTaskModel();
		if (taskRecord != null) {
			replyCreateTaskModel.setResult(0);
			replyCreateTaskModel.setMessage("success");
			replyCreateTaskModel.setTaskId(taskRecord.getId());
			String responseBody = Convert.toJson(replyCreateTaskModel);
			replyMsg.setBody(responseBody);
		}
		return replyMsg;
	}

}
