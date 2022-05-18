package com.example.server;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.token.store.InMemoryTokenStore;

@Configuration
@EnableAuthorizationServer
public class OAuth2AuthorizationConfig extends AuthorizationServerConfigurerAdapter {
    private static final String RESOURCE_ID = "test";

    AuthenticationManager authenticationManager;

    UserDetailsService userDetailsService;

    public AuthenticationManager getAuthenticationManager() {
        return authenticationManager;
    }

    @Autowired
    public void setAuthenticationManager(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    public UserDetailsService getUserDetailsService() {
        return userDetailsService;
    }

    @Autowired
    public void setUserDetailsService(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    /**
     * 1.授权码模式 authorization_code（authorization code）
     * 经典”的OAuth 2.0流，用户被要求通过重定向同意。客户端应用程序被强烈认证，因为它必须发送其所有凭据（client_id + client_secret + redirect_uri）才能获得令牌
     * <p>
     * 2.简化模式 implicit（implicit）
     * 与authorization_code几乎相同，但对于公共客户端（网络应用程序或已安装/移动应用程序）。从用户的角度来看，流程几乎相同，但采用较弱的客户端身份验证。 redirect_uri是唯一的安全性，因为客户端通过重定向+请求参数接收访问令牌
     * <p>
     * 3.密码模式 password（resource owner password credentials）
     * 客户端应用程序收集用户凭据，并换取令牌同时发送用户凭据（username + password）和自己的凭据（client_id + client_secret）。这种流程将授权与身份验证混合在一起，只能在没有其他选择的情况下使用（即您自己的已安装/移动应用程序，您不希望用户在原生应用程序和浏览器之间来回切换）。您应该从不允许第三方使用此流程
     * <p>
     * 4.客户端模式 client_credentials（client credentials）
     * client_credentials授予是不同的，因为它不涉及用户。这是对HTTP Basic的替代。
     * 对于每个请求，您的客户端不会发送用户名（client_id）+密码（client_secret），您的客户端会发送凭证以换取令牌。
     * 一些例子：
     * 一个命令行应用程序（批次）或工作进程消耗固定服务。这种应用程序可能一次处理大量的用户数据，并且不能请求每个用户的同意。被调用的服务必须知道“谁”正在调用以允许客户端应用程序访问任何东西。
     * 您的API的第三方/外部客户想知道未链接到用户数据的信息（例如：使用状态，配额，结算...）
     * 具有特殊权限的第三方/外部客户可以访问所有用户的数据
     */
    @Override
    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
        // grant_type=client_credentials时，请求的响应中不包含refresh_token
        // 而grant_type为password则包含refresh_token
        // 在Account创建之前，不存在authenticated user，这种场景下用grant_type=client_credentials时比较合适
        // grant_type=password的情况下，请求access token时，需要在HTTP请求里加上client_id和client_secret两个参数

        // oauth2官方只有4种授权方式，不过spring security oauth2把refresh token也归为authorizedGrantTypes的一种

        // Spring Security 5.x 更改了密码格式，需要指明密码加密方式，明文需要指定前缀{noop}
        // String finalSecret = "{bcrypt}" + new BCryptPasswordEncoder().encode("123456");

        clients.inMemory()
                .withClient("client_1")
                .resourceIds(RESOURCE_ID)
                .authorizedGrantTypes("client_credentials", "refresh_token", "password")
               // .secret(finalSecret)
                .secret("{noop}123456")
                .scopes("all")
                .authorities("USER")
                .accessTokenValiditySeconds(10).refreshTokenValiditySeconds(60);

        // 测试
        // http://localhost:8888/oauth/token?grant_type=client_credentials&scope=all&client_id=client_1&client_secret=123456

        // http://localhost:8888/oauth/token?grant_type=password&scope=all&username=admin&password=123456&client_id=client_1&client_secret=123456
        // 刷新令牌
        // http://localhost:8888/oauth/token?refresh_token=XXXX&grant_type=refresh_token&scope=all&client_id=client_1&client_secret=123456
    }

    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
        endpoints
                .tokenStore(new InMemoryTokenStore()) // InMemoryTokenStore是OAuth2默认实现
                .authenticationManager(authenticationManager)
                .userDetailsService(userDetailsService)
                .allowedTokenEndpointRequestMethods(HttpMethod.GET, HttpMethod.POST);
    }

    /**
     * oauth/token
     * 这个如果配置支持allowFormAuthenticationForClients的，且url中有client_id和client_secret的会走ClientCredentialsTokenEndpointFilter来保护
     * 如果没有支持allowFormAuthenticationForClients或者有支持但是url中没有client_id和client_secret的，走basic认证保护
     */
    @Override
    public void configure(AuthorizationServerSecurityConfigurer security) throws Exception {
        security.allowFormAuthenticationForClients().tokenKeyAccess("isAuthenticated()")
                .checkTokenAccess("permitAll()");
    }
}
