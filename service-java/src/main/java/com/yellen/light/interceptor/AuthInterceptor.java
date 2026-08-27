package com.yellen.light.interceptor;

import com.yellen.light.service.UserService;
import com.yellen.light.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 认证拦截器 - 检查 token 有效性
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

  @Autowired
  private UserService userService;

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {
    String token = request.getHeader("Authorization");
    if (token != null && token.startsWith("Bearer ")) {
      token = token.substring(7);
    }

    if (token == null || !userService.validateToken(token)) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.setContentType("application/json;charset=utf-8");
      response.getWriter().write("{\"code\":401,\"message\":\"未授权或token已过期\",\"data\":null}");
      return false;
    }

    User user = userService.getUserByToken(token);
    String path = request.getRequestURI();
    boolean allowedDuringInitialSetup = path.endsWith("/user/current")
        || path.endsWith("/user/password/initial") || path.endsWith("/logout");
    if (user != null && user.isMustChangePassword() && !allowedDuringInitialSetup) {
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.setContentType("application/json;charset=utf-8");
      response.getWriter().write("{\"code\":403,\"message\":\"请先设置新密码\",\"data\":null}");
      return false;
    }

    return true;
  }
}
