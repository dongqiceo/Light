package com.yellen.light.config;

import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Value("${light.static-path}")
  private String staticPath;

  @Value("${light.assets-path}")
  private String assetsPath;

  @Value("${light.upload-dir}")
  private String uploadDir;

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**").allowedOriginPatterns("*").allowedMethods("*").allowedHeaders("*");
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String assetsLoc = Path.of(assetsPath).toAbsolutePath().normalize().toUri().toString();
    if (!assetsLoc.endsWith("/")) {
      assetsLoc = assetsLoc + "/";
    }
    registry.addResourceHandler("/assets/**").addResourceLocations(assetsLoc);

    String uploadLoc = Path.of(uploadDir).toAbsolutePath().normalize().toUri().toString();
    if (!uploadLoc.endsWith("/")) {
      uploadLoc = uploadLoc + "/";
    }
    registry.addResourceHandler("/uploads/**").addResourceLocations(uploadLoc);

    String location = Path.of(staticPath).toAbsolutePath().normalize().toUri().toString();
    if (!location.endsWith("/")) {
      location = location + "/";
    }
    registry.addResourceHandler("/**").addResourceLocations(location);
  }
}
