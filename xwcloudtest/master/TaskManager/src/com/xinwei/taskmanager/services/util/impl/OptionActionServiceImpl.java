package com.xinwei.taskmanager.services.util.impl;

import org.dom4j.Element;

import com.xinwei.taskmanager.model.dto.sub.Ftp;
import com.xinwei.taskmanager.services.util.AtomActionService;

public class OptionActionServiceImpl extends AtomAction implements AtomActionService {

	@Override
	public void atomAction(Object...objects) {
		Element atomActionXML = null;
		String value = "";
		for (Object object : objects) {
			if (object instanceof Element) {
				atomActionXML = (Element) object;
			} else if (object instanceof String) {
				value = (String) object;
			}
		}
		Element atom = atomActionXML.addElement("Property");
		atom.addAttribute("name", "Option");
		atom.addAttribute("value", value);
	}

}
