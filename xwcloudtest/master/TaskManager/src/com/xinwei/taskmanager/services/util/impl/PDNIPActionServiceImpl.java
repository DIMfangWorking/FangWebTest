package com.xinwei.taskmanager.services.util.impl;

import org.dom4j.Element;

import com.xinwei.taskmanager.model.extra.ReportInfo;
import com.xinwei.taskmanager.services.util.AtomActionService;

public class PDNIPActionServiceImpl extends AtomAction implements AtomActionService {

	@Override
	public void atomAction(Object...objects) {
		Element atomActionXML = null;
		ReportInfo reportInfo = null;
		for (Object object : objects) {
			if (object instanceof Element) {
				atomActionXML = (Element) object;
			} else if (object instanceof ReportInfo) {
				reportInfo = (ReportInfo) object;
			}
		}
		Element atom = atomActionXML.addElement("Property");
		atom.addAttribute("name", "PDNIP");
		atom.addAttribute("value", String.valueOf(reportInfo.getPdnip()));
		
	}

}
