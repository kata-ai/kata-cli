# Zaun.ChannelApi

All URIs are relative to *http://zaun.katalabs.io/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**botsBotIdDeploymentsDepIdChannelsChannelIdDelete**](ChannelApi.md#botsBotIdDeploymentsDepIdChannelsChannelIdDelete) | **DELETE** /bots/{botId}/deployments/{depId}/channels/{channelId} | Delete channel by ID
[**botsBotIdDeploymentsDepIdChannelsChannelIdGet**](ChannelApi.md#botsBotIdDeploymentsDepIdChannelsChannelIdGet) | **GET** /bots/{botId}/deployments/{depId}/channels/{channelId} | Find channel by ID
[**botsBotIdDeploymentsDepIdChannelsChannelIdPut**](ChannelApi.md#botsBotIdDeploymentsDepIdChannelsChannelIdPut) | **PUT** /bots/{botId}/deployments/{depId}/channels/{channelId} | Update channel by ID
[**botsBotIdDeploymentsDepIdChannelsGet**](ChannelApi.md#botsBotIdDeploymentsDepIdChannelsGet) | **GET** /bots/{botId}/deployments/{depId}/channels | Get all channels
[**botsBotIdDeploymentsDepIdChannelsPost**](ChannelApi.md#botsBotIdDeploymentsDepIdChannelsPost) | **POST** /bots/{botId}/deployments/{depId}/channels | Create a channel


<a name="botsBotIdDeploymentsDepIdChannelsChannelIdDelete"></a>
# **botsBotIdDeploymentsDepIdChannelsChannelIdDelete**
> Channel botsBotIdDeploymentsDepIdChannelsChannelIdDelete(botId, depId, channelId)

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

var depId = "depId_example"; // String | ID of deployment to update

var channelId = "channelId_example"; // String | ID of channel to delete


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDepIdChannelsChannelIdDelete(botId, depId, channelId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **depId** | **String**| ID of deployment to update | 
 **channelId** | **String**| ID of channel to delete | 

### Return type

[**Channel**](Channel.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDepIdChannelsChannelIdGet"></a>
# **botsBotIdDeploymentsDepIdChannelsChannelIdGet**
> Channel botsBotIdDeploymentsDepIdChannelsChannelIdGet(botId, depId, channelId)

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

var depId = "depId_example"; // String | ID of deployment to update

var channelId = "channelId_example"; // String | ID of channel


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDepIdChannelsChannelIdGet(botId, depId, channelId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **depId** | **String**| ID of deployment to update | 
 **channelId** | **String**| ID of channel | 

### Return type

[**Channel**](Channel.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDepIdChannelsChannelIdPut"></a>
# **botsBotIdDeploymentsDepIdChannelsChannelIdPut**
> Channel botsBotIdDeploymentsDepIdChannelsChannelIdPut(botId, depId, channelId, body)

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

var depId = "depId_example"; // String | ID of deployment to update

var channelId = "channelId_example"; // String | ID of channel to update

var body = new Zaun.Channel(); // Channel | Channel object


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDepIdChannelsChannelIdPut(botId, depId, channelId, body, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **depId** | **String**| ID of deployment to update | 
 **channelId** | **String**| ID of channel to update | 
 **body** | [**Channel**](Channel.md)| Channel object | 

### Return type

[**Channel**](Channel.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDepIdChannelsGet"></a>
# **botsBotIdDeploymentsDepIdChannelsGet**
> InlineResponse2002 botsBotIdDeploymentsDepIdChannelsGet(botId, depId, opts)

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

var depId = "depId_example"; // String | ID of deployment to update

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
apiInstance.botsBotIdDeploymentsDepIdChannelsGet(botId, depId, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **depId** | **String**| ID of deployment to update | 
 **limit** | **Number**| Limit returned channels in a page | [optional] 
 **page** | **Number**| A number representing page | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDeploymentsDepIdChannelsPost"></a>
# **botsBotIdDeploymentsDepIdChannelsPost**
> Channel botsBotIdDeploymentsDepIdChannelsPost(body, botId, depId)

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

var depId = "depId_example"; // String | ID of deployment


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDeploymentsDepIdChannelsPost(body, botId, depId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Channel**](Channel.md)| Channel object | 
 **botId** | **String**| ID of bot | 
 **depId** | **String**| ID of deployment | 

### Return type

[**Channel**](Channel.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

