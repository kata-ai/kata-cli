# Zaun.BotApi

All URIs are relative to *https://virtserver.swaggerhub.com/ikmals/zaun/1.0.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**botsBotIdConversePost**](BotApi.md#botsBotIdConversePost) | **POST** /bots/{botId}/converse | Converse
[**botsBotIdDelete**](BotApi.md#botsBotIdDelete) | **DELETE** /bots/{botId} | Delete bot by ID
[**botsBotIdExecObjectPost**](BotApi.md#botsBotIdExecObjectPost) | **POST** /bots/{botId}/exec/{object} | Execute intent, state mapper, action, or
[**botsBotIdGet**](BotApi.md#botsBotIdGet) | **GET** /bots/{botId} | Find bot by ID
[**botsBotIdPut**](BotApi.md#botsBotIdPut) | **PUT** /bots/{botId} | Update bot by ID
[**botsBotIdVersionsGet**](BotApi.md#botsBotIdVersionsGet) | **GET** /bots/{botId}/versions | Get bot versions
[**botsGet**](BotApi.md#botsGet) | **GET** /bots | Get all bots
[**botsPost**](BotApi.md#botsPost) | **POST** /bots | Create bot


<a name="botsBotIdConversePost"></a>
# **botsBotIdConversePost**
> Object botsBotIdConversePost(botId, body)

Converse

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.BotApi();

var botId = "botId_example"; // String | ID of bot

var body = new Zaun.Conversation(); // Conversation | Conversation object


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdConversePost(botId, body, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **body** | [**Conversation**](Conversation.md)| Conversation object | 

### Return type

**Object**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdDelete"></a>
# **botsBotIdDelete**
> Bot botsBotIdDelete(botId)

Delete bot by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.BotApi();

var botId = "botId_example"; // String | ID of bot to delete


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdDelete(botId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot to delete | 

### Return type

[**Bot**](Bot.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdExecObjectPost"></a>
# **botsBotIdExecObjectPost**
> Object botsBotIdExecObjectPost(botId, _object, body)

Execute intent, state mapper, action, or

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.BotApi();

var botId = "botId_example"; // String | ID of bot

var _object = "_object_example"; // String | Object

var body = null; // Object | Exec body


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdExecObjectPost(botId, _object, body, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 
 **_object** | **String**| Object | 
 **body** | **Object**| Exec body | 

### Return type

**Object**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdGet"></a>
# **botsBotIdGet**
> Bot botsBotIdGet(botId)

Find bot by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.BotApi();

var botId = "botId_example"; // String | ID of bot to return


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdGet(botId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot to return | 

### Return type

[**Bot**](Bot.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdPut"></a>
# **botsBotIdPut**
> Bot botsBotIdPut(botId, body, opts)

Update bot by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.BotApi();

var botId = "botId_example"; // String | ID of bot to update

var body = new Zaun.Bot(); // Bot | Bot

var opts = { 
  'increment': "increment_example" // String | Increment version number
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdPut(botId, body, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot to update | 
 **body** | [**Bot**](Bot.md)| Bot | 
 **increment** | **String**| Increment version number | [optional] 

### Return type

[**Bot**](Bot.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsBotIdVersionsGet"></a>
# **botsBotIdVersionsGet**
> InlineResponse200 botsBotIdVersionsGet(botId)

Get bot versions

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.BotApi();

var botId = "botId_example"; // String | ID of bot


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsBotIdVersionsGet(botId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **botId** | **String**| ID of bot | 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsGet"></a>
# **botsGet**
> PagedBot botsGet(opts)

Get all bots

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.BotApi();

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
apiInstance.botsGet(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **Number**| Limit returned bots in a page | [optional] 
 **page** | **Number**| A number representing page | [optional] 

### Return type

[**PagedBot**](PagedBot.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="botsPost"></a>
# **botsPost**
> Bot botsPost(body)

Create bot

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.BotApi();

var body = new Zaun.Bot(); // Bot | Bot


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.botsPost(body, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Bot**](Bot.md)| Bot | 

### Return type

[**Bot**](Bot.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

