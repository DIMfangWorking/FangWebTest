package com.xinwei.taskmanager.action.outter;

import com.xinwei.taskmanager.action.AbstractAction;
import com.xinwei.taskmanager.model.TaskRecord;
import com.xinwei.taskmanager.model.rpcmodel.CreateAutoTaskModel;
import com.xinwei.taskmanager.model.rpcmodel.ReplyCreateTaskModel;
import com.xinwei.uem.model.AbstractInnerMessage;
import com.xinwei.uem.util.Convert;

public class CreateAutoTaskAction extends AbstractAction {

	@Override
	public AbstractInnerMessage action(AbstractInnerMessage message) throws Throwable {
		String result = message.getBody();
		CreateAutoTaskModel createAutoTaskModel = (CreateAutoTaskModel) Convert.parserJson(result,
				CreateAutoTaskModel.class);
		TaskRecord taskRecord = facadeTaskService.createTask(createAutoTaskModel);
		AbstractInnerMessage replyMsg = new AbstractInnerMessage();
		replyMsg.setMessageId("reply create auto task msg");
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
