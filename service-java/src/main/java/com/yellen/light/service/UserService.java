package com.yellen.light.service;

import com.yellen.light.entity.User;
import com.yellen.light.repository.UserRepository;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 用户服务层 - 处理登录、token 验证等业务逻辑
 */
@Service
public class UserService {

  @Autowired
  private UserRepository userRepository;

  // 简单的 token 存储，实际项目应使用 Redis 或 JWT
  private final ConcurrentHashMap<String, TokenInfo> tokenMap = new ConcurrentHashMap<>();

  // token 过期时间（7天）
  private static final long TOKEN_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000L;

  /**
   * 用户登录
   */
  public LoginResult login(String username, String password) {
    User user = userRepository.findByUsername(username);
    if (user == null) {
      return new LoginResult(false, "用户不存在", null, null);
    }

    // 简单密码验证，实际项目应使用 BCrypt 等加密方式
    if (!user.getPassword().equals(password)) {
      return new LoginResult(false, "密码错误", null, null);
    }

    if (!user.isActive()) {
      return new LoginResult(false, "用户已被禁用", null, null);
    }

    // 生成 token
    String token = generateToken();
    TokenInfo tokenInfo = new TokenInfo(user.getId(), user.getUsername(), System.currentTimeMillis() + TOKEN_EXPIRE_TIME);
    tokenMap.put(token, tokenInfo);

    // 返回用户信息（不包括密码）
    return new LoginResult(true, "登录成功", token, user);
  }

  /**
   * 验证 token 是否有效
   */
  public boolean validateToken(String token) {
    if (token == null) {
      return false;
    }
    TokenInfo info = tokenMap.get(token);
    if (info == null) {
      return false;
    }
    if (System.currentTimeMillis() > info.expireTime) {
      tokenMap.remove(token);
      return false;
    }
    return true;
  }

  /**
   * 根据 token 获取用户信息
   */
  public User getUserByToken(String token) {
    if (!validateToken(token)) {
      return null;
    }
    TokenInfo info = tokenMap.get(token);
    return userRepository.findById(info.userId);
  }

  /**
   * 登出
   */
  public void logout(String token) {
    if (token != null) {
      tokenMap.remove(token);
    }
  }

  public boolean updateAvatar(String token, String avatar) {
    User user = getUserByToken(token);
    if (user == null || avatar == null || avatar.isBlank()) {
      return false;
    }
    userRepository.updateAvatar(user.getId(), avatar);
    return true;
  }

  public PasswordResult changePassword(String token, String currentPassword, String newPassword,
      String confirmPassword, boolean initialSetup) {
    User user = getUserByToken(token);
    if (user == null) {
      return new PasswordResult(false, "token 无效或已过期");
    }
    if (newPassword == null || newPassword.length() < 8) {
      return new PasswordResult(false, "新密码至少需要 8 位");
    }
    if (!newPassword.equals(confirmPassword)) {
      return new PasswordResult(false, "两次输入的新密码不一致");
    }
    if (initialSetup && !user.isMustChangePassword()) {
      return new PasswordResult(false, "当前账号不需要首次设置密码");
    }
    if (!initialSetup && (currentPassword == null || !currentPassword.equals(user.getPassword()))) {
      return new PasswordResult(false, "当前密码错误");
    }
    userRepository.updatePassword(user.getId(), newPassword);
    logout(token);
    return new PasswordResult(true, "密码修改成功");
  }

  /**
   * 生成随机 token
   */
  private String generateToken() {
    return UUID.randomUUID().toString().replace("-", "");
  }

  /**
   * Token 信息内部类
   */
  private static class TokenInfo {
    long userId;
    String username;
    long expireTime;

    TokenInfo(long userId, String username, long expireTime) {
      this.userId = userId;
      this.username = username;
      this.expireTime = expireTime;
    }
  }

  /**
   * 登录结果类
   */
  public static class LoginResult {
    public boolean success;
    public String message;
    public String token;
    public User user;

    public LoginResult(boolean success, String message, String token, User user) {
      this.success = success;
      this.message = message;
      this.token = token;
      this.user = user;
    }
  }

  public static class PasswordResult {
    public boolean success;
    public String message;

    public PasswordResult(boolean success, String message) {
      this.success = success;
      this.message = message;
    }
  }
}
