package com.yellen.light.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ContactMessagesSchemaInitializer implements ApplicationRunner {

  private static final String DDL =
      "CREATE TABLE IF NOT EXISTS contact_messages ("
          + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
          + "name TEXT NOT NULL, "
          + "email TEXT NOT NULL, "
          + "country TEXT, "
          + "tel TEXT, "
          + "whatsapp TEXT, "
          + "company TEXT, "
          + "message TEXT NOT NULL, "
          + "created_at TEXT DEFAULT (datetime('now', 'localtime'))"
          + ")";

  private final JdbcTemplate jdbc;

  public ContactMessagesSchemaInitializer(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public void run(ApplicationArguments args) {
    jdbc.execute(DDL);
  }
}
