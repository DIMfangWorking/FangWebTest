package com.xinwei.taskmanager.dispatch;

import org.slf4j.Logger;
import org.springframework.aop.target.CommonsPoolTargetSource;
import org.springframework.core.task.TaskExecutor;

import com.xinwei.uem.util.workqueue.AsyncRpcMessageProcessBean;
import com.xinwei.uem.util.workqueue.WorkQueuesRpcServer;

@SuppressWarnings("deprecation")
public class Dispatch implements AsyncRpcMessageProcessBean {
	private TaskExecutor threadPool = null;
	private CommonsPoolTargetSource poolTargetSource = null;
	private WorkQueuesRpcServer workQueuesRpcServer = null;

	private static Logger logger = null;

	public Dispatch(TaskExecutor threadPool,
			CommonsPoolTargetSource poolTargetSource) throws Throwable {
		super();
		this.threadPool = threadPool;
		this.poolTargetSource = poolTargetSource;
	}

	public WorkQueuesRpcServer getWorkQueuesRpcServer() {
		return workQueuesRpcServer;
	}

	public void setWorkQueuesRpcServer(WorkQueuesRpcServer workQueuesRpcServer) {

		this.workQueuesRpcServer = workQueuesRpcServer;
		this.workQueuesRpcServer.setRecvProcessBean(this);
	}

	public void innerCommunicate() {
		logger.info("start mq dispatch ");

		try {
			this.workQueuesRpcServer.setRecvProcessBean(this);
		} catch (Throwable e) {
			logger.error("dispatch message error", e);
		}
	}

	@Override
	public TaskExecutor getTaskExecutor() {
		return threadPool;
	}

	@Override
	public BusinessBean getBusinessBean() throws Throwable {
		Object obj = poolTargetSource.getTarget();
		poolTargetSource.activateObject(obj);

		BusinessControl bc = (BusinessControl) obj;

		return bc;
	}

	@Override
	public void exceptionProcessMessage(Throwable e) {
		logger.error("process error ", e);
	}

	@Override
	public void completeProcessMessage(BusinessBean bb) {
		logger.debug("completeProcessMessage ");
		// this.poolTargetSource.passivateObject(bb);
		try {
			this.poolTargetSource.releaseTarget((Object)bb);
		} catch (Exception e) {
			logger.error("return BusinessBean fail", e);
		}
	}
}
