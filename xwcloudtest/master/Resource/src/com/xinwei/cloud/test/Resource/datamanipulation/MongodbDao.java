package com.xinwei.cloud.test.Resource.datamanipulation;

import java.util.List;

import org.springframework.data.mongodb.core.query.Query;

import com.xinwei.cloud.test.Resource.model.Resource;

public interface MongodbDao {
	
	void insert(Resource resource);
	void insertAll(List<Resource> resource);
	void deleteById(int majorId);
	void delete(Resource resource);
	void deleteAll();
	void updateById(Resource resource);
	void update(Resource resource);

	Resource findById(int majorId);	
	Resource findOne(Query query);	
	List<Resource> findAll();
	List<Resource> find();
	
	long count();

}
