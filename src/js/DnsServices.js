"use strict";

/**
 * Defines MyApp Services
 */
angular.module('angular-dns-propagation-checker')

/**
 * DNS Service
 *
 * Calls local server scripts since dns-lg.com is not supporting CORS neither JSONP
 *
 */
.factory('DnsService', ['$rootScope', '$log', '$http', '$interval', '$timeout', 'dnsChecker',
    function ($rootScope, $log, $http, $interval, $timeout, dnsChecker)
    {
        return {
            
            /**
             * List DNS Nodes
             */
            get_nodes : function()
            {
                return $http.get(dnsChecker.apiListDns);
            },

            /**
             * Call DNS Node for DNS query
             */
            get_node : function(node, domain, record)
            {
                return $http.get(dnsChecker.apiGetDns+"?url=" + encodeURIComponent("http://www.dns-lg.com/" + node.name + "/" + domain + "/" + record), {timeout: 15000});
            },
         }
    }
])


/**
 * URL Service
 *
 * Fill URL parameter to access page without filling form each time
 *
 */
.factory('UrlService', ['$rootScope', '$log', '$http', '$interval', '$timeout',
    function ($rootScope, $log, $http, $interval, $timeout)
    {
        return {
            
            /**
             * Set Hash URL with form data
             */
            set_url : function(domain)
            {
                window.location.hash = this.serializeObj(domain);
            },

            /**
             * Retrieve form data from URL
             */
            get_url : function(node, domain, record)
            {
                var domain = {
                    url: null,
                    record: null,
                    expected: null
                };
                var parts;
                var raw = window.location.hash;

                if(raw)
                {
                    parts = raw.substring(1).split("&");
                
                    parts.forEach(function(part)
                    {
                        var partBits = part.split("=");

                        if(partBits[0] === "record")
                        {
                            domain.record = partBits[1];
                        }
                        else
                        {
                            domain[partBits[0]] = decodeURIComponent(partBits[1]);
                        }
                    });
                }
                return domain;
            },
            
            /**
             * Utility function to serialize form data
             */
            serializeObj : function(obj)
            {
                var result = [];

                for (var property in obj)
                    result.push(encodeURIComponent(property) + "=" + encodeURIComponent(obj[property]));

                return result.join("&");
            }
         }
    }
]);