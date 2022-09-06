import json
import urllib3
import boto3
import urllib.parse
import base64
from datetime import date, datetime
from dateutil.relativedelta import relativedelta
client = boto3.client('dynamodb')

def lambda_handler(event, context):
    qsp = event.get("queryStringParameters");
        
    if (qsp is not None) and ("refreshtoken" in qsp) and (qsp['refreshtoken'] == "yes"):
        m = refreshAccessToken()
        return {
            'statusCode': 200,
            'body': m
        }
        
    if (qsp is not None) and ("authorize" in qsp) and (qsp['authorize'] == "yes"):
        return {
            'statusCode': 302,
            'headers': {
                'Location': getAuthorizeUri()
            },
            'body': ""
        }
        
    if (qsp is not None) and ("authorizecallback" in qsp) and (qsp['authorizecallback'] == "yes"):
        handleAuthorizeCallback(qsp)
        if ("code" in qsp):
            m = "You're now successfully authorized."
        else:
            m = "You have canceled authorization. Please authorize in order to use the xero reports."
        return {
            'statusCode': 200,
            'body': m
        }
        
    if (qsp is not None) and ("deletetenant" in qsp) and (qsp['deletetenant'] == "yes"):
        m = deleteTenant()
        return {
            'statusCode': 200,
            'body': m
        }
        
        
    resp = sendRequest(qsp=qsp)
    
    if (resp.status == 401):
        aToken = refreshAccessToken()
        resp = sendRequest(aToken, qsp)
        
    return {
        'statusCode': resp.status,
        'body': resp.data
    }

def sendRequest(aToken = None, qsp = None):
    xerotenantid = getTenantId()
    headers = None
    
    if aToken is not None:
        headers = prepareHeaders(aToken, xerotenantid)
    else:
        headers = prepareHeaders(getAccessToken(), xerotenantid)
    
    today = date.today()
    CurrentMonthDays = ((date(today.year,today.month,1) + relativedelta(months=1)) - date(today.year,today.month,1)).days
    CurrentMonthLastDate = date(today.year, today.month, CurrentMonthDays)
    
    fromYear = today.year
    toYear = today.year
    if(today.month <= 3):
        fromYear = fromYear - 1
    else:
        toYear = toYear + 1
    fromMonth = 4
    toMonth = 3
    fromDay = 1
    toDay = 31
    
    fields = {
        "fromDate": date(fromYear, fromMonth, fromDay),
        "toDate": date(toYear, toMonth, toDay),
    } 
    if (qsp is not None) and ("timeframe" in qsp):
        if (qsp["timeframe"] == "cm"): # Current Month
            fields["fromDate"] = date(today.year, today.month, 1)
            fields["toDate"] = CurrentMonthLastDate
            
        elif (qsp["timeframe"] == "cq"): # Currrent Quarter
            currquarter = (today.month-1)//3
            fields["fromDate"] = date(today.year, currquarter * 3 + 1, 1)
            fields["toDate"] = fields["fromDate"] + relativedelta(months=3) - relativedelta(days=1)
            
        elif (qsp["timeframe"] == "cfy"): # Currrent Quarter
            yearFix = -1 if today.month < 7 else 0
            fields["fromDate"] = date(today.year + yearFix, 7, 1)
            fields["toDate"] = fields["fromDate"] + relativedelta(months=12) - relativedelta(days=1)
            
        elif (qsp["timeframe"] == "lm"): # Last Month
            fields["fromDate"] = CurrentMonthLastDate - relativedelta(months=2) + relativedelta(days=1)
            fields["toDate"] = CurrentMonthLastDate - relativedelta(months=1)
            
        elif (qsp["timeframe"] == "lq"): # Last Quarter
            currquarter = (today.month-1)//3
            lastquarter = 3 if currquarter == 0 else currquarter - 1
            yearFix = -1 if currquarter == 0 else 0
            fields["fromDate"] = date(today.year + yearFix, lastquarter * 3 + 1, 1)
            fields["toDate"] = fields["fromDate"] + relativedelta(months=3) - relativedelta(days=1)
            
        elif (qsp["timeframe"] == "mtd"): # Month to date
            fields["fromDate"] = date(today.year, today.month, 1)
            fields["toDate"] = today
            
        elif (qsp["timeframe"] == "ytd"): # Year to date
            yearFix = -1 if today.month < 7 else 0
            fields["fromDate"] = date(today.year + yearFix, 7, 1)
            fields["toDate"] = today
        
    http = urllib3.PoolManager()
    resp = http.request("GET",'https://api.xero.com/api.xro/2.0/Reports/ProfitAndLoss?fromDate='+fields["fromDate"].strftime('%Y-%m-%d')+'&toDate='+fields["toDate"].strftime('%Y-%m-%d'), headers=headers)
    return resp
    
def prepareHeaders(aToken, xerotenantid):
    headers = {
      'Authorization': 'Bearer ' + aToken,
      'xero-tenant-id': xerotenantid,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
    return headers
    
def getDbValue(key, isMap = None):
    data = client.get_item(
        TableName='XeroCredits',
        Key={
        'id': {'S': key}
        },
        ProjectionExpression='#v',
        ExpressionAttributeNames={
            '#v': "value"
        }
    )
    if(isMap):
        val = data.get("Item").get("value").get("M")
    else:
        val = data.get("Item").get("value").get("S")
    return val
    
def updateDbValue(key, val, isMap = None):
    if isMap:
        valn = {"M": val}
    else:
        valn = {"S": str(val)}
        
    data = client.update_item(
        TableName='XeroCredits',
        Key={
            'id': {'S': key}
        },
        UpdateExpression="set #v = :r",
        ExpressionAttributeNames={
            '#v': "value"
        },
        ExpressionAttributeValues={
            ':r': valn,
        },
        ReturnValues="UPDATED_NEW"
        )
    return data
    
def getAccessToken():
    return getDbValue("access_token")
    
def updateAccessToken(val):
    return updateDbValue("access_token", val)
    
def getRefreshToken():
    return getDbValue("refresh_token")
    
def updateRefreshToken(val):
    return updateDbValue("refresh_token", val)
    
def getTenantId():
    return getDbValue("xerotenantid", True).get("tenantid").get("S")
    
def getTenantConnectionId():
    return getDbValue("xerotenantid", True).get("id").get("S")
    
def updateTenantId(val):
    return updateDbValue("xerotenantid", val, True)
    
def getClientId():
    return getDbValue("client_id")
    
def getClientSecret():
    return getDbValue("client_secret")
    
def refreshAccessToken():
    headers = {
      'grant_type': 'refresh_token',
      'Accept': 'application/json'
    }
    params = {
      'grant_type': 'refresh_token',
      'refresh_token': getRefreshToken(),
      'client_id': getClientId(),
      'client_secret': getClientSecret()
    }
    http = urllib3.PoolManager()
    resp = http.request("POST",'https://identity.xero.com/connect/token', fields=params, headers=headers)
    respJson = json.loads(resp.data)
    
    if "access_token" not in respJson:
        print(respJson)
        return None
    else:
        updateAccessToken(respJson.get("access_token"))
        updateRefreshToken(respJson.get("refresh_token"))
        return respJson.get("access_token") #, resp.data.refresh_token
        
def getAuthorizeUri():
    callbackUri = urllib.parse.quote("https://xec5rq4coevoybidpya5ajl36m0psgkj.lambda-url.us-east-1.on.aws/?authorizeCallback=yes", safe="")
    scopes = urllib.parse.quote("offline_access accounting.reports.read", safe="")
    cid = urllib.parse.quote(getClientId(), safe="")
    return "https://login.xero.com/identity/connect/authorize?response_type=code&client_id="+cid+"&redirect_uri="+callbackUri+"&scope="+scopes+"&state=12345678"
    
def handleAuthorizeCallback(qsp):
    if (qsp is not None) and ("code" in qsp):
        callbackUri = "https://xec5rq4coevoybidpya5ajl36m0psgkj.lambda-url.us-east-1.on.aws/?authorizeCallback=yes"
        headers = {
          'grant_type': 'authorization_code',
          'Accept': 'application/json'
        }
        params = {
          'grant_type': 'authorization_code',
          'code': qsp["code"],
          'client_id': getClientId(),
          'client_secret': getClientSecret(),
          'redirect_uri': callbackUri
        }
        http = urllib3.PoolManager()
        resp = http.request("POST",'https://identity.xero.com/connect/token', fields=params, headers=headers)
        respJson = json.loads(resp.data)
        
        if "access_token" not in respJson:
            print(respJson)
        else:
            updateAccessToken(respJson.get("access_token"))
            updateRefreshToken(respJson.get("refresh_token"))
            fetchTenants(respJson.get("access_token"))

def decodeJWT(token):
    payload = token.split(".")
    return json.loads(base64.b64decode(payload[1]))

def fetchTenants(aToken):
    headers = {
      'Authorization': 'Bearer ' + aToken,
      'Accept': 'application/json'
    }
    http = urllib3.PoolManager()
    resp = http.request("GET",'https://api.xero.com/connections', headers=headers)
    respJson = json.loads(resp.data)
    
    jwtAID = decodeJWT(aToken).get("authentication_event_id")
    if "tenantId" not in respJson[0]:
        print(respJson)
    else:
        for tenant in respJson:
            if tenant.get("authEventId") == jwtAID:
                updateTenantId({ 
                    "id" : {"S": tenant.get("id")},
                    "tenantid": {"S": tenant.get("tenantId")}
                })
            break
    return respJson
        
def deleteTenant():
    aToken = getAccessToken()
    tenantConnectionId = getTenantConnectionId()
    headers = {
      'Authorization': 'Bearer ' + aToken,
      'Accept': 'application/json'
    }
    http = urllib3.PoolManager()
    
    if len(tenantConnectionId) != 0:
        resp = http.request("DELETE", "https://api.xero.com/connections/" + tenantConnectionId, headers=headers)
        updateTenantId({ 
                "id" : {"S": ""},
                "tenantid": {"S": ""}
            })
    
    resp = http.request("GET",'https://api.xero.com/connections', headers=headers)
    respJson = json.loads(resp.data)
    return respJson
  
