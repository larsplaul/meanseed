angular.module('myApp.security', [])
  .controller('AppLoginCtrl', function ($scope, $rootScope, $http, $window, $location, $location, $timeout, $uibModal, jwtHelper) {

    $rootScope.$on('logOutEvent', function () {
      $scope.logout();
    });



    $scope.$on("NotAuthenticatedEvent", function (event, res) {


      if (typeof res.data.error !== "undefined" && res.data.error.message) {
        if (res.data.error.message.indexOf("No authorization header") === 0) {
          //Provide a friendly message
          $scope.openErrorModal("You are not authenticated to perform this operation. Please login");
        }
        else {
          $scope.openErrorModal(res.data.error.message);
        }
      }
      else {
        //You should never get here - format your error messages as suggested by the seed (backend)
        $scope.openErrorModal("You are not authenticated");
      }
      $scope.$emit("logOutEvent");

    });

    $scope.$on("NotAuthorizedEvent", function (event, res) {
      if (typeof res.data.error !== "undefined" && res.data.error.message) {
       console.log(res.data.error.message);
      }
      $scope.openErrorModal("You are not authorized to perform the requested operation");

    });

    $scope.$on("HttpErrorEvent", function (event, res) {
      if (typeof res.data.error !== "undefined" && res.data.error.message) {
        $scope.openErrorModal(res.data.error.message);
      }
      else {
        $scope.openErrorModal("Unknown error during http request");
      }
    });

    clearUserDetails($scope);

    $rootScope.user = {};
    $rootScope.user = {
      username: "",
      password: "",
      confirmPassword: ""
    };
    $rootScope.login = function () {
      $http.post('users/authenticate', $rootScope.user)
        .success(function (data) {
          $window.sessionStorage.id_token = data.token;
          initializeFromToken($scope, $window.sessionStorage.id_token, jwtHelper);
          $location.path("#/view1");
        })
        .error(function (data) {
          delete $window.sessionStorage.id_token;
          clearUserDetails($scope);
        });
    };

    $rootScope.logout = function () {
      $scope.isAuthenticated = false;
      $scope.isAdmin = false;
      $scope.isUser = false;
      delete $window.sessionStorage.id_token;
      //  $location.path("/view1");
    };

    $rootScope.openErrorModal = function (text) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'errorModal.html',
        controller: function ($scope, $uibModalInstance) {
          $scope.error = text;
          $scope.ok = function () {
            $uibModalInstance.close();
          };
        },
        size: 'sm'
      });
    };

    loginViaURL();

    if( $window.sessionStorage.faceBookErr){
      //We redirect twice, only the last time should show the error - XXXXXX is a hack to check for this
      var err = angular.copy($window.sessionStorage.faceBookErr);
      if(err.startsWith("XXXXXX")){
        $window.sessionStorage.faceBookErr = err.substring(6,err.length);
        return;
      }
      $scope.openErrorModal( err);
      $window.sessionStorage.removeItem("faceBookErr");
    }
    /*
     This is pretty "hacky"
     Facebook auth redirected with token in the url. Read the token and store in sessionStorage
     Redirect one more time to get reed of the Token in the URL
     Flashes to much
     */
    function loginViaURL() {
      var absoluteURL = $location.absUrl();
      console.log(absoluteURL);
      var tokenIndex = absoluteURL.indexOf("token=");
      var startOfToken = tokenIndex + "token=".length;
      var endOfToken = absoluteURL.indexOf("#");
      if (tokenIndex > 0 && endOfToken > 0) {
        var tokenFromUrl = absoluteURL.substring(startOfToken, endOfToken);
        $window.sessionStorage.id_token = tokenFromUrl;
        initializeFromToken($scope, $window.sessionStorage.id_token, jwtHelper);
        absoluteURL = absoluteURL.replace("token=" + tokenFromUrl, "");
        console.log(absoluteURL);
        window.location.href = absoluteURL;
        // $location.path("#/view1");
      }
      else{

        errorIndex = absoluteURL.indexOf("error=");
        var startOfError = errorIndex + "error=".length;
        var endOfError = absoluteURL.indexOf("#");
        var errorFromUrl = absoluteURL.substring(startOfError, endOfError);
        if (errorIndex > 0 && endOfError > 0) {
          absoluteURL = absoluteURL.replace("error=" + errorFromUrl, "");
          $window.sessionStorage.faceBookErr = "XXXXXXSorry, we could not authenticate you using Facebook ";
          $window.sessionStorage.count = 0;
          window.location.href = absoluteURL;
        }
      }
    }


    //This sets the login data from session store if user pressed F5 (You are still logged in)
    var init = function () {
      var token = $window.sessionStorage.id_token;
      if (token) {
        initializeFromToken($scope, $window.sessionStorage.id_token, jwtHelper);
      }
    };
    init();// and fire it after definition
  }).factory('AuthInterceptor', function ($rootScope, $q) {
    return {
      responseError: function (response) {
        var name = "";
        switch (response.status) {
          case 401:
            name = "NotAuthenticatedEvent";
            break;
          case 403:
            name = "NotAuthorizedEvent";
            break;
          default :
            name = "HttpErrorEvent";
        }
        $rootScope.$broadcast(name, response);
        return $q.reject(response);
      }
    };
  })
  .config(function Config($httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.tokenGetter = function () {
      return sessionStorage.getItem('id_token');
    };
    $httpProvider.interceptors.push('jwtInterceptor');
  });


function initializeFromToken($scope, token, jwtHelper) {
  $scope.isAuthenticated = true;
  var tokenPayload = jwtHelper.decodeToken(token);
  $scope.username = tokenPayload.sub;
  $scope.isAdmin = false;
  $scope.isUser = false;
  tokenPayload.roles.forEach(function (role) {
    if (role === "Admin") {
      $scope.isAdmin = true;
    }
    if (role === "User") {
      $scope.isUser = true;
    }
  });
}

function clearUserDetails($scope) {
  $scope.username = "";
  $scope.isAuthenticated = false;
  $scope.isAdmin = false;
  $scope.isUser = false;
}








