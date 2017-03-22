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
        templateUrl: '/src/js/templates/dns-checker.html',
        controller: 'DnsController'
    }
}]);
