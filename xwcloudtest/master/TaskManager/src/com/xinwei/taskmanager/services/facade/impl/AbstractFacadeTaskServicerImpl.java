package com.xinwei.taskmanager.services.facade.impl;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.springframework.core.task.TaskExecutor;

import com.xinwei.taskmanager.dao.InnerCommunicate;
import com.xinwei.taskmanager.model.TaskRecord;
import com.xinwei.taskmanager.model.dto.CICache;
import com.xinwei.taskmanager.model.dto.ErrorMessage;
import com.xinwei.taskmanager.model.dto.TaskGroupSnapshot;
import com.xinwei.taskmanager.model.dto.TaskReqFromWebModel;
import com.xinwei.taskmanager.model.dto.TestGroupSelection;
import com.xinwei.taskmanager.model.rpcmodel.ResourceResTaskModel;
import com.xinwei.taskmanager.model.rpcmodel.SendToSlaveRes;
import com.xinwei.taskmanager.model.rpcmodel.TaskResultReqModel;
import com.xinwei.taskmanager.services.basic.CacheService;
import com.xinwei.taskmanager.services.basic.CaseManagerService;
import com.xinwei.taskmanager.services.basic.ResourceService;
import com.xinwei.taskmanager.services.basic.TaskRecordService;
import com.xinwei.taskmanager.services.facade.FacadeTaskService;
import com.xinwei.taskmanager.services.facade.process.Common;
import com.xinwei.taskmanager.services.util.AtomActionService;

public abstract class AbstractFacadeTaskServicerImpl implements FacadeTaskService {

	protected InnerCommunicate innerCommunicate = null;
	protected static Logger logger = null;
	protected TaskExecutor taskExecutor = null;
	protected Common common = null;
	/**
	 * Create Task to-use
	 */
	// AtomAction Map
	protected Map<String, AtomActionService> atomActionMap;
	// Global variable
	public static boolean loadedVersionFalg = false;
	// Services
	protected TaskRecordService taskRecordService = null;
	protected ResourceService resourceService = null;
	protected CaseManagerService caseManagerService = null;
	protected CacheService cacheService = null;
	// Models
	protected TestGroupSelection testGroupSelection = null;
	protected TaskReqFromWebModel taskReqFromWebModel = null;
	protected ResourceResTaskModel resourceResTaskModel = null;
	protected TaskGroupSnapshot taskGroupSnapshot = null;
	protected SendToSlaveRes sendToSlaveRes = null;
	protected TaskRecord taskRecordGot = null;
	protected ErrorMessage errorMessage = null;
	protected CICache CI_cache = null;
	protected List<CICache> CICaches = null;

	/**
	 * 
	 * Task Result to-use
	 */
	// Models
	protected TaskRecord taskRecordForResult = null;
	protected List<CICache> CICacheList = null;
	protected TaskResultReqModel resultReqModel = null;

	/**
	 * Auto Task to-use
	 */
	// Models
	// For getCommitUser method to use
	protected TestGroupSelection testGroupForCIConfig = null;
	protected TaskRecord original_task = null;

	@Override
	public TaskRecord createTask(Object model) throws Throwable {
		throw new Exception("not impl");
	}

	@Override
	public String taskResult(TaskResultReqModel resultReqModel) throws Throwable {
		throw new Exception("not impl");
	}

	@Override
	public String taskStatus() throws Throwable {
		throw new Exception("not impl");
	}

	public InnerCommunicate getInnerCommunicate() {
		return innerCommunicate;
	}

	public void setInnerCommunicate(InnerCommunicate innerCommunicate) {
		this.innerCommunicate = innerCommunicate;
	}

	public TaskExecutor getTaskExecutor() {
		return taskExecutor;
	}

	public void setTaskExecutor(TaskExecutor taskExecutor) {
		this.taskExecutor = taskExecutor;
	}

	public Common getCommon() {
		return common;
	}

	public void setCommon(Common common) {
		this.common = common;
	}

	public Map<String, AtomActionService> getAtomActionMap() {
		return atomActionMap;
	}

	public void setAtomActionMap(Map<String, AtomActionService> atomActionMap) {
		this.atomActionMap = atomActionMap;
	}

	public TaskRecordService getTaskRecordService() {
		return taskRecordService;
	}

	public void setTaskRecordService(TaskRecordService taskRecordService) {
		this.taskRecordService = taskRecordService;
	}

	public ResourceService getResourceService() {
		return resourceService;
	}

	public void setResourceService(ResourceService resourceService) {
		this.resourceService = resourceService;
	}

	public CaseManagerService getCaseManagerService() {
		return caseManagerService;
	}

	public void setCaseManagerService(CaseManagerService caseManagerService) {
		this.caseManagerService = caseManagerService;
	}

	public CacheService getCacheService() {
		return cacheService;
	}

	public void setCacheService(CacheService cacheService) {
		this.cacheService = cacheService;
	}

	public TestGroupSelection getTestGroupSelection() {
		return testGroupSelection;
	}

	public void setTestGroupSelection(TestGroupSelection testGroupSelection) {
		this.testGroupSelection = testGroupSelection;
	}

	public TaskReqFromWebModel getTaskReqFromWebModel() {
		return taskReqFromWebModel;
	}

	public void setTaskReqFromWebModel(TaskReqFromWebModel taskReqFromWebModel) {
		this.taskReqFromWebModel = taskReqFromWebModel;
	}

	public ResourceResTaskModel getResourceResTaskModel() {
		return resourceResTaskModel;
	}

	public void setResourceResTaskModel(ResourceResTaskModel resourceResTaskModel) {
		this.resourceResTaskModel = resourceResTaskModel;
	}

	public TaskGroupSnapshot getTaskGroupSnapshot() {
		return taskGroupSnapshot;
	}

	public void setTaskGroupSnapshot(TaskGroupSnapshot taskGroupSnapshot) {
		this.taskGroupSnapshot = taskGroupSnapshot;
	}

	public SendToSlaveRes getSendToSlaveRes() {
		return sendToSlaveRes;
	}

	public void setSendToSlaveRes(SendToSlaveRes sendToSlaveRes) {
		this.sendToSlaveRes = sendToSlaveRes;
	}

	public TaskRecord getTaskRecordGot() {
		return taskRecordGot;
	}

	public void setTaskRecordGot(TaskRecord taskRecordGot) {
		this.taskRecordGot = taskRecordGot;
	}

	public ErrorMessage getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(ErrorMessage errorMessage) {
		this.errorMessage = errorMessage;
	}

	public CICache getCI_cache() {
		return CI_cache;
	}

	public void setCI_cache(CICache cI_cache) {
		CI_cache = cI_cache;
	}

	public List<CICache> getCICaches() {
		return CICaches;
	}

	public void setCICaches(List<CICache> cICaches) {
		CICaches = cICaches;
	}

	public TaskRecord getTaskRecordForResult() {
		return taskRecordForResult;
	}

	public void setTaskRecordForResult(TaskRecord taskRecordForResult) {
		this.taskRecordForResult = taskRecordForResult;
	}

	public List<CICache> getCICacheList() {
		return CICacheList;
	}

	public void setCICacheList(List<CICache> cICacheList) {
		CICacheList = cICacheList;
	}

	public TaskResultReqModel getResultReqModel() {
		return resultReqModel;
	}

	public void setResultReqModel(TaskResultReqModel resultReqModel) {
		this.resultReqModel = resultReqModel;
	}

	public TestGroupSelection getTestGroupForCIConfig() {
		return testGroupForCIConfig;
	}

	public void setTestGroupForCIConfig(TestGroupSelection testGroupForCIConfig) {
		this.testGroupForCIConfig = testGroupForCIConfig;
	}

	public TaskRecord getOriginal_task() {
		return original_task;
	}

	public void setOriginal_task(TaskRecord original_task) {
		this.original_task = original_task;
	}

}
