package com.yellen.light.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.yellen.light.interceptor.AuthInterceptor;

/**
 * Web MVC 配置 - 注册拦截器和 CORS 等
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

  @Autowired
  private AuthInterceptor authInterceptor;

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    // 仅拦截 CMS 和后台登录保护接口，不拦截公开 H5 API
    registry.addInterceptor(authInterceptor)
        .addPathPatterns("/light-cms/**", "/api/v1/**")
        .excludePathPatterns("/api/v1/login", "/api/v1/logout", "/health");
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOriginPatterns("*")
        .allowedMethods("*")
        .allowedHeaders("*")
        .allowCredentials(true);
  }
}
