package com.yellen.light.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

/**
 * SQLite 用户表初始化器
 */
@Component
public class UserTableInitializer implements ApplicationListener<ContextRefreshedEvent> {

  @Value("${spring.datasource.url}")
  private String dbUrl;

  @Override
  public void onApplicationEvent(ContextRefreshedEvent event) {
    try (Connection conn = DriverManager.getConnection(dbUrl)) {
      initUserTable(conn);
    } catch (Exception e) {
      throw new RuntimeException("Failed to initialize user table", e);
    }
  }

  private void initUserTable(Connection conn) throws Exception {
    try (Statement stmt = conn.createStatement()) {
      // 创建用户表
      stmt.execute(
          "CREATE TABLE IF NOT EXISTS users ("
              + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
              + "username TEXT NOT NULL UNIQUE,"
              + "password TEXT NOT NULL,"
              + "name TEXT,"
              + "nick_name TEXT,"
              + "gender TEXT DEFAULT 'MALE',"
              + "avatar TEXT,"
              + "active INTEGER DEFAULT 1,"
              + "must_change_password INTEGER DEFAULT 1,"
              + "create_time INTEGER,"
              + "update_time INTEGER"
              + ")");

      if (!hasColumn(conn, "must_change_password")) {
        stmt.execute("ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 1");
      }
      if (!hasColumn(conn, "avatar")) {
        stmt.execute("ALTER TABLE users ADD COLUMN avatar TEXT");
      }

      // 初始插入默认用户（如果表为空）
      stmt.execute("INSERT OR IGNORE INTO users (username, password, name, nick_name, must_change_password, create_time, update_time)"
          + " SELECT 'admin', 'admin123', 'Admin', 'Admin', 1, " + System.currentTimeMillis() + ", "
          + System.currentTimeMillis()
          + " WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')");
    }
  }

  private boolean hasColumn(Connection conn, String columnName) throws Exception {
    try (Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("PRAGMA table_info(users)")) {
      while (rs.next()) {
        if (columnName.equalsIgnoreCase(rs.getString("name"))) {
          return true;
        }
      }
    }
    return false;
  }
}
