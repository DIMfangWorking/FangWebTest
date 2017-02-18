package com.xinwei.taskmanager;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.slf4j.Logger;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class ConfigParser {
	private String configFileName = null;
	private Map<String, Object> config = null;
	
	private static Logger logger = null;

	public ConfigParser(String configFileName) throws Exception {
		super();

		config = new HashMap<String, Object>();

		logger.info("start parser config file " + configFileName);
		
		this.configFileName = configFileName;

		// connect default value
		config.put("type", "Udp");
		config.put("ip", "0.0.0.0");
		config.put("port", "3346");
		
		this.parserConfig();
	}

	private void parserConfig() throws ParserConfigurationException,
			SAXException, IOException {		
		DocumentBuilder bunilder = DocumentBuilderFactory.newInstance()
				.newDocumentBuilder();
		Document doc = bunilder.parse(new File(configFileName));

		Element root = doc.getDocumentElement();

		NodeList nl = root.getChildNodes();
		for (int i = 0; i < nl.getLength(); i++) {
			Node node = nl.item(i);
			if ("#text".equals(node.getNodeName())) {
				continue;
			}
			config.put(node.getNodeName(), this.parserSubElement(node));
		}
	}

	private Map<String, Object> parserSubElement(Node node)
			throws ParserConfigurationException {
		Map<String, Object> mapConfig = new HashMap<String, Object>();

		if (node.hasChildNodes()) {
			NodeList nl = node.getChildNodes();
			for (int i = 0; i < nl.getLength(); i++) {
				Node subNode = nl.item(i);
				mapConfig.put(subNode.getNodeName(),
						this.parserSubElement(subNode));
			}
		} else {
			String value = node.getNodeValue();
			// System.out.println(node.getNodeName() + " " + node.getNodeValue());
			if (null != value && "".equals(value.trim())) {
				mapConfig.put("@Value", value);
			}
		}

		if (node.hasAttributes()) {
			NamedNodeMap nnm = node.getAttributes();

			for (int i = 0; i < nnm.getLength(); i++) {
				Node tmp = nnm.item(i);
				mapConfig.put(tmp.getNodeName(), tmp.getNodeValue());
			}
		}
		return mapConfig;
	}

	public Map<String, Object> getConfig() {
		return config;
	}
}