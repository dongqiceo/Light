package com.yellen.light.config;

import com.yellen.light.util.ProductPrices;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;

public class ProductPriceSchemaInitializer
    implements ApplicationContextInitializer<ConfigurableApplicationContext>, Ordered {

  private static final Logger log = LoggerFactory.getLogger(ProductPriceSchemaInitializer.class);

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE + 10;
  }

  @Override
  public void initialize(ConfigurableApplicationContext context) {
    ConfigurableEnvironment env = context.getEnvironment();
    String url = env.getProperty("spring.datasource.url");
    if (url == null || url.isBlank() || !url.startsWith("jdbc:sqlite:")) {
      throw new IllegalStateException("无法迁移产品价格：spring.datasource.url 不是 sqlite JDBC");
    }
    try {
      Class.forName("org.sqlite.JDBC");
    } catch (ClassNotFoundException e) {
      throw new IllegalStateException("无法加载 sqlite 驱动", e);
    }
    try (Connection conn = DriverManager.getConnection(url)) {
      conn.setAutoCommit(false);
      try (Statement pragma = conn.createStatement()) {
        pragma.execute("PRAGMA busy_timeout=5000");
      }
      ensureColumn(conn);
      backfill(conn);
      conn.commit();
    } catch (Exception e) {
      throw new IllegalStateException("产品多语言价格 schema 迁移失败", e);
    }
  }

  private static void ensureColumn(Connection conn) throws Exception {
    boolean exists = false;
    try (Statement st = conn.createStatement();
        ResultSet rs = st.executeQuery("PRAGMA table_info(products)")) {
      while (rs.next()) {
        if ("price_i18n".equalsIgnoreCase(rs.getString("name"))) {
          exists = true;
          break;
        }
      }
    }
    if (!exists) {
      try (Statement st = conn.createStatement()) {
        st.execute("ALTER TABLE products ADD COLUMN price_i18n TEXT");
      }
      log.info("已为 products 增加 price_i18n 列");
    }
  }

  private static void backfill(Connection conn) throws Exception {
    try (Statement st = conn.createStatement();
        ResultSet rs =
            st.executeQuery(
                "SELECT id, price FROM products WHERE price_i18n IS NULL OR trim(price_i18n) = ''");
        PreparedStatement upd =
            conn.prepareStatement("UPDATE products SET price_i18n = ? WHERE id = ?")) {
      while (rs.next()) {
        long id = rs.getLong("id");
        BigDecimal legacy = rs.getBigDecimal("price");
        String json;
        if (legacy == null) {
          log.warn("产品 {} 旧价格为空，写入空的三语言价格，需在 CMS 补录", id);
          json = ProductPrices.nullI18nJson();
        } else {
          String canonical = ProductPrices.fromLegacyReal(legacy);
          Map<String, String> prices = new LinkedHashMap<>();
          prices.put("zh", canonical);
          prices.put("en", canonical);
          prices.put("ar", canonical);
          json = ProductPrices.toJson(prices);
        }
        upd.setString(1, json);
        upd.setLong(2, id);
        upd.executeUpdate();
      }
    }
  }
}
