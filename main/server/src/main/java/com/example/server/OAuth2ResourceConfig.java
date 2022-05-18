package com.example.server;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;

@Configuration
@EnableResourceServer
public class OAuth2ResourceConfig extends ResourceServerConfigurerAdapter {
    private static final String RESOURCE_ID = "test";

    /**
     * 在每个ResourceServer实例上设置resourceId，该resourceId作为该服务资源的唯一标识
     */
    @Override
    public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
        resources.resourceId(RESOURCE_ID);
    }

    /**
     * .permitAll()将配置授权,以便在该特定路径上允许所有请求(来自匿名用户和登录用户).
     * .anonymous()表达式主要是指用户的状态(已登录或未登录).
     * 基本上,直到用户被“认证”为止,它就是“匿名用户”.就像每个人都有“默认角色”一样.
     */
    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .and()
                .requestMatchers()
                .anyRequest()
                .and()
                .authorizeRequests()
                .antMatchers("/test/**")
                .permitAll()
                .and()
                .authorizeRequests()
                .antMatchers("/auth/**")
                .authenticated();
    }
}
