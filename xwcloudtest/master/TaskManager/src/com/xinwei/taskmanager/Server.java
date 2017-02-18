package com.xinwei.taskmanager;

import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Server {
	public static void main(String[] args) {
		ClassPathXmlApplicationContext ac = new ClassPathXmlApplicationContext(
				"classpath:resource/applicationContext.xml");
		ac.start();
	}
}