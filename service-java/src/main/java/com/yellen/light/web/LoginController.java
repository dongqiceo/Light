package com.yellen.light.web;

import static com.yellen.light.util.ApiJson.*;

import com.yellen.light.entity.User;
import com.yellen.light.service.UserService;
import com.yellen.light.service.UserService.LoginResult;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户登录控制器
 */
@RestController
@RequestMapping("/api/v1")
public class LoginController {

  @Autowired
  private UserService userService;

  /**
   * 登录接口
   */
  @PostMapping("/login")
  public Map<String, Object> login(@RequestBody LoginRequest request) {
    if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
      return cmsErr("用户名不能为空", 401);
    }
    if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
      return cmsErr("密码不能为空", 401);
    }

    LoginResult result = userService.login(request.getUsername().trim(), request.getPassword());
    if (!result.success) {
      return cmsErr(result.message, 401);
    }

    Map<String, Object> userData = Map.of(
        "id", result.user.getId(),
        "name", result.user.getName(),
        "nickName", result.user.getNickName(),
        "gender", result.user.getGender()
    );

    return cmsOk(Map.of(
        "token", result.token,
        "user", userData
    ), "登录成功");
  }

  /**
   * 登出接口
   */
  @PostMapping("/logout")
  public Map<String, Object> logout(@RequestHeader(value = "Authorization", required = false) String token) {
    if (token != null && token.startsWith("Bearer ")) {
      token = token.substring(7);
    }
    userService.logout(token);
    return cmsOk(null, "登出成功");
  }

  /**
   * 获取当前用户信息接口
   */
  @PostMapping("/user/current")
  public Map<String, Object> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
    if (token == null || token.trim().isEmpty()) {
      return cmsErr("未登录", 401);
    }

    if (token.startsWith("Bearer ")) {
      token = token.substring(7);
    }

    User user = userService.getUserByToken(token);
    if (user == null) {
      return cmsErr("token 无效或已过期", 401);
    }

    Map<String, Object> userData = Map.of(
        "id", user.getId(),
        "username", user.getUsername(),
        "name", user.getName(),
        "nickName", user.getNickName(),
        "gender", user.getGender()
    );

    return cmsOk(userData, "获取成功");
  }

  /**
   * 登录请求数据类
   */
  public static class LoginRequest {
    private String username;
    private String password;

    public String getUsername() {
      return username;
    }

    public void setUsername(String username) {
      this.username = username;
    }

    public String getPassword() {
      return password;
    }

    public void setPassword(String password) {
      this.password = password;
    }
  }
}
