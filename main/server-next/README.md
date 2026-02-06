 内置接口说明

## 获取授权码
> /oauth2/authorize
> 带上 client_id, response_type=code 等
```javascript
// ❌ 错误做法：使用 Axios
// axios.get('http://localhost:8080/oauth2/authorize?client_id=...'); 

// ✅ 正确做法：直接修改 window.location
const authUrl = `http://localhost:8080/oauth2/authorize?` + 
                `response_type=code&` +
                `client_id=test-client&` +
                `scope=read&` +
                `redirect_uri=http://localhost:3000/callback`;

window.location.href = authUrl; // 这样不会有跨域问题
```


## 换取令牌
> /oauth2/token
> grant_type=authorization_code


## 刷新令牌
> /oauth2/token
> grant_type=refresh_token