package com.xinwei.taskmanager.services.facade.process;

import org.tmatesoft.svn.core.ISVNLogEntryHandler;
import org.tmatesoft.svn.core.SVNException;
import org.tmatesoft.svn.core.SVNLogEntry;
import org.tmatesoft.svn.core.SVNURL;
import org.tmatesoft.svn.core.auth.ISVNAuthenticationManager;
import org.tmatesoft.svn.core.io.SVNRepository;
import org.tmatesoft.svn.core.io.SVNRepositoryFactory;
import org.tmatesoft.svn.core.wc.SVNWCUtil;

import com.xinwei.taskmanager.model.TaskRecord;
import com.xinwei.taskmanager.model.rpcmodel.CreateAutoTaskModel;
import com.xinwei.taskmanager.services.facade.impl.CreateTaskServiceImpl;

public class AutoTask extends CreateTaskServiceImpl implements Runnable {

	@Override
	public void run() {

	}

	public AutoTask() {

	}

	public TaskRecord getRerunTaskInfo(Object task) {
		int original_id = -1;
		CreateAutoTaskModel autoTaskModel = null;
		if (task instanceof Integer) {
			original_id = (int) task;
			return taskRecordService.getTaskById(original_id);
		} else if (task instanceof CreateAutoTaskModel) {
			autoTaskModel = (CreateAutoTaskModel) task;
			TaskRecord taskRecord = common.saveRecordOfTask(autoTaskModel);
			return taskRecord;
		}
		return null;

	}

	public void getCommitUser() {
		String svn_user = testGroupForCIConfig.getcIConfig().getSvn_user();
		String svn_password = testGroupForCIConfig.getcIConfig().getSvn_password();
		int revision = Integer.parseInt(original_task.getRevision());
		String code_path = original_task.getCode_path();
		try {

			SVNRepository repository = SVNRepositoryFactory.create(SVNURL.parseURIDecoded(code_path));
			ISVNAuthenticationManager authManager = SVNWCUtil.createDefaultAuthenticationManager(svn_user,
					svn_password);
			repository.setAuthenticationManager(authManager);
			repository.log(null, revision, revision, false, false, new ISVNLogEntryHandler() {
				@Override
				public void handleLogEntry(SVNLogEntry logEntry) throws SVNException {
					System.out.println(logEntry.getAuthor());
					original_task.setUser(logEntry.getAuthor());
				}
			});
		} catch (SVNException e) {
			logger.info("Cannot find the author, plz make sure some actions you made");
			e.printStackTrace();
		}
	}

	public static void main(String[] args) {
		try {
			String code_path = "http://172.31.2.28:18080/svn/CloudTest";
			String svn_user = "zhangfang";
			String svn_password = "xw123...";
			SVNRepository repository = SVNRepositoryFactory.create(SVNURL.parseURIDecoded(code_path));
			ISVNAuthenticationManager authManager = SVNWCUtil.createDefaultAuthenticationManager(svn_user,
					svn_password);
			repository.setAuthenticationManager(authManager);
			repository.log(null, 712, 712, false, false, new ISVNLogEntryHandler() {

				@Override
				public void handleLogEntry(SVNLogEntry logEntry) throws SVNException {
					System.out.println(logEntry.getAuthor());
				}
			});
			
		} catch (SVNException e) {
			e.printStackTrace();
		}
	}
}
