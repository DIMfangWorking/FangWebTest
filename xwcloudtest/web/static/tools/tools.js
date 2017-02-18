$(function() {
    $('#request').on('click', function (){
        var requestMethod = $('#method').val();
        var urlpara = $('#url').val();
        var jsonData = $('#data').val();
        var type = $('#type').val();

        var contentTypeStr = 'application/x-www-form-urlencoded;charset=utf-8';

        if (urlpara === '')
        {
            alert('URL is null');
            return ;
        }

        if (type === 'JSON')
        {
            //jsonData = JSON.parse(jsonData);
            contentTypeStr = 'application/json; charset=UTF-8';
        }

        function process(html)
        {
            if (html instanceof Object)
            {
                //var data = JSON.parse(html);
                $('#result').val(JSON.stringify(html,null,4));
            }
            else
            {
                $('#result').val(html);
            }
        }

        $.ajax({  
              type: requestMethod,
              url: urlpara,
              cache: false,
              dataType: 'json',
              contentType: contentTypeStr,
              data:jsonData,
              ajaxError:process,
              error:process,
              success: process
           });
    });
});