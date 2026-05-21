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
    // 不拦截登录接口
    registry.addInterceptor(authInterceptor)
        .addPathPatterns("/light-cms/**", "/api/**")
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
