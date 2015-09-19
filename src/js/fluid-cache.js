'use strict';


/**
 * TODO: fluid-cache creates an interceptor to cache ng-model using an AngularJS directive.
 * Created by rickzx98 on 9/5/15.
 */
angular.module("fluid.webComponents.fluidCache", [])
    .service("fluidCache.service", ["$templateCache", function (tc) {
        this.getCache = function (key) {
            return tc.get(key);
        };
        this.putCache = function (key, data) {
            tc.put(key, data);
            console.debug("fluidCache.service.put.key", key);
            console.debug("fluidCache.service.put.data", data);
        };
        return this;
    }])
    .factory("fluidCache.injector", ["fluidCache.service", function (fs) {

        return {
            "response": function (response) {
                console.debug("fluidCache.injector.response", response);
                if (fs.getCache(response.config.url) === false) {
                    fs.putCache(response.config.url, response.data);
                }
                return response;
            }
        }
    }])
    .directive("fluidCache", ["fluidCache.service", "$compile", function (fs) {
        return {
            restrict: "A",
            link: function (scope, element, attr) {

                element.ready(function () {
                    var obj = scope.$$childHead.$eval(attr.fluidCache);
                    console.debug("fluidCache.cache", obj);
                    if (obj) {
                        fs.putCache(obj, false);
                    }
                });
            }
        }
    }]).config(["$httpProvider", function (hp) {
        hp.interceptors.push('fluidCache.injector');
    }]);