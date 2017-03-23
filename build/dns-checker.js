angular.module('angular-dns-propagation-checker', [])

"use strict";

angular.module('angular-dns-propagation-checker')

.provider("dnsChecker", [function () {

    var _apiListDns = '/get_nodes.php',
    _apiGetDns = '/get_node.php';

    this.$get = [function(){
        return {
            'apiListDns': _apiListDns,
            'apiGetDns': _apiGetDns
        }
    }];

    this.setApiListDns= function (apiListDns)
    {
        _apiListDns = apiListDns;
    };
    this.setApiGetDns= function (apiGetDns)
    {
        _apiGetDns = apiGetDns;
    };

}]);
"use strict";

/**
 * Defines MyApp Controllers
 */
angular.module('angular-dns-propagation-checker')

/**
 * Dns Controller : Main Application Controller
 *
 *
 *
 */
.controller('DnsController',['$rootScope', '$scope', '$log', 'DnsService', 'UrlService', '$interval', '$timeout', '$compile', '$sce',
    function ($rootScope, $scope, $log, DnsService, UrlService, $interval, $timeout, $compile, $sce)
    {
        // DNS Nodes to query
        $scope.nodes = null;
        
        // Domain URL and record to check
        // against optional expected value
        $scope.domain = {
            url:'',
            record:'a',
            expected:''
        };

        // Accepted DNS records
        $scope.records = ['a', 'cname', 'mx', 'ns', 'spf', 'txt'];

        // Current DNS check params 
        $scope.check = {
            total: 0,
            current: 0,
            success: 0,
            warning: 0,
            danger: 0,
        };

        // Is a DNS check running
        $scope.dns_check_running = false;

        // Retrieve Nodes
        $scope.get_nodes = function()
        {
            DnsService.get_nodes()
                .then( function(answer)
                {
                    $scope.nodes = answer.data.nodes;
                    // Get params from URL
                    $scope.get_url();
                })
                .catch(function(answer)
                {
                    alert('error' + JSON.stringify(answer));
                });
        };

        // Retrieve URL Params to set form data
        $scope.get_url = function()
        {
            var domain = UrlService.get_url();
            // $log.log('get_url', domain);
            
            if(domain.url!==null && domain.url.length>0)
            {
                $scope.domain.url = domain.url;
            }
            if(domain.record!==null && domain.record.length>0 && $scope.records.indexOf(domain.record)>-1)
            {
                $scope.domain.record = domain.record;
            }
            if(domain.expected!==null && domain.expected.length>0)
            {
                $scope.domain.expected = domain.expected;
            }

            // if form valid launch DNS check
            if($scope.domain.url.length>0 && $scope.domain.record.length>0)
            {
                $scope.check_all_dns();
            }
        }

        // Reset Page for new DNS check
        $scope.reset_check_dns = function()
        {
            // Reset node results
            angular.forEach($scope.nodes, function(node)
            {
                node.status = null;
                node.result = null;
                node.results = null;
                node.ttl = null;
            });

            // Reset check params
            $scope.check = {
                total: 0,
                current: 0,
                success: 0,
                warning: 0,
                danger: 0,
            };
        };

        // Query All Nodes for DNS check
        $scope.check_all_dns = function()
        {
            // Prevent running a check if previous one 
            // has not finished
            if($scope.dns_check_running)
            {
                event.preventDefault();
                return false;
            }

            // Reset Page 
            $scope.reset_check_dns();

            // Set Form data in URL for convenience 
            UrlService.set_url($scope.domain);

            $scope.dns_check_running = true;
            $scope.check.total = $scope.nodes.length;
            $scope.check.current = 0;

            // Delay running threads every second to avoid
            // server overload and decrease DNS check errors
            var i = 0;
            $interval(function()
            {
                $scope.check_one_dns($scope.nodes[i]);
                i++;
            }, 1000, $scope.nodes.length);

        };

        // Check One Node
        $scope.check_one_dns = function(node)
        {
            DnsService.get_node(node, $scope.domain.url, $scope.domain.record)
                .then( function(answer)
                {
                    // Extract DNS check response
                    $scope.process_node_success(node, answer.data);
                })
                .catch(function(answer)
                {
                    // Display error
                    $scope.process_node_error(node, answer);
                })
                .finally(function(answer)
                {
                    // Verify if DNS check has ended
                    $scope.check.current++;
                    if($scope.check.current === $scope.nodes.length)
                    {
                        $scope.dns_check_running = false;
                    }
                });
        }

        // Display error when DNS check has failed
        $scope.process_node_error = function(node, answer)
        {
            $log.log('process_node_error', answer);
            node.result = $sce.trustAsHtml("Request timed out. <span ng-click=\"view_raw('" + node.name + "','" + $scope.domain.url + "','" + $scope.domain.record+"')\">View Raw</span>");
            // href=\"http://www.dns-lg.com/" + node.name + "/" + $scope.domain.url + "/" + $scope.domain.record + "\" target=\"_blank\"
            node.status = "warning";
            $scope.check.warning++;
        };

        // Display results when DNS check has succeed
        $scope.process_node_success = function(node, data)
        {
            // $log.log('process_node_success', data);
            
            if(typeof data.code !== "undefined")
            {
                node.result = data.code + ": " + data.message;
                node.status = "warning";
                $scope.check.warning++;
            }
            else if( ! data.answer)
            {
                node.result = "No record";
                node.status = "warning";
                $scope.check.warning++;
            }
            else if(data.answer)
            {
                // Build array to display record value and TTL
                var group = [];
                data.answer.forEach(function(thisAnswer)
                {
                    group.push({
                        res:thisAnswer.rdata,
                        ttl:thisAnswer.ttl
                    });                    
                });

                node.result = "OK";
                node.results = group;

                // Check against expected DNS record value
                if($scope.domain.expected)
                {
                    angular.forEach(node.results, function(result)
                    {
                        if(result.res.match(new RegExp("^" + $scope.domain.expected + "$", "i")))
                        {
                            result.status = 'success';
                            node.status = 'success';
                        }
                        else
                        {
                            result.status = 'danger';
                        }
                    });

                    if(node.status==='success')
                    {
                        $scope.check.success++;
                    }
                    else
                    {
                        node.status = 'danger';
                        $scope.check.danger++;
                    }
                }
                else
                {
                    $scope.check.success++;
                }
            }
            else
            {
                node.result = "Unknown response";
                node.status = "warning";
                $scope.check.warning++;
            }
        };

        // Display error
        $scope.view_raw = function(node_name, domain_url, domain_record)
        {
            $log.log('view_raw');
            e.preventDefault();
            var url = "http://www.dns-lg.com/" + node_name + "/" + domain_url + "/" + domain_record;
            angular.element(element).html("<iframe src=\"" + url + "\"></iframe>");
        }

        // Init
        $scope.get_nodes();
    }
]);

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
"use strict";

/**
 * 
 */
angular.module('angular-dns-propagation-checker')

/**
 * <dns-checker><dns-checker>
 */
.directive('dnsChecker', [function() {
    return {
        restrict: 'E',
        replace: false,
        template:'<div class="row"><div class="col-md-4" id="toolbar"><div class="panel panel-default"><div class="panel-heading"><h3 class="panel-title">Options</h3></div><div class="panel-body"><form name="DnsForm" ng-submit="check_all_dns()" novalidate><div class="form-group"><label for="domain">Domain</label><div class="input-group"><span class="input-group-addon">http://</span> <input type="text" class="form-control" id="domain" name="domain" ng-model="domain.url" required></div></div><div class="form-group"><label for="record-type">Record Type</label><div class="btn-group"><label class="btn btn-sm btn-default" ng-model="domain.record" uib-btn-radio="\'a\'">A</label> <label class="btn btn-sm btn-default" ng-model="domain.record" uib-btn-radio="\'cname\'">CNAME</label> <label class="btn btn-sm btn-default" ng-model="domain.record" uib-btn-radio="\'mx\'">MX</label> <label class="btn btn-sm btn-default" ng-model="domain.record" uib-btn-radio="\'ns\'">NS</label> <label class="btn btn-sm btn-default" ng-model="domain.record" uib-btn-radio="\'spf\'">SPF</label> <label class="btn btn-sm btn-default" ng-model="domain.record" uib-btn-radio="\'txt\'">TXT</label></div></div><div class="form-group"><label for="domain">Expected Value</label> <small>optional regex</small> <input type="text" ng-model="domain.expected" class="form-control" id="expected" name="expected"></div><div class="form-group"><button class="btn btn-default pull-right" type="submit" id="go" ng-disabled="DnsForm.$invalid || dns_check_running" data-loading-text="Running...">Go !</button></div></form></div></div><div class="panel panel-default"><div class="panel-body"><i class="fa fa-book"></i> <a href="http://www.dns-lg.com/" target="_blank">API Documentation</a><hr><i class="fa fa-github"></i> <a href="https://github.com/hugsbrugs/angularjs-dns-propagation-checker" title="Github Repository">Code on Github</a><hr><i class="fa fa-user-md"></i> <a href="https://hugo.maugey.fr" title="Webmaster AngularJS">Author</a></div></div></div><div class="col-md-8"><uib-progress ng-hide="check.total==0" max="check.total" value="check.current" class="progress-striped" animate="true"><uib-bar value="check.success" type="success"><i>{{((check.success/check.total)*100) | number:0}}%</i></uib-bar><uib-bar value="check.warning" type="warning"><i>{{((check.warning/check.total)*100) | number:0}}%</i></uib-bar><uib-bar value="check.danger" type="danger"><i>{{((check.danger/check.total)*100) | number:0}}%</i></uib-bar></uib-progress><div class="table-responsive"><table class="table table-condensed"><thead><tr><th>Server</th><th>Result</th><th>TTL</th></tr></thead><tbody><tr ng-repeat="node in nodes track by $index" id="{{node.name}}" class="{{node.status}}"><td class="country"><span uib-tooltip="{{node.operator}}"><div class="flag flag-{{node.isocc}}"></div>{{node.country}}</span></td><td colspan="2" ng-if="node.result!=\'OK\'"><span ng-bind-html="node.result"></span></td><td colspan="2" ng-if="node.result==\'OK\'"><table class="table table-hover table-condensed table-hug"><tbody><tr ng-repeat="(key, value) in node.results track by $index"><td><span ng-show="value.status==\'success\'" class="text-success"><i class="fa fa-check"></i></span> <span ng-show="value.status==\'danger\'" class="text-danger"><i class="fa fa-times"></i></span></td><td>{{value.res}}</td><td width="100"><span uib-tooltip="{{value.ttl}} seconds">{{value.ttl | amDurationFormat : \'seconds\'}}</span></td></tr></tbody></table></td></tr></tbody></table></div></div></div>',
        controller: 'DnsController'
    }
}]);
