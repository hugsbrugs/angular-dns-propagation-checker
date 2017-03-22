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
