package com.xinwei.taskmanager.services.util.impl;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.dom4j.Element;

import com.xinwei.taskmanager.model.EIDetailed;
import com.xinwei.taskmanager.services.util.AtomActionService;

public class EIDetailActionServiceImpl extends AtomAction implements AtomActionService {

	@Override
	public void atomAction(Object... objects) {
		if (objects.length == 1) {
			Element atomActionXml = (Element) objects[0];
			List<EIDetailed> eiDetaileds = caseManagerService.getEIDetailed();
			for (EIDetailed eiDetailed : eiDetaileds) {
				Element atom = atomActionXml.addElement("Property");
				atom.addAttribute("name", "msg");
				atom.addAttribute("msg", String.valueOf(eiDetailed.getMsgId()));
				atom.addAttribute("DspId", String.valueOf(eiDetailed.getDspId()));
				atom.addAttribute("CoreId", String.valueOf(eiDetailed.getCoreId()));
				Map TlvMap = (Map) eiDetailed.getTlv();
				Map TlvMapInside = (Map) TlvMap.get("Tlv");
				Iterator entries = TlvMapInside.entrySet().iterator();
				while (entries.hasNext()) {
					Map.Entry entry = (Entry) entries.next();
					Element tlv = atom.addElement("tlv");
					tlv.addAttribute("id", String.valueOf(entry.getKey()));
					Map TlvMapInside1 = (Map) entry.getValue();
					tlv.addAttribute("name", String.valueOf(TlvMapInside1.get("name")));
				}
			}
		}
	}

}
