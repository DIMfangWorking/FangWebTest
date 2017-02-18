package com.xinwei.taskmanager.services.util;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xinwei.taskmanager.services.util.model.Arguments;
import com.xinwei.taskmanager.services.util.model.Callee;
import com.xinwei.taskmanager.services.util.model.FinalParseResult;
import com.xinwei.taskmanager.services.util.model.JavaScriptObject;
import com.xinwei.taskmanager.services.util.model.Option;
import com.xinwei.taskmanager.services.util.model.Properties;

@SuppressWarnings("all")
public class DBSetOptionParse {

	private Map<Object, List> option;
	private Object table;
	private String finalJson;
	private FinalParseResult finalParseResult;
	JavaScriptObject javaScriptObject = null;

	private String readFile(String fileName) throws IOException, FileNotFoundException {

		return new String(Files.readAllBytes(Paths.get(fileName)), StandardCharsets.UTF_8);
	}

	public DBSetOptionParse(String code) {
		try {
			if (finalParseResult == null) {
				finalParseResult = getFinalParseResult();
			}
			option = new LinkedHashMap<>();
			nashorn(code);
		} catch (NoSuchMethodException | ScriptException | IOException e) {
			e.printStackTrace();
		}
	}

	private void nashorn(String code) throws ScriptException, NoSuchMethodException, IOException {
		String parser = readFile("src/resource/javascript/esprima.js");
		ScriptEngineManager factory = new ScriptEngineManager();
		ScriptEngine engine = factory.getEngineByName("JavaScript");
		// 加载JS词法解析器esprima.js
		engine.eval(parser);
		Invocable inv = (Invocable) engine;
		Object esprima = engine.get("esprima");
		Object tree = new Object();
		// 用esprima中parse方法解析JS code
		tree = inv.invokeMethod(esprima, "parse", code);
		ObjectMapper mapper = new ObjectMapper();
		// 解析成JSON字符串
		String treeObj = mapper.writeValueAsString(tree);
		// System.out.println(treeObj);
		// 将解析出的JS词法的JSON字符串转成JAVA对象
		javaScriptObject = mapper.readValue(treeObj, JavaScriptObject.class);
		// 找到表头;譬如ipv4.find(),表头为ipv4
		deepProcess(javaScriptObject.getBody().get("0").getExpression().getCallee());
		// obj.body[0].expression.callee.property.name
		Object methodName = javaScriptObject.getBody().get("0").getExpression().getCallee().getProperty().getName();
		LinkedHashMap arguments = (LinkedHashMap) javaScriptObject.getBody().get("0").getExpression().getArguments();
		option.put(methodName, deepArguments(arguments));
		System.err.println(option);
		// 解析Option中数据为Json格式
		String optionsJson = "\"option\":" + "[" + processOptionToJson(option) + "]";
		// 拼接整个表达式：表头+option
		String tableJson = "\"table\":" + "\"" + table + "\"";
		finalJson = "{" + tableJson + "," + optionsJson + "}";
		System.err.println(finalJson);
		finalParseResult = mapper.readValue(finalJson, finalParseResult.getClass());
		check();
	}

	public void check() {
		for (Option option : finalParseResult.getOption()) {
			switch (option.getName()) {
			case "insert":
			case "save":
			case "update":
			case "overwrite":
			case "remove":
			case "delete":
			case "find":
			case "select":
				break;
			default:
				throw new Error("not suport option " + option.getName());
			}
		}
	}

	private String processOptionToJson(Map<Object, List> optionMap) throws JsonProcessingException {
		ObjectMapper mapper = new ObjectMapper();
		StringBuilder finalJsonBuilder = new StringBuilder();
		int sizeOfoptionMap = optionMap.size();
		int countOptionIterator = 0;
		Iterator iterator = optionMap.entrySet().iterator();
		while (iterator.hasNext()) {
			countOptionIterator++;
			Entry entry = (Entry) iterator.next();
			String name = (String) entry.getKey();
			List argumentsList = (List) entry.getValue();
			int sizeOfArgumentsList = argumentsList.size();
			Iterator argumentsListIterator = argumentsList.iterator();
			String firstLevelArgumentsJson = "";
			StringBuilder argumentsBuilder = new StringBuilder();
			String deepString = "";
			int countArgumentsIterator = 0;
			if (!argumentsListIterator.hasNext()) {
				String nameJson = "{\"name\":" + "\"" + name + "\"" + ",";
				finalJsonBuilder.append(nameJson);
				String argumentsTemp = "\"arguments\":" + "[" + argumentsBuilder.toString() + "]";
				finalJsonBuilder.append(argumentsTemp);
				if (countOptionIterator == sizeOfoptionMap) {
					finalJsonBuilder.append("}");
					continue;
				} else {
					finalJsonBuilder.append("}").append(",");
					continue;
				}
			}
			while (argumentsListIterator.hasNext()) {
				countArgumentsIterator++;
				Map argumentsMap = (Map) argumentsListIterator.next();
				Iterator argumentIterator = argumentsMap.entrySet().iterator();
				int sizeOfArgumentsMap = argumentsMap.size();
				int countOfArgumentsMap = 0;
				while (argumentIterator.hasNext()) {
					countOfArgumentsMap++;
					Entry argumentEntry = (Entry) argumentIterator.next();

					if (argumentEntry.getValue() instanceof Map) {
						deepString += argumentMapLogic(
								argumentEntry.getKey() + "\"" + ":"
										+ parseDeepArgumentsMap((Map) argumentEntry.getValue()),
								countOfArgumentsMap, sizeOfArgumentsMap);

					} else {
						String argumentsKey = (String) argumentEntry.getKey();
						String argumentsValue = String.valueOf(argumentEntry.getValue());
						firstLevelArgumentsJson += argumentMapLogic(argumentsKey + "\"" + ":" + argumentsValue,
								countOfArgumentsMap, sizeOfArgumentsMap);
					}
					if (deepString.length() != 0 && countOfArgumentsMap == sizeOfArgumentsMap) {
						argumentsBuilder.append(deepString);
					} else if (firstLevelArgumentsJson.length() != 0 && countOfArgumentsMap == sizeOfArgumentsMap) {
						argumentsBuilder.append(firstLevelArgumentsJson).append(",");
						continue;
					}
				}
			}
			if (countOptionIterator == sizeOfoptionMap) {
				String argumentsTemp = "\"arguments\":" + "[" + argumentsBuilder.toString() + "]";
				String nameJson = "{\"name\":" + "\"" + name + "\"" + ",";
				finalJsonBuilder.append(nameJson);
				finalJsonBuilder.append(argumentsTemp).append("}");
			} else {
				String argumentsTemp = "\"arguments\":" + "[" + argumentsBuilder.toString() + "]";
				String nameJson = "{\"name\":" + "\"" + name + "\"" + ",";
				finalJsonBuilder.append(nameJson);
				finalJsonBuilder.append(argumentsTemp).append("}").append(",");
			}
		}

		System.out.println("options是:" + finalJsonBuilder.toString());
		return finalJsonBuilder.toString();
	}

	public String argumentMapLogic(String demandString, int countOfArgumentsMap, int sizeOfArgumentsMap) {
		String result = "";
		if (countOfArgumentsMap == sizeOfArgumentsMap) {
			if (sizeOfArgumentsMap == 1) {
				result = "{\"" + demandString + "}";
			} else {
				result = "\"" + demandString + "}";
			}
		} else if (countOfArgumentsMap == 1) {
			result = "{\"" + demandString + ",";
		} else {
			result = "\"" + demandString + ",";
		}
		return result;
	}

	private String parseDeepArgumentsMap(Map argumentsMap) {
		String argumentsJson = "";
		String deepString = "";
		Iterator argumentsIterator = argumentsMap.entrySet().iterator();
		while (argumentsIterator.hasNext()) {
			Entry tempEntry = (Entry) argumentsIterator.next();
			if (tempEntry.getValue() instanceof Map) {
				deepString = "\"" + tempEntry.getKey() + "\"" + ":" + parseDeepArgumentsMap((Map) tempEntry.getValue());
			} else {
				String argumentsKey = (String) tempEntry.getKey();
				String argumentsValue = String.valueOf(tempEntry.getValue());
				argumentsJson = "{\"" + argumentsKey + "\"" + ":" + argumentsValue + "}";
				return argumentsJson;
			}
		}
		return "{" + deepString + "}";
	}

	private List deepArguments(LinkedHashMap arguments) {
		List<Map> list = new ArrayList<>();
		Iterator iterator = arguments.entrySet().iterator();
		while (iterator.hasNext()) {
			Entry entry = (Entry) iterator.next();
			if (entry.getValue() instanceof Arguments) {
				if (!((Arguments) entry.getValue()).getType().equals("ObjectExpression")) {
					try {
						throw new Throwable("Arguments error. must be object");
					} catch (Throwable e) {
						e.printStackTrace();
					}
				}
				list.add(deepArgumentItem((Arguments) entry.getValue()));
			} else {
				if (!((Map) entry.getValue()).get("type").equals("ObjectExpression")) {
					try {
						throw new Throwable("Arguments error. must be object");
					} catch (Throwable e) {
						e.printStackTrace();
					}
				}
				list.add(deepArgumentItem((LinkedHashMap<Object, Map>) entry.getValue()));
			}
		}
		return list;
	}

	private Map deepArgumentItem(Arguments arguments) {
		Map result = new LinkedHashMap<>();
		for (int i = 0; i < arguments.getProperties().size(); i++) {
			Properties properties = arguments.getProperties().get(String.valueOf(i));
			Object name = properties.getKey().getName();
			if (properties.getValue().getType().equals("Literal")) {
				result.put(name, properties.getValue().getValue());

			} else if (properties.getValue().getType().equals("ObjectExpression")) {
				result.put(name, processProperties(properties.getValue().getProperties()));
			}
		}
		return result;
	}

	private Map processProperties(Map<Object, Properties> map) {
		Map result = new LinkedHashMap<>();
		if (map.get("0") != null) {
			Properties properties = map.get("0");
			Object name = properties.getKey().getName();
			if (properties.getValue().getType().equals("Literal")) {
				result.put(name, properties.getValue().getValue());
			} else if (properties.getValue().getType().equals("ObjectExpression")) {
				result.put(name, processProperties(properties.getValue().getProperties()));
			}
		}
		return result;
	}

	private Map deepArgumentItem(LinkedHashMap<Object, Map> arguments) {
		Map result = new LinkedHashMap<>();
		for (Entry entry : arguments.entrySet()) {
			if (entry.getValue().equals("ObjectExpression")) {
				continue;
			}
			if (entry.getValue() instanceof Map) {
				result.putAll(processMap((LinkedHashMap) entry.getValue()));
			}

		}
		return result;
	}

	private Map processMap(LinkedHashMap map) {
		Map result = new LinkedHashMap<>();
		if (map.get("0") != null) {
			Map tempMap = (Map) map.get("0");
			Map key = (Map) tempMap.get("key");
			Map value = (Map) tempMap.get("value");
			if (value.get("type").equals("Literal")) {
				result.put(key.get("name"), value.get("value"));
			} else if (value.get("type").equals("ObjectExpression")) {
				result.put(key.get("name"), processMap((LinkedHashMap) value.get("properties")));
			}
		}
		// System.out.println("result : " + result);
		return result;
	}

	public void deepProcess(Callee callee) {
		if (callee.getObject() != null) {
			if (callee.getObject().getName() != null) {
				System.out.println("表头是 : " + callee.getObject().getName());
				table = callee.getObject().getName();
				return;
			} else if (callee.getObject().getCallee() != null) {
				deepProcess(callee.getObject().getCallee());
				Object key = callee.getObject().getCallee().getProperty().getName();
				option.put(key, deepArguments((LinkedHashMap) callee.getObject().getArguments()));
				/*
				 * self.option.push({name : obj.object.callee.property.name ,
				 * arguments : deepArguments(obj.object.arguments)});
				 */
			}
		} else {
			try {
				throw new Throwable("The Callee is " + callee);
			} catch (Throwable e) {
				e.getMessage();
			}
		}
	}

	public static void main(String[] args) {
		try {

			String code = "at.find().update({a:1,g:12,z:26},{$set:{b:{r:5}},$get:{j:{k:5}}}).select({c:3},{d:{e:{t:6}}})";
			// String code = "at.b({a:1},{$set:{b:2}}).c()";
			// String code = "at.b(d.e()).c()"; //not support
			// String code = "at.b({a:1},{$set:{b:{c:2}}}).c()";
			// String code = "at.b(1).c()";//not support
			// String code = "at.b().c().d()";
			// String code = "at.b()";
			DBSetOptionParse dbSetOptionParse = new DBSetOptionParse(code);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public Map<Object, List> getOption() {
		return option;
	}

	public void setOption(Map<Object, List> option) {
		this.option = option;
	}

	public Object getTable() {
		return table;
	}

	public void setTable(Object table) {
		this.table = table;
	}

	public FinalParseResult getFinalParseResult() {
		return new FinalParseResult();
	}

	public void setFinalParseResult(FinalParseResult finalParseResult) {
		this.finalParseResult = finalParseResult;
	}

	public String getFinalJson() {
		return finalJson;
	}

	public void setFinalJson(String finalJson) {
		this.finalJson = finalJson;
	}
}