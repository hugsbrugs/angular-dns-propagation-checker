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