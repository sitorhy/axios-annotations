package com.example.servernext;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Configuration
@EnableWebSecurity
public class AuthorizationServerConfig {

    @Bean
    @Order(1) // 优先级
    // 专门处理 OAuth2 规范定义的那些“固定接口”。
    // 例如 /oauth2/token（换令牌）、/oauth2/authorize（浏览器跳转请求）、/.well-known/jwks.json（公开密钥）。
    // /oauth2/token 是框架加的固定路由前缀
    public SecurityFilterChain authServerFilterChain(HttpSecurity http) throws Exception {
        // 1. 创建授权服务器的配置器
        OAuth2AuthorizationServerConfigurer authorizationServerConfigurer =
                new OAuth2AuthorizationServerConfigurer();

        // 2. 启用 OpenID Connect 1.0 (可选)
        authorizationServerConfigurer
                .oidc(Customizer.withDefaults());

        // 3. 获取授权服务器端点的端点映射器并应用配置
        RequestMatcher endpointsMatcher = authorizationServerConfigurer.getEndpointsMatcher();

        http
                .cors(Customizer.withDefaults()) // 👈 必须开启
                .securityMatcher(endpointsMatcher) // 仅拦截授权服务器相关的请求（如 /oauth2/token）
                .authorizeHttpRequests(authorize ->
                        authorize.anyRequest().authenticated()
                )
                .csrf(csrf -> csrf.ignoringRequestMatchers(endpointsMatcher)) // 禁用 OAuth2 端点的 CSRF
                .apply(authorizationServerConfigurer); // 将配置应用到 HttpSecurity

        // 4. 配置未登录时的重定向（跳到登录页）

        http.exceptionHandling((exceptions) -> {
                    exceptions
                            .defaultAuthenticationEntryPointFor(
                                    new LoginUrlAuthenticationEntryPoint("/login"),
                                    new MediaTypeRequestMatcher(MediaType.TEXT_HTML)
                            );
                }
        );

        return http.build();
    }

    @Bean
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) // 👈 必须开启
                .authorizeHttpRequests(authorize -> authorize
                        // 将这些特殊的系统路径设为允许，防止被拦截存入 SavedRequest
                        // .well-known/appspecific/com.chrome.devtools.jso 该请求由Chrome DevTools自动发起，仅在localhost环境下触发，目的是尝试获取Chrome工作区自动映射的配置文件
                        .requestMatchers("/.well-known/**", "/favicon.ico", "/error").permitAll()
                        .requestMatchers("/api/**").authenticated() // API 必须认证
                        .anyRequest().authenticated()
                )
                // 💡 针对不同类型的请求，给出不同的“未登录”反应
                .exceptionHandling(exceptions -> exceptions
                        // 1. 如果请求地址包含 /api/，则直接返回 401
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                // 使用这个静态方法通常比 new AntPathRequestMatcher 更稳健
                                request -> request.getRequestURI().startsWith("/api")
                        )
                        // 2. 如果请求是获取 HTML (比如浏览器直接访问)，则重定向到登录页
                        .defaultAuthenticationEntryPointFor(
                                new LoginUrlAuthenticationEntryPoint("/login"),
                                new MediaTypeRequestMatcher(MediaType.TEXT_HTML)
                        )
                )
                // 💡 核心：必须配置资源服务器，否则它不会去解析 Axios 传来的 Token
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .formLogin(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient loaderClient = RegisteredClient.withId(UUID.randomUUID().toString())
                // （委托密码编码器）noop 代表 No Operation（无操作）。
                .clientId("test-client")
                // {noop}表示明文，仅限测试
                .clientSecret("{noop}test-secret")
                // CLIENT_SECRET_BASIC 规定了 Client ID 和 Client Secret 必须放在 HTTP 请求的 Header（请求头） 中。
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                // AUTHORIZATION_CODE (授权码模式)
                // 用户登录后，服务器先发一个短命的“授权码（Code）”，客户端再拿这个 Code + ClientSecret 去换取 Access Token。
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                // REFRESH_TOKEN (刷新令牌模式)
                // 允许客户端在 Access Token 过期后，不需要让用户重新输入账号密码，直接用 Refresh Token 换取一个新的 Access Token。
                // 必须开启 不开启只有 access_token
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                // 第一次登录拿 Token，精确匹配 前端的 redirect_uri 参数
                // 后端会携带 code 查询参数跳转，前端需要截取地址获取 code
                .redirectUri("http://localhost:5173")
                .scope(OidcScopes.OPENID)
                // 权限 自定义字符串 谁便定义
                .scope("read")
                // 关键：设置 Token 有效期
                .tokenSettings(TokenSettings.builder()
                        .accessTokenTimeToLive(Duration.ofMinutes(1)) // 设置短一点，方便测试 Axios 拦截
                        .refreshTokenTimeToLive(Duration.ofDays(1))  // 刷新令牌设长一点
                        .reuseRefreshTokens(false) // 每次刷新是否更换新的 Refresh Token
                        .build())
                .build();

        return new InMemoryRegisteredClientRepository(loaderClient);
    }

    @Bean
    public UserDetailsService userDetailsService() {
        // 这里定义的是“人”登录时用的账号密码
        UserDetails user = User.withUsername("admin")
                .password("{noop}123456") // 用户密码
                .roles("USER")
                .build();
        return new InMemoryUserDetailsManager(user);
    }

    // 用于生成 JWT 签名的 JWK 密钥对
    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        KeyPair keyPair = generateRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(UUID.randomUUID().toString())
                .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    private static KeyPair generateRsaKey() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            return keyPairGenerator.generateKeyPair();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*")); // 你的前端地址
        configuration.setAllowedMethods(List.of("*"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}