# Zaun.RoleApi

All URIs are relative to *https://virtserver.swaggerhub.com/ikmals/zaun/1.0.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**rolesGet**](RoleApi.md#rolesGet) | **GET** /roles | Get all roles
[**rolesPost**](RoleApi.md#rolesPost) | **POST** /roles | Create a role
[**rolesRoleIdDelete**](RoleApi.md#rolesRoleIdDelete) | **DELETE** /roles/{roleId} | Delete role by ID
[**rolesRoleIdGet**](RoleApi.md#rolesRoleIdGet) | **GET** /roles/{roleId} | Find role by ID
[**rolesRoleIdPut**](RoleApi.md#rolesRoleIdPut) | **PUT** /roles/{roleId} | Update role by ID


<a name="rolesGet"></a>
# **rolesGet**
> InlineResponse2004 rolesGet(opts)

Get all roles

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.RoleApi();

var opts = { 
  'limit': 56, // Number | Limit returned roles in a page
  'page': 56 // Number | A number representing page
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.rolesGet(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **Number**| Limit returned roles in a page | [optional] 
 **page** | **Number**| A number representing page | [optional] 

### Return type

[**InlineResponse2004**](InlineResponse2004.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="rolesPost"></a>
# **rolesPost**
> Role rolesPost(body, opts)

Create a role

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.RoleApi();

var body = new Zaun.Role(); // Role | Role object

var opts = { 
  'userId': "userId_example" // String | 
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.rolesPost(body, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**Role**](Role.md)| Role object | 
 **userId** | **String**|  | [optional] 

### Return type

[**Role**](Role.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="rolesRoleIdDelete"></a>
# **rolesRoleIdDelete**
> Role rolesRoleIdDelete(roleId)

Delete role by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.RoleApi();

var roleId = "roleId_example"; // String | ID of role to delete


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.rolesRoleIdDelete(roleId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **roleId** | **String**| ID of role to delete | 

### Return type

[**Role**](Role.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="rolesRoleIdGet"></a>
# **rolesRoleIdGet**
> Role rolesRoleIdGet(roleId)

Find role by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.RoleApi();

var roleId = "roleId_example"; // String | ID of role to return


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.rolesRoleIdGet(roleId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **roleId** | **String**| ID of role to return | 

### Return type

[**Role**](Role.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="rolesRoleIdPut"></a>
# **rolesRoleIdPut**
> Role rolesRoleIdPut(roleId, body, opts)

Update role by ID

### Example
```javascript
var Zaun = require('zaun');
var defaultClient = Zaun.ApiClient.default;

// Configure API key authorization: Bearer
var Bearer = defaultClient.authentications['Bearer'];
Bearer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//Bearer.apiKeyPrefix = 'Token';

var apiInstance = new Zaun.RoleApi();

var roleId = "roleId_example"; // String | ID of role to update

var body = new Zaun.Role(); // Role | Role object

var opts = { 
  'userId': "userId_example" // String | 
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.rolesRoleIdPut(roleId, body, opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **roleId** | **String**| ID of role to update | 
 **body** | [**Role**](Role.md)| Role object | 
 **userId** | **String**|  | [optional] 

### Return type

[**Role**](Role.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

