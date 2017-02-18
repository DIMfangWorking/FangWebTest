package com.xinwei.taskmanager.dispatch;

import org.slf4j.Logger;

import com.xinwei.uem.model.AbstractInnerMessage;
import com.xinwei.uem.util.workqueue.AsyncRpcMessageProcessBean;
import com.xinwei.uem.util.workqueue.AsyncRpcMessageProcessBean.BusinessBean;
import com.xinwei.uem.util.workqueue.AsyncRpcMessageProcessBean.ReplyBean;

public abstract class BusinessControl implements BusinessBean {
	private AbstractInnerMessage paramInnerMessage = null;
	private AbstractInnerMessage resultInnerMessage = null;

	private AsyncRpcMessageProcessBean asyncRpcMessageProcessBean = null;
	private ReplyBean replyBean = null;
	private Object replyPara = null;

	private static Logger logger = null;

	@Override
	public void setAsyncRpcMessageProcessBean(AsyncRpcMessageProcessBean armpb) {
		this.asyncRpcMessageProcessBean = armpb;
	}

	@Override
	public void setNeedProcessMessage(AbstractInnerMessage aim) {
		this.paramInnerMessage = aim;
	}

	@Override
	public void setReplyParam(Object replyPara) {
		this.replyPara = replyPara;
	}

	@Override
	public void setReplyBean(ReplyBean rb) {
		this.replyBean = rb;
	}

	public abstract AbstractInnerMessage process(AbstractInnerMessage message)
			throws Throwable;

	@Override
	public void run() {
		try {
			try {
				resultInnerMessage = this.process(this.paramInnerMessage);
				this.replyBean.replyRpc(resultInnerMessage, replyPara);
			} catch (Throwable e) {
				this.replyBean.replyRpc(null, replyPara);
				logger.error("process message " + this.paramInnerMessage.getMessageId()
						+ " error");
				this.asyncRpcMessageProcessBean.exceptionProcessMessage(e);
			} finally {
				this.asyncRpcMessageProcessBean.completeProcessMessage(this);
			}
		} catch (Throwable e) {
			logger.error("error ", e);
		}
	}
}