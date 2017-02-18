global.test_config = {
  module_path : "../../../xwcloudtest/"
};

global.require_module = function (module_name){
  return require(test_config.module_path + module_name);
}