

requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
        obj:"../Object",
        common:"../common",
        ui:"../UI"
    },
    shim: {
        jquery_fileupload: {
            deps: ['jquery', 'jquery.ui.widget', 'jquery_iframe-transport']
        },
        jquery_cookie: {
            deps: ['jquery']
        },
        jquery_validate: {
            deps: ['jquery']
        },
        jquery_getParams: {
            deps: ['jquery']
        },
        jquery_ui: {
            deps: ['jquery']
        },
        bootstrap_editable: {
            deps: ['jquery','jquery_ui']
        },
        colResizable:{
            deps: ['jquery']
        },
        highcharts:{
            deps: ['jquery']
        },
        sand_signika:{
            deps: ['highcharts']
        },
        TimeCircles:{
            deps: ['jquery']
        },
        bootstrap_notify:{
            deps: ['jquery']
        },
        jquery_mousewheel:{
            deps: ['jquery']
        },
        jquery_kinetic:{
            deps: ['jquery']
        },
        imagepanner:{
            deps: ['jquery_mousewheel','jquery_kinetic']
        },
        bootstrap_tokenfield:{
            deps: ['jquery','jquery_ui']
        }




    }

});


define(function (require) {
    var common = require('common/common'),
        $ = require('jquery');

    $(function () {
        $("#LogoutPanel span").text($.cookie("username"));
        $("#logout").click(function(){
            common.LogOut();
        });

    });

});
