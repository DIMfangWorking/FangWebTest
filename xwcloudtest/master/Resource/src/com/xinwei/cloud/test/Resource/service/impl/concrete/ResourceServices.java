package com.xinwei.cloud.test.Resource.service.impl.concrete;

import org.slf4j.Logger;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.redis.core.RedisTemplate;

import com.xinwei.cloud.test.Resource.datamanipulation.MongodbDao;
import com.xinwei.cloud.test.Resource.model.ReportInfo;
import com.xinwei.cloud.test.Resource.model.Resource;
import com.xinwei.cloud.test.Resource.model.SubResource;
import com.xinwei.cloud.test.Resource.model.vo.ResourceReleaseResultModel;
import com.xinwei.cloud.test.Resource.model.vo.ResourceRequest;
import com.xinwei.cloud.test.Resource.model.vo.ResourceResTaskModel;
import com.xinwei.cloud.test.Resource.model.vo.TaskReqReleaseResourceModel;
import com.xinwei.cloud.test.Resource.model.vo.TaskReqResourceModel;
import com.xinwei.cloud.test.Resource.service.impl.AbstractResourceService;
import com.xinwei.uem.util.Convert;

public class ResourceServices extends AbstractResourceService {

	@Override
	public String alloc(ResourceRequest message) throws Throwable {
		return null;
/*		logger.info("alloc resource start ! ");
		TaskReqResourceModel taskreq = (TaskReqResourceModel)Convert.parserJson(message.getBody(),TaskReqResourceModel.class);
		if(taskreq.getType() == "simulation")
		{
			logger.info("run choose simulation resource start ");
			database.Resource.find({"type" : "simulation", "report_info.resource_type" : "auto", "report_info.status" : "idle"})
			Query query = new Query();
			query.addCriteria(Criteria.where("type").is("simulation"));
			query.addCriteria(Criteria.where("report_info.resource_type").is("auto"));
			query.addCriteria(Criteria.where("report_info.status").is("idle"));
			
			Resource resource = mongodbDao.findOne(query);
			ResourceResTaskModel taskresponse = null;
			if(resource ==null)
			{
				logger.info("no idel simulation resource ! ");
				taskresponse = new ResourceResTaskModel();
				taskresponse.setMajor_id(-1);
				
				String body = (String)Convert.toJson(taskresponse);
				return processMessage("resourceQueue","alloc Resource",body);
			}
			else
			{
				taskresponse = new ResourceResTaskModel();
				taskresponse.setCpu(resource.getCpu());
				taskresponse.setDesc(resource.getDesc());
				taskresponse.setHostname(resource.getHostname());
				taskresponse.setIp(resource.getIp());
				taskresponse.setMajor_id(resource.getMajor_id());
				taskresponse.setMem(resource.getMem());
			    taskresponse.setName(resource.getName());
			    taskresponse.setPlatfrom(resource.getPlatfrom());
			    taskresponse.setPort(resource.getPort());
			    taskresponse.setRegister_date(resource.getRegister_date());
			    taskresponse.setStatus(resource.getStatus());
			    taskresponse.setType(resource.getType());
			    taskresponse.setUptime(resource.getUptime());
			    for (ReportInfo reportinfo : resource.getReport_info()) {
					if(reportinfo.getStatus() == "idel")
					{
						taskresponse.setReport_info(reportinfo);
						break;
					}
				}
			    
				String body = (String)Convert.toJson(taskresponse);
				return processMessage("resourceQueue","alloc Resource",body);
			}
		}
		else
		{
			logger.info("run choose real resource start ");
			Query query = new Query();
			query.addCriteria(Criteria.where("type").is("real"));
			query.addCriteria(Criteria.where("type").is("real"));
			query.addCriteria(Criteria.where("report_info.resource_type").is("auto"));
			query.addCriteria(Criteria.where("report_info.status").is("idle"));
			
			Resource resource = mongodbDao.findOne(query);
			ResourceResTaskModel taskresponse = null;
			if(resource ==null)
			{
				logger.info("no idel real resource ! ");
				taskresponse = new ResourceResTaskModel();
				taskresponse.setMajor_id(-1);
				
				String body = (String)Convert.toJson(taskresponse);
				return processMessage("resourceQueue","alloc Resource",body);
			}
			else
			{
				taskresponse = new ResourceResTaskModel();
				taskresponse.setCpu(resource.getCpu());
				taskresponse.setDesc(resource.getDesc());
				taskresponse.setHostname(resource.getHostname());
				taskresponse.setIp(resource.getIp());
				taskresponse.setMajor_id(resource.getMajor_id());
				taskresponse.setMem(resource.getMem());
			    taskresponse.setName(resource.getName());
			    taskresponse.setPlatfrom(resource.getPlatfrom());
			    taskresponse.setPort(resource.getPort());
			    taskresponse.setRegister_date(resource.getRegister_date());
			    taskresponse.setStatus(resource.getStatus());
			    taskresponse.setType(resource.getType());
			    taskresponse.setUptime(resource.getUptime());
			    for (ReportInfo reportinfo : resource.getReport_info()) {
					if(reportinfo.getStatus() == "idel")
					{
						taskresponse.setReport_info(reportinfo);
						break;
					}
				}
			    
				String body = (String)Convert.toJson(taskresponse);
				return processMessage("resourceQueue","alloc Resource",body);
			}
		}*/
	}

	@Override
	public String release(ResourceRequest message) throws Throwable {
		return null;
		/*logger.info("release resource start ! ");
		TaskReqReleaseResourceModel taskrelease = (TaskReqReleaseResourceModel)Convert.parserJson(message.getBody(), TaskReqReleaseResourceModel.class);
		Resource resource = mongodbDao.findById(taskrelease.getMajor_id());
		ResourceReleaseResultModel rel_res_model = null;
		if(resource == null)
		{
			logger.info("no find this real resource in mondodb !");
			rel_res_model =  new ResourceReleaseResultModel();
			rel_res_model.setResult("fail");
			String body = (String)Convert.toJson(rel_res_model);
			return processMessage("resourceQueue","release Resource",body);
		}
		else
		{
            if (resource.getStatus() == "lost")
            {
            	logger.info("resource status is lost !");
    			rel_res_model =  new ResourceReleaseResultModel();
    			rel_res_model.setResult("success");
    			String body = (String)Convert.toJson(rel_res_model);
    			return processMessage("resourceQueue","release Resource",body);
            }
			if(resource.getType() == "simulation")
			{
				logger.info("update sim resource status start ");
				int index = 0;
			    for(index = 0; index < (resource.getReport_info()).size(); index++)
			    {
			        if ((resource.getReport_info()).get(index).getMinor_id() == taskrelease.getMinor_id())
			        {
			            break;
			        }
			    }
			    if (index >= (resource.getReport_info()).size())
			    {
			        logger.info("not found resource. ");
			        rel_res_model =  new ResourceReleaseResultModel();
	    			rel_res_model.setResult("fail");
	    			String body = (String)Convert.toJson(rel_res_model);
	    			return processMessage("resourceQueue","release Resource",body);
			    }
			    else
			    {
			        if ((resource.getReport_info()).get(index).getStatus() != "busy")
			        {
			            logger.info("resource status is " + (resource.getReport_info()).get(index).getStatus());
		    			rel_res_model.setResult("success");
		    			String body = (String)Convert.toJson(rel_res_model);
		    			return processMessage("resourceQueue","release Resource",body);
			        }
			        else
			        {
			        	(resource.getReport_info()).get(index).setStatus("idel");
			        	mongodbDao.update(resource);
			        	
		    			rel_res_model.setResult("success");
		    			String body = (String)Convert.toJson(rel_res_model);
		    			return processMessage("resourceQueue","release Resource",body);
			        }
			    }
			}
			else
			{
				logger.info("update real resource status start ");
			    if ((resource.getReport_info()).get(0).getStatus() != "busy")
			    {
		            logger.info("resource bbu status is " + (resource.getReport_info()).get(0).getStatus());
			    }
			    else
			    {
			    	
			    	for(int subResIndx=0;subResIndx < (resource.getReport_info()).size();subResIndx++ ){
			    		(resource.getReport_info()).get(subResIndx).setStatus("idel");
			        }
			    }
    			rel_res_model.setResult("success");
    			String body = (String)Convert.toJson(rel_res_model);
    			return processMessage("resourceQueue","release Resource",body);
			}
		}*/
	}

}
