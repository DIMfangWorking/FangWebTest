package com.xinwei.taskmanager.dao;

import java.util.List;

import com.xinwei.taskmanager.model.KeyWord;

public interface KeyWordDao {
	void insert(KeyWord keyWord);

	void insertAll(List<KeyWord> keyWord);

	void deleteById(int id);

	void delete(KeyWord keyWord);

	void deleteAll();

	void updateById(KeyWord keyWord);

	void update(KeyWord keyWord);

	KeyWord findById(int id);

	List<KeyWord> findAll();

	List<KeyWord> find();

	long count();
}