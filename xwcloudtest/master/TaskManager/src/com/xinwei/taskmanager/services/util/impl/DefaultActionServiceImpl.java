package com.xinwei.taskmanager.services.util.impl;

import org.dom4j.Element;

import com.xinwei.taskmanager.model.extra.Argv;
import com.xinwei.taskmanager.services.util.AtomActionService;

public class DefaultActionServiceImpl extends AtomAction implements AtomActionService {

	@Override
	public void atomAction(Object...objects) {
		Element atomActionXML = null;
		Argv argv = null;
		for (Object object : objects) {
			if (object instanceof Element) {
				atomActionXML = (Element) object;
			} else if (object instanceof Argv) {
				argv = (Argv) object;
			}
		}
		Element atom = atomActionXML.addElement("Property");
		atom.addAttribute("name", argv.getName());
		atom.addAttribute("value", argv.getValue());
	}

}
