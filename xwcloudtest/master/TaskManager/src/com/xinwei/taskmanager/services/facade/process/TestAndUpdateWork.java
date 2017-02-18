package com.xinwei.taskmanager.services.facade.process;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.dom4j.Document;
import org.dom4j.DocumentFactory;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.XMLWriter;

import com.xinwei.taskmanager.model.TestCase;
import com.xinwei.taskmanager.model.dto.ErrorMessage;
import com.xinwei.taskmanager.model.dto.TaskGroupSnapshot;
import com.xinwei.taskmanager.model.dto.TaskReqFromWebModel;
import com.xinwei.taskmanager.model.dto.TestGroupSelection;
import com.xinwei.taskmanager.model.extra.Argv;
import com.xinwei.taskmanager.model.extra.ReportInfo;
import com.xinwei.taskmanager.model.extra.SequenceOfOpera;
import com.xinwei.taskmanager.model.rpcmodel.ResourceResTaskModel;
import com.xinwei.taskmanager.model.rpcmodel.SendToSlaveReq;
import com.xinwei.taskmanager.model.rpcmodel.SendToSlaveRes;
import com.xinwei.taskmanager.model.rpcmodel.sub.AccessInformation;
import com.xinwei.taskmanager.services.facade.impl.CreateTaskServiceImpl;
import com.xinwei.taskmanager.services.util.AtomActionService;
import com.xinwei.taskmanager.services.util.DBSetOptionParse;
import com.xinwei.uem.model.AbstractInnerMessage;
import com.xinwei.uem.util.Convert;

public class TestAndUpdateWork extends CreateTaskServiceImpl implements Runnable {

	public TestAndUpdateWork() {

	}

	public TestAndUpdateWork(TestGroupSelection testGroupSelection, TaskReqFromWebModel taskReqFromWebModel,
			ResourceResTaskModel resourceResTaskModel) {
		this.testGroupSelection = testGroupSelection;
		this.taskReqFromWebModel = taskReqFromWebModel;
		this.resourceResTaskModel = resourceResTaskModel;
		this.errorMessage = new ErrorMessage();
	}

	@Override
	public void run() {
		createTestFrameworkPara();
		createTestCasePara();
		sendTaskToSlave();
		String resource_snapshot = Convert.toJson(resourceResTaskModel);
		String task_id = String.valueOf(sendToSlaveRes.getTask_id());
		String task_key = resource_snapshot + task_id;
		String test_group = taskRecordGot.getTest_group();
		CICaches = cacheService.getCacheLog(task_key, test_group);
		CI_cache = CICaches.get(CICaches.size() - 1);
		if (CI_cache.getResult().equals("fail")) {
			taskFailupdateTaskRecord();
			logger.info("test task complete. result : ", CI_cache.getResult());
		} else if (CI_cache.getResult().equals("success")) {
			updateTaskRecord();
			logger.info("test task complete. result : ", CI_cache.getResult());
		}
		logger.info("done function. data : ",
				errorMessage != null ? errorMessage.toString() : taskRecordGot.toJson(taskRecordGot));
		if (taskRecordGot != null && taskRecordGot.getTask_type().equals("auto")) {
			cacheService.pushCITaskCache("ci_task_cache", taskRecordGot.toJson(taskRecordGot));
		}
	}

	public void createTestFrameworkPara() {
		logger.info("run create Test Framework Para start ");
		DocumentFactory factory = new DocumentFactory();
		Document document = factory.createDocument();
		// 根节点 InitConfig
		Element root = document.addElement("InitConfig");
		// 节点TaskDriver
		Element taskDriver = root.addElement("TaskDriver");
		taskDriver.addText("0");
		// 节点CurEnvironment
		Element curEnvironment = root.addElement("CurEnvironment");
		taskDriver.addText("0");
		if (!taskReqFromWebModel.getCode_path().isEmpty()) {
			// 节点Compile
			Element compile = root.addElement("Compile");
			compile.addAttribute("url", taskReqFromWebModel.getCode_path());
			compile.addAttribute("revision", taskReqFromWebModel.getRevision());
			compile.addAttribute("svn_user", testGroupSelection.getcIConfig().getSvn_user());
			compile.addAttribute("svn_password", testGroupSelection.getcIConfig().getSvn_password());
		}
		// 节点testTask
		Element testTask = root.addElement("TestTask");
		ReportInfo reportInfo = null;
		for (ReportInfo info : resourceResTaskModel.getReport_info()) {
			if (info.getMinor_id() == resourceResTaskModel.getMinor_id()) {
				reportInfo = info;
			}
		}
		String testGroupName = testGroupSelection.getTest_group().getName();
		// 节点testTask的次节点testCaseGroup
		Element testCaseGroup = testTask.addElement("TestCaseGroup");
		testCaseGroup.addAttribute("name", testGroupName);
		// 节点testTask的次节点EnbId
		Element enbId = testCaseGroup.addElement("EnbId");
		enbId.setText(String.valueOf(reportInfo.getEnbID()));

		taskGroupSnapshot = new TaskGroupSnapshot();
		taskGroupSnapshot.setName(testGroupName);
		taskGroupSnapshot.setType(testGroupSelection.getTest_group().getType());
		taskGroupSnapshot.setTestCases(testGroupSelection.getTest_group().getTestcase());
		for (TestCase testCase : taskGroupSnapshot.getTestCases()) {
			Element testcase = testCaseGroup.addElement("TestCase");
			testcase.addAttribute("name", testcase.getName());
			testcase.addAttribute("times", "1");
		}
		String XMLString = "";
		try {
			// 设置为缩减型格式
			OutputFormat xmlFormat = OutputFormat.createPrettyPrint();
			// 设置文件编码
			xmlFormat.setEncoding("UTF-8");
			// 设置换行
			xmlFormat.setNewlines(true);
			// 生成缩进
			xmlFormat.setIndent(true);
			// 使用两个空格进行缩进
			xmlFormat.setIndent("  ");
			XMLWriter xmlWriter = new XMLWriter(xmlFormat);
			xmlWriter.write(document);
			XMLString = document.asXML();
			xmlWriter.close();
		} catch (Exception e) {
			logger.error("Get error when write XML : " + e);
			errorMessage.getErrorList().add("Get error when write XML : " + e);
		}
		taskGroupSnapshot.setXML(XMLString);
	}

	public void createTestCasePara() {
		logger.info("run create Test Case Para start ");
		List<Integer> ids = null;
		AtomActionService atomActionService = null;
		for (TestCase testCase : taskGroupSnapshot.getTestCases()) {
			ids.add(testCase.getId());
		}
		List<TestCase> testCases = caseManagerService.findTestCaseByIds(ids);
		if (testCases == null || testCases.size() == 0) {
			logger.error("No testcases found");
			errorMessage.getErrorList().add("No testcases found");
			return;
		} else {
			taskGroupSnapshot.setTestCases(null);
			for (TestCase testCase : testCases) {
				DocumentFactory factory = new DocumentFactory();
				Document document = factory.createDocument();
				// 根节点 InitConfig
				Element root = document.addElement("TestCase");
				root.addAttribute("name", testCase.getName());
				root.addAttribute("tcg_name", taskGroupSnapshot.getName());
				// 节点SupportEnvironment
				Element supportEnvironment = root.addElement("SupportEnvironment");
				supportEnvironment.addText("0");
				for (SequenceOfOpera atomAction : testCase.getSequenceOfOpera()) {
					Element atomActionXML = root.addElement("AtomAction");
					atomActionXML.addAttribute("name", atomAction.getName());
					if (atomAction.getName().equals("LoadedVersion")
							&& (taskReqFromWebModel.getMeasured_object() == null
									|| taskReqFromWebModel.getMeasured_object().getFtp() == null)) {
						logger.info("No version was found");
						return;
					}
					if (atomAction.getName().equals("LoadedVersion")) {
						atomActionService = atomActionMap.get("LoadedVersion");
						atomActionService.atomAction(atomActionXML);
					}
					if (atomAction.getName().equals("EIDetail")) {
						atomActionService = atomActionMap.get("EIDetail");
						atomActionService.atomAction(atomActionXML);
					}
					for (Argv argv : atomAction.getArgv()) {
						logger.info("test case atom action Property : " + argv.toString());
						switch (argv.getName()) {
						case "EnbID":
							atomActionService = atomActionMap.get("EnbID");
							atomActionService.atomAction(atomActionXML, resourceResTaskModel.getReport_info());
							break;
						case "PDNIP":
							atomActionService = atomActionMap.get("PDNIP");
							atomActionService.atomAction(atomActionXML, resourceResTaskModel.getReport_info());
							break;
						case "VersionName":
							if (atomAction.getName().equals("LoadedVersion")
									|| atomAction.getName().equals("CheckVersion")) {
								atomActionService = atomActionMap.get("VersionName");
								atomActionService.atomAction(atomActionXML,
										taskReqFromWebModel.getMeasured_object().getFtp());
							}
							break;
						case "Option":
							if (atomAction.getName() == "SetDataBase" || atomAction.getName() == "ReConfigEnb") {
								try {
									DBSetOptionParse option = new DBSetOptionParse(argv.getValue());
									option.check();
									String value = option.getFinalJson();
									atomActionService = atomActionMap.get("Option");
									atomActionService.atomAction(atomActionXML, value);
								} catch (Exception e) {
									logger.error("db option error. " + e.getMessage());
									errorMessage.getErrorList().add("db option error. " + e.getMessage());
									;
								}
							}
							break;
						default:
							atomActionService = atomActionMap.get("Default");
							atomActionService.atomAction(atomActionXML, argv);
							break;
						}
					}
				}
				String XMLString = "";
				try {
					// 设置为缩减型格式
					OutputFormat xmlFormat = OutputFormat.createPrettyPrint();
					// 设置文件编码
					xmlFormat.setEncoding("UTF-8");
					// 设置换行
					xmlFormat.setNewlines(true);
					// 生成缩进
					xmlFormat.setIndent(true);
					// 使用两个空格进行缩进
					xmlFormat.setIndent("  ");
					XMLWriter xmlWriter = new XMLWriter(xmlFormat);
					xmlWriter.write(document);
					XMLString = document.asXML();
					xmlWriter.close();
				} catch (Exception e) {
					logger.error("Get error when write XML : " + e);
				}
				Map<String, String> testCaseMap = new HashMap<String, String>();
				testCaseMap.put(testCase.getName(), XMLString);
				taskGroupSnapshot.putAllTestCase(testCaseMap);
			}
		}

	}

	public void sendTaskToSlave() {
		logger.info("send Task To Slave start");
		AbstractInnerMessage paramReq = new AbstractInnerMessage();
		AbstractInnerMessage paramRes = null;
		AccessInformation accessInformation = new AccessInformation();
		accessInformation.setHostname(resourceResTaskModel.getHostname());
		accessInformation.setPort(resourceResTaskModel.getPort());
		accessInformation.setMethod("POST");
		accessInformation.setPath("/master/task");
		List<AccessInformation> accessInformations = new ArrayList<>();
		accessInformations.add(accessInformation);
		SendToSlaveReq sendToSlaveReq = new SendToSlaveReq();
		sendToSlaveReq.setAccessInformation(accessInformations);
		sendToSlaveReq.setData(taskRecordGot);
		String req = Convert.toJson(sendToSlaveReq);
		try {
			paramReq.setTarget("gateway");
			paramReq.setMessageId("sendTo slave");
			paramReq.setBody(req);
			paramRes = innerCommunicate.syncCallServices(paramReq);

		} catch (Throwable e) {
			logger.error("error update resource status");
			errorMessage.getErrorList().add("error update resource status");
		}
		String resResult = paramRes.getBody();
		sendToSlaveRes = (SendToSlaveRes) Convert.parserJson(resResult, SendToSlaveRes.class);
	}

	public void updateTaskRecord() {
		logger.info("update task record start ");
		String resource_snapshot = Convert.toJson(resourceResTaskModel.getReport_info());
		taskRecordGot.setResource_snapshot(resource_snapshot);
		taskRecordGot.setId(sendToSlaveRes.getTask_id());
		taskRecordGot.setResult(CI_cache.getResult());
		taskRecordGot.setLogs(CI_cache.getLogs());
		taskRecordService.updateTaskRecord(taskRecordGot);
	}

	public void taskFailupdateTaskRecord() {
		logger.info("task fail update task record start ");
		if (taskRecordGot != null && !String.valueOf(taskRecordGot.getId()).equals("")) {
			List<String> logs = new ArrayList<String>();
			taskRecordGot.setResult("fail");
			taskRecordGot.setStatus("close");
			taskRecordGot.setFail_message(errorMessage.getErrorList().toString() + ", " + CI_cache.getFail_message());
			logs.add(taskRecordGot.getFail_message());
			taskRecordGot.setLogs(logs);

			String resource_snapshot = Convert.toJson(resourceResTaskModel.getReport_info());
			taskRecordGot.setResource_snapshot(resource_snapshot);
			taskRecordGot.setId(sendToSlaveRes.getTask_id());
			// 更新task record
			taskRecordService.updateTaskRecord(taskRecordGot);

		}
	}
}