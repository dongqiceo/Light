package com.yellen.light.config;

import java.sql.Connection;
import java.sql.DriverManager;
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
              + "active INTEGER DEFAULT 1,"
              + "create_time INTEGER,"
              + "update_time INTEGER"
              + ")");

      // 初始插入默认用户（如果表为空）
      stmt.execute("INSERT OR IGNORE INTO users (username, password, name, nick_name, create_time, update_time)"
          + " SELECT 'admin', 'admin123', 'Admin', 'Admin', " + System.currentTimeMillis() + ", "
          + System.currentTimeMillis()
          + " WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')");
    }
  }
}
