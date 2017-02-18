package com.xinwei.cloud.test.Resource;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Server {
	@SuppressWarnings("resource")
	public static void main(String[] args) {
		ClassPathXmlApplicationContext ac = new ClassPathXmlApplicationContext(
				"classpath:resource/applicationContext.xml");
		ac.start();
	}
}