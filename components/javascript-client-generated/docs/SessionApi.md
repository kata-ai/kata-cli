# Zaun.SessionApi

All URIs are relative to *http://zaun.katalabs.io/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**botsBotIdDeploymentsDepIdSessionsPost**](SessionApi.md#botsBotIdDeploymentsDepIdSessionsPost) | **POST** /bots/{botId}/deployments/{depId}/sessions | Create session for bot deployment
[**botsBotIdDeploymentsDepIdSessionsSessionIdDelete**](SessionApi.md#botsBotIdDeploymentsDepIdSessionsSessionIdDelete) | **DELETE** /bots/{botId}/deployments/{depId}/sessions/{sessionId} | Delete session by ID
[**botsBotIdDeploymentsDepIdSessionsSessionIdGet**](SessionApi.md#botsBotIdDeploymentsDepIdSessionsSessionIdGet) | **GET** /bots/{botId}/deployments/{depId}/sessions/{sessionId} | Find session by ID
[**botsBotIdDeploymentsDepIdSessionsSessionIdPut**](SessionApi.md#botsBotIdDeploymentsDepIdSessionsSessionIdPut) | **PUT** /bots/{botId}/deployments/{depId}/sessions/{sessionId} | Update session by ID


<a name="botsBotIdDeploymentsDepIdSessionsPost"></a>
# **botsBotIdDeploymentsDepIdSessionsPost**
> Session botsBotIdDeploymentsDepIdSessionsPost(botId, depId, body)

Create session for bot deployment

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.SessionApi();

var botId = "botId_example"; // String | ID of bot

var depId = "depId_example"; // String | ID of deployment

var body = new Zaun.Session(); // Session | Session


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDepIdSessionsPost(botId, depId, body, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **depId** | **String**| ID of deployment | 
 **body** | [**Session**](Session.md)| Session | 

### Return type

[**Session**](Session.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDepIdSessionsSessionIdDelete"></a>
# **botsBotIdDeploymentsDepIdSessionsSessionIdDelete**
> Session botsBotIdDeploymentsDepIdSessionsSessionIdDelete(botId, depId, sessionId)

Delete session by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.SessionApi();

var botId = "botId_example"; // String | ID of bot

var depId = "depId_example"; // String | ID of deployment to update

var sessionId = "sessionId_example"; // String | ID of session to delete


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDepIdSessionsSessionIdDelete(botId, depId, sessionId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **depId** | **String**| ID of deployment to update | 
 **sessionId** | **String**| ID of session to delete | 

### Return type

[**Session**](Session.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDepIdSessionsSessionIdGet"></a>
# **botsBotIdDeploymentsDepIdSessionsSessionIdGet**
> Session botsBotIdDeploymentsDepIdSessionsSessionIdGet(botId, depId, sessionId, mode)

Find session by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.SessionApi();

var botId = "botId_example"; // String | ID of bot

var depId = "depId_example"; // String | ID of deployment to update

var sessionId = "sessionId_example"; // String | ID of session to return

var mode = "mode_example"; // String | get mode


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDepIdSessionsSessionIdGet(botId, depId, sessionId, mode, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **depId** | **String**| ID of deployment to update | 
 **sessionId** | **String**| ID of session to return | 
 **mode** | **String**| get mode | 

### Return type

[**Session**](Session.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDepIdSessionsSessionIdPut"></a>
# **botsBotIdDeploymentsDepIdSessionsSessionIdPut**
> Object botsBotIdDeploymentsDepIdSessionsSessionIdPut(botId, depId, sessionId, body)

Update session by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.SessionApi();

var botId = "botId_example"; // String | ID of bot

var depId = "depId_example"; // String | ID of deployment to update

var sessionId = "sessionId_example"; // String | ID of session to update

var body = new Zaun.Session(); // Session | Session


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDepIdSessionsSessionIdPut(botId, depId, sessionId, body, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **depId** | **String**| ID of deployment to update | 
 **sessionId** | **String**| ID of session to update | 
 **body** | [**Session**](Session.md)| Session | 

### Return type

**Object**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

