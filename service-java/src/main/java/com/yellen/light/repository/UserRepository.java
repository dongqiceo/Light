package com.yellen.light.repository;

import com.yellen.light.entity.User;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

/**
 * 用户数据访问层
 */
@Repository
public class UserRepository {

  @Value("${spring.datasource.url}")
  private String dbUrl;

  public User findByUsername(String username) {
    String sql = "SELECT * FROM users WHERE username = ? AND active = 1";
    try (Connection conn = DriverManager.getConnection(dbUrl);
        PreparedStatement pstmt = conn.prepareStatement(sql)) {
      pstmt.setString(1, username);
      try (ResultSet rs = pstmt.executeQuery()) {
        if (rs.next()) {
          return mapUser(rs);
        }
      }
    } catch (Exception e) {
      throw new RuntimeException("Failed to find user by username", e);
    }
    return null;
  }

  public User findById(long id) {
    String sql = "SELECT * FROM users WHERE id = ? AND active = 1";
    try (Connection conn = DriverManager.getConnection(dbUrl);
        PreparedStatement pstmt = conn.prepareStatement(sql)) {
      pstmt.setLong(1, id);
      try (ResultSet rs = pstmt.executeQuery()) {
        if (rs.next()) {
          return mapUser(rs);
        }
      }
    } catch (Exception e) {
      throw new RuntimeException("Failed to find user by id", e);
    }
    return null;
  }

  public long save(User user) {
    String sql = "INSERT INTO users (username, password, name, nick_name, gender, must_change_password, create_time, update_time) "
      + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    try (Connection conn = DriverManager.getConnection(dbUrl);
        PreparedStatement pstmt =
            conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
      pstmt.setString(1, user.getUsername());
      pstmt.setString(2, user.getPassword());
      pstmt.setString(3, user.getName());
      pstmt.setString(4, user.getNickName());
      pstmt.setString(5, user.getGender());
      pstmt.setInt(6, user.isMustChangePassword() ? 1 : 0);
      pstmt.setLong(7, user.getCreateTime());
      pstmt.setLong(8, user.getUpdateTime());
      pstmt.executeUpdate();
      try (ResultSet rs = pstmt.getGeneratedKeys()) {
        if (rs.next()) {
          return rs.getLong(1);
        }
      }
    } catch (Exception e) {
      throw new RuntimeException("Failed to save user", e);
    }
    return -1;
  }

  public void update(User user) {
    String sql = "UPDATE users SET password = ?, name = ?, nick_name = ?, gender = ?, update_time = ? "
        + "WHERE id = ?";
    try (Connection conn = DriverManager.getConnection(dbUrl);
        PreparedStatement pstmt = conn.prepareStatement(sql)) {
      pstmt.setString(1, user.getPassword());
      pstmt.setString(2, user.getName());
      pstmt.setString(3, user.getNickName());
      pstmt.setString(4, user.getGender());
      pstmt.setLong(5, System.currentTimeMillis());
      pstmt.setLong(6, user.getId());
      pstmt.executeUpdate();
    } catch (Exception e) {
      throw new RuntimeException("Failed to update user", e);
    }
  }

  public void updatePassword(long userId, String password) {
    String sql = "UPDATE users SET password = ?, must_change_password = 0, update_time = ? WHERE id = ?";
    try (Connection conn = DriverManager.getConnection(dbUrl);
        PreparedStatement pstmt = conn.prepareStatement(sql)) {
      pstmt.setString(1, password);
      pstmt.setLong(2, System.currentTimeMillis());
      pstmt.setLong(3, userId);
      pstmt.executeUpdate();
    } catch (Exception e) {
      throw new RuntimeException("Failed to update user password", e);
    }
  }

  public void updateAvatar(long userId, String avatar) {
    String sql = "UPDATE users SET avatar = ?, update_time = ? WHERE id = ?";
    try (Connection conn = DriverManager.getConnection(dbUrl);
        PreparedStatement pstmt = conn.prepareStatement(sql)) {
      pstmt.setString(1, avatar);
      pstmt.setLong(2, System.currentTimeMillis());
      pstmt.setLong(3, userId);
      pstmt.executeUpdate();
    } catch (Exception e) {
      throw new RuntimeException("Failed to update user avatar", e);
    }
  }

  private User mapUser(ResultSet rs) throws Exception {
    User user = new User();
    user.setId(rs.getLong("id"));
    user.setUsername(rs.getString("username"));
    user.setPassword(rs.getString("password"));
    user.setName(rs.getString("name"));
    user.setNickName(rs.getString("nick_name"));
    user.setGender(rs.getString("gender"));
    user.setAvatar(rs.getString("avatar"));
    user.setCreateTime(rs.getLong("create_time"));
    user.setUpdateTime(rs.getLong("update_time"));
    user.setActive(rs.getInt("active") == 1);
    user.setMustChangePassword(rs.getInt("must_change_password") == 1);
    return user;
  }
}
