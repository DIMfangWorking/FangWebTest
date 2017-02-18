package com.xinwei.taskmanager.action.outter;

import com.xinwei.taskmanager.action.AbstractAction;
import com.xinwei.taskmanager.model.TaskRecord;
import com.xinwei.taskmanager.model.rpcmodel.CreateAutoTaskModel;
import com.xinwei.taskmanager.model.rpcmodel.ReplyCreateTaskModel;
import com.xinwei.uem.model.AbstractInnerMessage;
import com.xinwei.uem.util.Convert;

public class RerunAutoTaskAction extends AbstractAction {

	@Override
	public AbstractInnerMessage action(AbstractInnerMessage message) throws Throwable {
		String result = message.getBody();

		##################################################TaskRecord taskRecord = facadeTaskService.createTask(Integer.parseInt(result));
		AbstractInnerMessage replyMsg = new AbstractInnerMessage();
		replyMsg.setMessageId("reply ReRun auto task msg");
		ReplyCreateTaskModel replyCreateTaskModel = new ReplyCreateTaskModel();
		if (taskRecord != null) {
			replyCreateTaskModel.setResult(0);
			replyCreateTaskModel.setMessage("success");
			replyCreateTaskModel.setTaskId(Integer.parseInt(result));
			String responseBody = Convert.toJson(replyCreateTaskModel);
			replyMsg.setBody(responseBody);
		}
		return replyMsg;
	}

}
