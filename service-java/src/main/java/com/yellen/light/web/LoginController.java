package com.yellen.light.web;

import static com.yellen.light.util.ApiJson.*;

import com.yellen.light.entity.User;
import com.yellen.light.service.UserService;
import com.yellen.light.service.UserService.LoginResult;
import com.yellen.light.service.UserService.PasswordResult;
import java.util.Map;
import java.util.LinkedHashMap;
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

    Map<String, Object> userData = userData(result.user);

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

    Map<String, Object> userData = userData(user);

    return cmsOk(userData, "获取成功");
  }

  @PostMapping("/user/password/initial")
  public Map<String, Object> initialPassword(@RequestHeader(value = "Authorization", required = false) String token,
      @RequestBody PasswordRequest request) {
    PasswordResult result = userService.changePassword(extractToken(token), null,
        request.getNewPassword(), request.getConfirmPassword(), true);
    return result.success ? cmsOk(null, result.message) : cmsErr(result.message, 400);
  }

  @PostMapping("/user/password/change")
  public Map<String, Object> changePassword(@RequestHeader(value = "Authorization", required = false) String token,
      @RequestBody PasswordRequest request) {
    PasswordResult result = userService.changePassword(extractToken(token), request.getCurrentPassword(),
        request.getNewPassword(), request.getConfirmPassword(), false);
    return result.success ? cmsOk(null, result.message) : cmsErr(result.message, 400);
  }

  private String extractToken(String authorization) {
    if (authorization != null && authorization.startsWith("Bearer ")) {
      return authorization.substring(7);
    }
    return authorization;
  }

  private Map<String, Object> userData(User user) {
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", user.getId());
    data.put("username", user.getUsername());
    data.put("name", user.getName());
    data.put("nickName", user.getNickName());
    data.put("gender", user.getGender());
    data.put("avatar", user.getAvatar());
    data.put("mustChangePassword", user.isMustChangePassword());
    return data;
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

  public static class PasswordRequest {
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
  }
}
