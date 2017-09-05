# Zaun.ChannelApi

All URIs are relative to *https://virtserver.swaggerhub.com/ikmals/zaun/1.0.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**botsBotIdDeploymentsDeploymentIdChannelsChannelIdDelete**](ChannelApi.md#botsBotIdDeploymentsDeploymentIdChannelsChannelIdDelete) | **DELETE** /bots/{botId}/deployments/{deploymentId}/channels/{channelId} | Delete channel by ID
[**botsBotIdDeploymentsDeploymentIdChannelsChannelIdGet**](ChannelApi.md#botsBotIdDeploymentsDeploymentIdChannelsChannelIdGet) | **GET** /bots/{botId}/deployments/{deploymentId}/channels/{channelId} | Find channel by ID
[**botsBotIdDeploymentsDeploymentIdChannelsChannelIdPut**](ChannelApi.md#botsBotIdDeploymentsDeploymentIdChannelsChannelIdPut) | **PUT** /bots/{botId}/deployments/{deploymentId}/channels/{channelId} | Update channel by ID
[**botsBotIdDeploymentsDeploymentIdChannelsGet**](ChannelApi.md#botsBotIdDeploymentsDeploymentIdChannelsGet) | **GET** /bots/{botId}/deployments/{deploymentId}/channels | Get all channels
[**botsBotIdDeploymentsDeploymentIdChannelsPost**](ChannelApi.md#botsBotIdDeploymentsDeploymentIdChannelsPost) | **POST** /bots/{botId}/deployments/{deploymentId}/channels | Create a channel


<a name="botsBotIdDeploymentsDeploymentIdChannelsChannelIdDelete"></a>
# **botsBotIdDeploymentsDeploymentIdChannelsChannelIdDelete**
> Channel botsBotIdDeploymentsDeploymentIdChannelsChannelIdDelete(botId, deploymentId, channelId)

Delete channel by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.ChannelApi();

var botId = "botId_example"; // String | ID of bot

var deploymentId = "deploymentId_example"; // String | ID of deployment to update

var channelId = "channelId_example"; // String | ID of channel to delete


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDeploymentIdChannelsChannelIdDelete(botId, deploymentId, channelId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **deploymentId** | **String**| ID of deployment to update | 
 **channelId** | **String**| ID of channel to delete | 

### Return type

[**Channel**](Channel.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDeploymentIdChannelsChannelIdGet"></a>
# **botsBotIdDeploymentsDeploymentIdChannelsChannelIdGet**
> Channel botsBotIdDeploymentsDeploymentIdChannelsChannelIdGet(botId, deploymentId, channelId)

Find channel by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.ChannelApi();

var botId = "botId_example"; // String | ID of bot

var deploymentId = "deploymentId_example"; // String | ID of deployment to update

var channelId = "channelId_example"; // String | ID of channel


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDeploymentIdChannelsChannelIdGet(botId, deploymentId, channelId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **deploymentId** | **String**| ID of deployment to update | 
 **channelId** | **String**| ID of channel | 

### Return type

[**Channel**](Channel.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDeploymentIdChannelsChannelIdPut"></a>
# **botsBotIdDeploymentsDeploymentIdChannelsChannelIdPut**
> Channel botsBotIdDeploymentsDeploymentIdChannelsChannelIdPut(botId, deploymentId, channelId, body)

Update channel by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.ChannelApi();

var botId = "botId_example"; // String | ID of bot

var deploymentId = "deploymentId_example"; // String | ID of deployment to update

var channelId = "channelId_example"; // String | ID of channel to update

var body = new Zaun.Channel(); // Channel | Channel object


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDeploymentIdChannelsChannelIdPut(botId, deploymentId, channelId, body, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **deploymentId** | **String**| ID of deployment to update | 
 **channelId** | **String**| ID of channel to update | 
 **body** | [**Channel**](Channel.md)| Channel object | 

### Return type

[**Channel**](Channel.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDeploymentIdChannelsGet"></a>
# **botsBotIdDeploymentsDeploymentIdChannelsGet**
> InlineResponse2002 botsBotIdDeploymentsDeploymentIdChannelsGet(botId, deploymentId, opts)

Get all channels

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.ChannelApi();

var botId = "botId_example"; // String | ID of bot

var deploymentId = "deploymentId_example"; // String | ID of deployment to update

var opts = { 
  'limit': 56, // Number | Limit returned channels in a page
  'page': 56 // Number | A number representing page
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDeploymentIdChannelsGet(botId, deploymentId, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **deploymentId** | **String**| ID of deployment to update | 
 **limit** | **Number**| Limit returned channels in a page | [optional] 
 **page** | **Number**| A number representing page | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDeploymentIdChannelsPost"></a>
# **botsBotIdDeploymentsDeploymentIdChannelsPost**
> Channel botsBotIdDeploymentsDeploymentIdChannelsPost(body, botId, deploymentId)

Create a channel

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.ChannelApi();

var body = new Zaun.Channel(); // Channel | Channel object

var botId = "botId_example"; // String | ID of bot

var deploymentId = "deploymentId_example"; // String | ID of deployment


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDeploymentIdChannelsPost(body, botId, deploymentId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Channel**](Channel.md)| Channel object | 
 **botId** | **String**| ID of bot | 
 **deploymentId** | **String**| ID of deployment | 

### Return type

[**Channel**](Channel.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

