# Zaun.DeploymentApi

All URIs are relative to *http://zaun.katalabs.io/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**botsBotIdDeploymentsDepIdDelete**](DeploymentApi.md#botsBotIdDeploymentsDepIdDelete) | **DELETE** /bots/{botId}/deployments/{depId} | Delete deployment by ID
[**botsBotIdDeploymentsDepIdGet**](DeploymentApi.md#botsBotIdDeploymentsDepIdGet) | **GET** /bots/{botId}/deployments/{depId} | Find deployment by ID
[**botsBotIdDeploymentsDepIdPut**](DeploymentApi.md#botsBotIdDeploymentsDepIdPut) | **PUT** /bots/{botId}/deployments/{depId} | Update deployment by ID
[**botsBotIdDeploymentsGet**](DeploymentApi.md#botsBotIdDeploymentsGet) | **GET** /bots/{botId}/deployments | Get all bot deployments
[**botsBotIdDeploymentsPost**](DeploymentApi.md#botsBotIdDeploymentsPost) | **POST** /bots/{botId}/deployments | Create bot deployment


<a name="botsBotIdDeploymentsDepIdDelete"></a>
# **botsBotIdDeploymentsDepIdDelete**
> Deployment botsBotIdDeploymentsDepIdDelete(botId, depId)

Delete deployment by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.DeploymentApi();

var botId = "botId_example"; // String | ID of bot

var depId = "depId_example"; // String | ID of deployment to delete


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDepIdDelete(botId, depId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **depId** | **String**| ID of deployment to delete | 

### Return type

[**Deployment**](Deployment.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDepIdGet"></a>
# **botsBotIdDeploymentsDepIdGet**
> Deployment botsBotIdDeploymentsDepIdGet(botId, depId)

Find deployment by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.DeploymentApi();

var botId = "botId_example"; // String | ID of bot

var depId = "depId_example"; // String | ID of deployment to return


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDepIdGet(botId, depId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **depId** | **String**| ID of deployment to return | 

### Return type

[**Deployment**](Deployment.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDepIdPut"></a>
# **botsBotIdDeploymentsDepIdPut**
> Object botsBotIdDeploymentsDepIdPut(botId, depId, body)

Update deployment by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.DeploymentApi();

var botId = "botId_example"; // String | ID of bot

var depId = "depId_example"; // String | ID of deployment to update

var body = new Zaun.Deployment(); // Deployment | Deployment


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDepIdPut(botId, depId, body, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **depId** | **String**| ID of deployment to update | 
 **body** | [**Deployment**](Deployment.md)| Deployment | 

### Return type

**Object**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsGet"></a>
# **botsBotIdDeploymentsGet**
> InlineResponse2001 botsBotIdDeploymentsGet(opts)

Get all bot deployments

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.DeploymentApi();

var opts = { 
  'limit': 56, // Number | Limit returned bots in a page
  'page': 56 // Number | A number representing page
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsGet(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **Number**| Limit returned bots in a page | [optional] 
 **page** | **Number**| A number representing page | [optional] 

### Return type

[**InlineResponse2001**](InlineResponse2001.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsPost"></a>
# **botsBotIdDeploymentsPost**
> Deployment botsBotIdDeploymentsPost(botId, opts)

Create bot deployment

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.DeploymentApi();

var botId = "botId_example"; // String | ID of bot to deploy

var opts = { 
  'body': new Zaun.Deployment() // Deployment | Deployment object
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsPost(botId, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot to deploy | 
 **body** | [**Deployment**](Deployment.md)| Deployment object | [optional] 

### Return type

[**Deployment**](Deployment.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

