'use strict';

angular.module('myApp.signinview', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/viewsignin', {
      templateUrl: 'app/viewsignup/viewsignin.html',
      controller: 'signupCtrl'
    });
  }])

  .controller('signupCtrl', function ($http, $scope) {

    $scope.submit = function () {
      var newUser = JSON.stringify($scope.user);
      $http.post('users/signup',newUser)
        .success(function (data, status, headers, config) {
          $scope.login();
         console.log(data);
        })
        .error(function (data, status, headers, config) {
          console.log(data);
        });
    }

  });