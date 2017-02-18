package com.xinwei.cloud.test.Resource.action;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

import org.slf4j.Logger;

import com.xinwei.cloud.test.Resource.model.vo.SlaveResult;
import com.xinwei.uem.model.AbstractInnerMessage;
import com.xinwei.uem.util.Convert;

@SuppressWarnings("unchecked")
public abstract class AbstractAction<T, S> implements ActionInterface<AbstractInnerMessage> {
	private Class<T> clazz;

	protected static Logger logger = null;
	protected S services = null;

	public AbstractAction() {
		super();
		Type superClazz = (Type) getClass().getGenericSuperclass();
		clazz = (Class<T>) (((ParameterizedType) superClazz).getActualTypeArguments()[0]);
	}

	public S getService() {
		return services;
	}

	public void setService(S services) {
		this.services = services;
	}

	@Override
	public AbstractInnerMessage action(AbstractInnerMessage message) throws Throwable {
		SlaveResult r = new SlaveResult();

		T opt = (T) Convert.parserJson(message.getBody(), clazz);

		String result = process(opt);
		try {
			r.slave_id = Integer.parseInt(result);
			r.result = 0;
			r.message = "success";
		} catch (Throwable t) {
			r.slave_id = 0;
			r.result = -1;
			r.message = result;
		}

		AbstractInnerMessage rsp = new AbstractInnerMessage();

		rsp.setMessageId("reply");
		rsp.setBody(Convert.toJson(r));

		return rsp;
	}

	public abstract String process(T opt) throws Throwable;
}