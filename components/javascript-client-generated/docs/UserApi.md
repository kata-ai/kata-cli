# Zaun.UserApi

All URIs are relative to *https://virtserver.swaggerhub.com/ikmals/zaun/1.0.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**usersGet**](UserApi.md#usersGet) | **GET** /users | Get all users
[**usersPost**](UserApi.md#usersPost) | **POST** /users | Create a user
[**usersUserIdDelete**](UserApi.md#usersUserIdDelete) | **DELETE** /users/{userId} | Delete user by ID
[**usersUserIdGet**](UserApi.md#usersUserIdGet) | **GET** /users/{userId} | Find user by ID
[**usersUserIdPut**](UserApi.md#usersUserIdPut) | **PUT** /users/{userId} | Update user by ID
[**usersUserIdTeamsGet**](UserApi.md#usersUserIdTeamsGet) | **GET** /users/{userId}/teams | Find user&#39;s teams
[**usersUserIdTokensGet**](UserApi.md#usersUserIdTokensGet) | **GET** /users/{userId}/tokens | Find user&#39;s tokens


<a name="usersGet"></a>
# **usersGet**
> InlineResponse2005 usersGet(opts)

Get all users

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.UserApi();

var opts = { 
  'limit': 56, // Number | Limit returned users in a page
  'page': 56 // Number | A number representing page
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.usersGet(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **Number**| Limit returned users in a page | [optional] 
 **page** | **Number**| A number representing page | [optional] 

### Return type

[**InlineResponse2005**](InlineResponse2005.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="usersPost"></a>
# **usersPost**
> Object usersPost(body)

Create a user

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.UserApi();

var body = new Zaun.User(); // User | User object


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.usersPost(body, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**User**](User.md)| User object | 

### Return type

**Object**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="usersUserIdDelete"></a>
# **usersUserIdDelete**
> &#39;Boolean&#39; usersUserIdDelete(userId)

Delete user by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.UserApi();

var userId = "userId_example"; // String | ID of user to delete


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.usersUserIdDelete(userId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **userId** | **String**| ID of user to delete | 

### Return type

**&#39;Boolean&#39;**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="usersUserIdGet"></a>
# **usersUserIdGet**
> Object usersUserIdGet(userId)

Find user by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.UserApi();

var userId = "userId_example"; // String | ID of user to return


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.usersUserIdGet(userId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **userId** | **String**| ID of user to return | 

### Return type

**Object**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="usersUserIdPut"></a>
# **usersUserIdPut**
> Object usersUserIdPut(userId, body)

Update user by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.UserApi();

var userId = "userId_example"; // String | ID of user to update

var body = new Zaun.User(); // User | User object


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.usersUserIdPut(userId, body, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **userId** | **String**| ID of user to update | 
 **body** | [**User**](User.md)| User object | 

### Return type

**Object**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="usersUserIdTeamsGet"></a>
# **usersUserIdTeamsGet**
> [&#39;String&#39;] usersUserIdTeamsGet(userId)

Find user&#39;s teams

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.UserApi();

var userId = "userId_example"; // String | ID of user


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.usersUserIdTeamsGet(userId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **userId** | **String**| ID of user | 

### Return type

**[&#39;String&#39;]**

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="usersUserIdTokensGet"></a>
# **usersUserIdTokensGet**
> [Token] usersUserIdTokensGet(userId)

Find user&#39;s tokens

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.UserApi();

var userId = "userId_example"; // String | ID of user


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.usersUserIdTokensGet(userId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **userId** | **String**| ID of user | 

### Return type

[**[Token]**](Token.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

