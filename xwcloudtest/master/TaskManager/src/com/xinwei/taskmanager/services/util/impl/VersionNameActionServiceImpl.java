package com.xinwei.taskmanager.services.util.impl;

import org.dom4j.Element;

import com.xinwei.taskmanager.model.dto.sub.Ftp;
import com.xinwei.taskmanager.services.util.AtomActionService;

public class VersionNameActionServiceImpl extends AtomAction implements AtomActionService {

	@Override
	public void atomAction(Object... objects) {
		Element atomActionXML = null;
		Ftp ftp = null;
		for (Object object : objects) {
			if (object instanceof Element) {
				atomActionXML = (Element) object;
			} else if (object instanceof Ftp) {
				ftp = (Ftp) object;
			}
		}
		Element atom = atomActionXML.addElement("Property");
		atom.addAttribute("name", "EnbID");
		atom.addAttribute("value", ftp.getOriginal());
	}

}
