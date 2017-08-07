# Zaun.AnalyticApi

All URIs are relative to *http://zaun.katalabs.io/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**analyticsBotIdDeploymentIdObjectGet**](AnalyticApi.md#analyticsBotIdDeploymentIdObjectGet) | **GET** /analytics/{botId}/{deploymentId}/{object} | Get analytic data


<a name="analyticsBotIdDeploymentIdObjectGet"></a>
# **analyticsBotIdDeploymentIdObjectGet**
> [Object] analyticsBotIdDeploymentIdObjectGet(botId, deploymentId, _object, opts)

Get analytic data

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.AnalyticApi();

var botId = "botId_example"; // String | Bot ID

var deploymentId = "deploymentId_example"; // String | Deployment ID

var _object = "_object_example"; // String | Object

var opts = { 
  'args': "args_example" // String | Additional arguments such as channelId, startTimestamp, endTimestamp, etc
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.analyticsBotIdDeploymentIdObjectGet(botId, deploymentId, _object, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| Bot ID | 
 **deploymentId** | **String**| Deployment ID | 
 **_object** | **String**| Object | 
 **args** | **String**| Additional arguments such as channelId, startTimestamp, endTimestamp, etc | [optional] 

### Return type

**[Object]**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

