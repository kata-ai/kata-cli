# Zaun.ScheduleApi

All URIs are relative to *https://virtserver.swaggerhub.com/ikmals/zaun/1.0.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**botsBotIdDeploymentsDeploymentIdSchedulesGet**](ScheduleApi.md#botsBotIdDeploymentsDeploymentIdSchedulesGet) | **GET** /bots/{botId}/deployments/{deploymentId}/schedules | Get all schedules
[**botsBotIdDeploymentsDeploymentIdSchedulesPost**](ScheduleApi.md#botsBotIdDeploymentsDeploymentIdSchedulesPost) | **POST** /bots/{botId}/deployments/{deploymentId}/schedules | Create a schedule
[**botsBotIdDeploymentsDeploymentIdSchedulesScheduleIdDelete**](ScheduleApi.md#botsBotIdDeploymentsDeploymentIdSchedulesScheduleIdDelete) | **DELETE** /bots/{botId}/deployments/{deploymentId}/schedules/{scheduleId} | Delete schedule by ID
[**botsBotIdDeploymentsDeploymentIdSchedulesScheduleIdGet**](ScheduleApi.md#botsBotIdDeploymentsDeploymentIdSchedulesScheduleIdGet) | **GET** /bots/{botId}/deployments/{deploymentId}/schedules/{scheduleId} | Find schedule by ID


<a name="botsBotIdDeploymentsDeploymentIdSchedulesGet"></a>
# **botsBotIdDeploymentsDeploymentIdSchedulesGet**
> InlineResponse2003 botsBotIdDeploymentsDeploymentIdSchedulesGet(botId, deploymentId, opts)

Get all schedules

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.ScheduleApi();

var botId = "botId_example"; // String | ID of bot

var deploymentId = "deploymentId_example"; // String | ID of deployment to update

var opts = { 
  'limit': 56, // Number | Limit returned schedules in a page
  'page': 56 // Number | A number representing page
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDeploymentIdSchedulesGet(botId, deploymentId, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **deploymentId** | **String**| ID of deployment to update | 
 **limit** | **Number**| Limit returned schedules in a page | [optional] 
 **page** | **Number**| A number representing page | [optional] 

### Return type

[**InlineResponse2003**](InlineResponse2003.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDeploymentIdSchedulesPost"></a>
# **botsBotIdDeploymentsDeploymentIdSchedulesPost**
> Schedule botsBotIdDeploymentsDeploymentIdSchedulesPost(body, botId, deploymentId)

Create a schedule

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.ScheduleApi();

var body = new Zaun.Schedule(); // Schedule | Schedule object

var botId = "botId_example"; // String | ID of bot

var deploymentId = "deploymentId_example"; // String | ID of deployment


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDeploymentIdSchedulesPost(body, botId, deploymentId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Schedule**](Schedule.md)| Schedule object | 
 **botId** | **String**| ID of bot | 
 **deploymentId** | **String**| ID of deployment | 

### Return type

[**Schedule**](Schedule.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDeploymentIdSchedulesScheduleIdDelete"></a>
# **botsBotIdDeploymentsDeploymentIdSchedulesScheduleIdDelete**
> Schedule botsBotIdDeploymentsDeploymentIdSchedulesScheduleIdDelete(botId, deploymentId, scheduleId)

Delete schedule by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.ScheduleApi();

var botId = "botId_example"; // String | ID of bot

var deploymentId = "deploymentId_example"; // String | ID of deployment to update

var scheduleId = "scheduleId_example"; // String | ID of schedule to delete


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDeploymentIdSchedulesScheduleIdDelete(botId, deploymentId, scheduleId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **deploymentId** | **String**| ID of deployment to update | 
 **scheduleId** | **String**| ID of schedule to delete | 

### Return type

[**Schedule**](Schedule.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDeploymentIdSchedulesScheduleIdGet"></a>
# **botsBotIdDeploymentsDeploymentIdSchedulesScheduleIdGet**
> Schedule botsBotIdDeploymentsDeploymentIdSchedulesScheduleIdGet(botId, deploymentId, scheduleId)

Find schedule by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.ScheduleApi();

var botId = "botId_example"; // String | ID of bot

var deploymentId = "deploymentId_example"; // String | ID of deployment to update

var scheduleId = "scheduleId_example"; // String | ID of schedule


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDeploymentIdSchedulesScheduleIdGet(botId, deploymentId, scheduleId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **deploymentId** | **String**| ID of deployment to update | 
 **scheduleId** | **String**| ID of schedule | 

### Return type

[**Schedule**](Schedule.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

