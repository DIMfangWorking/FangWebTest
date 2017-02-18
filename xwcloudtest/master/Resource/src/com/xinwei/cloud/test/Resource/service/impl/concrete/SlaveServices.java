package com.xinwei.cloud.test.Resource.service.impl.concrete;

import java.util.List;

import org.slf4j.Logger;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.redis.core.RedisTemplate;

import com.xinwei.cloud.test.Resource.datamanipulation.MongodbDao;
import com.xinwei.cloud.test.Resource.model.Resource;
import com.xinwei.cloud.test.Resource.model.SubResource;
import com.xinwei.cloud.test.Resource.model.vo.ResourceResTaskModel;
import com.xinwei.cloud.test.Resource.model.vo.SlaveReport;
import com.xinwei.cloud.test.Resource.service.impl.AbstractSlaveService;
import com.xinwei.uem.util.Convert;

public class SlaveServices extends AbstractSlaveService {
	
	public String process(SlaveReport sp) throws Throwable {
/*		Resource resource = (Resource) Convert.parserJson(message.getBody(), Resource.class);
		Query query = new Query();
		query.addCriteria(Criteria.where("ip").is(resource.getIp()));
		Resource res = mongodbDao.findOne(query);
		if (res == null) {
			logger.info("new slave config");
		} else {
			logger.info("slave online and update config");
			res.setCpu(resource.getCpu());
			res.setHostname(resource.getHostname());
			res.setMem(resource.getMem());
			res.setName(resource.getName());
			res.setPlatfrom(resource.getPlatfrom());
			res.setPort(resource.getPort());
			res.setStatus(resource.getStatus());
			res.setUptime(resource.getUptime());

			List<SubResource> sub_resource = res.getSub_resource();
			if (res.getType() == "real") {

			}

		}*/
		return null;
	}
	
	@Override
	public String online(SlaveReport sp) throws Throwable {
		return process(sp);
	}

	@Override
	public String beatheart(SlaveReport sp) throws Throwable {
		return process(sp);
	}
}
