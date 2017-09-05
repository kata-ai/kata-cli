# Zaun.TeamApi

All URIs are relative to *https://virtserver.swaggerhub.com/ikmals/zaun/1.0.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**teamsPost**](TeamApi.md#teamsPost) | **POST** /teams | Create a team
[**teamsTeamIdUsersGet**](TeamApi.md#teamsTeamIdUsersGet) | **GET** /teams/{teamId}/users | Find users in a team
[**teamsTeamIdUsersPost**](TeamApi.md#teamsTeamIdUsersPost) | **POST** /teams/{teamId}/users | Add user to team
[**teamsTeamIdUsersUserIdDelete**](TeamApi.md#teamsTeamIdUsersUserIdDelete) | **DELETE** /teams/{teamId}/users/{userId} | Delete user from team


<a name="teamsPost"></a>
# **teamsPost**
> InlineResponse2006 teamsPost(body)

Create a team

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.TeamApi();

var body = new Zaun.Team(); // Team | Team object


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.teamsPost(body, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Team**](Team.md)| Team object | 

### Return type

[**InlineResponse2006**](InlineResponse2006.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="teamsTeamIdUsersGet"></a>
# **teamsTeamIdUsersGet**
> InlineResponse2006 teamsTeamIdUsersGet(teamId)

Find users in a team

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.TeamApi();

var teamId = "teamId_example"; // String | ID of team to return


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.teamsTeamIdUsersGet(teamId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **teamId** | **String**| ID of team to return | 

### Return type

[**InlineResponse2006**](InlineResponse2006.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="teamsTeamIdUsersPost"></a>
# **teamsTeamIdUsersPost**
> InlineResponse2006 teamsTeamIdUsersPost(teamId, userId, roleId)

Add user to team

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.TeamApi();

var teamId = "teamId_example"; // String | Team ID

var userId = "userId_example"; // String | User ID

var roleId = "roleId_example"; // String | Role ID


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.teamsTeamIdUsersPost(teamId, userId, roleId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **teamId** | **String**| Team ID | 
 **userId** | **String**| User ID | 
 **roleId** | **String**| Role ID | 

### Return type

[**InlineResponse2006**](InlineResponse2006.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="teamsTeamIdUsersUserIdDelete"></a>
# **teamsTeamIdUsersUserIdDelete**
> InlineResponse2006 teamsTeamIdUsersUserIdDelete(teamId, userId)

Delete user from team

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.TeamApi();

var teamId = "teamId_example"; // String | Team ID

var userId = "userId_example"; // String | User ID


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.teamsTeamIdUsersUserIdDelete(teamId, userId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **teamId** | **String**| Team ID | 
 **userId** | **String**| User ID | 

### Return type

[**InlineResponse2006**](InlineResponse2006.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

