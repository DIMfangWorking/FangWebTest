package com.xinwei.cloud.test.Resource.service;

import com.xinwei.cloud.test.Resource.model.vo.ResourceRequest;

public interface ResourceService {
	String alloc(ResourceRequest message) throws Throwable ;
	String release(ResourceRequest message) throws Throwable ;
}
