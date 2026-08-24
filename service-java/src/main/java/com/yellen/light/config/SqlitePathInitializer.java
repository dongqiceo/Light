package com.yellen.light.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * IntelliJ 运行配置的工作目录可能是仓库根 {@code Light-main} 或模块根 {@code service-java}，
 * 相对路径 {@code ../../services/...} 会失效。优先使用 {@code service-java/data/light.db}，再回退旧路径。
 */
public class SqlitePathInitializer
    implements ApplicationContextInitializer<ConfigurableApplicationContext>, Ordered {

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE;
  }

  private static final String PROP_DS_URL = "spring.datasource.url";
  private static final String PROP_STATIC = "light.static-path";
  private static final String PROP_UPLOAD = "light.upload-dir";
  private static final String PROP_ASSETS = "light.assets-path";

  @Override
  public void initialize(ConfigurableApplicationContext context) {
    ConfigurableEnvironment env = context.getEnvironment();
    if (env.getProperty("LIGHT_DB_PATH") != null && !env.getProperty("LIGHT_DB_PATH").isBlank()) {
      return;
    }
    String userDir = System.getProperty("user.dir");
    if (userDir == null) {
      return;
    }
    Path base = Path.of(userDir).toAbsolutePath().normalize();
    String dirName = base.getFileName() != null ? base.getFileName().toString() : "";
    boolean fromModule =
        "service-java".equals(dirName) || "light-service".equals(dirName);

    Path dbFromRoot = base.resolve("service-java/data/light.db").normalize();
    Path dbFromModule = base.resolve("data/light.db").normalize();
    Path dbLegacyRoot = base.resolve("java/light-service/data/light.db").normalize();
    Path dbServices1 = base.resolve("services/data/light.db").normalize();
    Path dbServices2 = base.resolve("../../services/data/light.db").normalize();

    Path pubFromRoot = base.resolve("service-java/light/public").normalize();
    Path pubFromModule = base.resolve("light/public").normalize();
    Path pubLegacy1 = base.resolve("light/public").normalize();
    Path pubLegacy2 = base.resolve("../../light/public").normalize();

    Path defaultDb = fromModule ? dbFromModule : dbFromRoot;
    Path db =
        firstExistingOrDefault(
            new Path[] {dbFromRoot, dbFromModule, dbLegacyRoot, dbServices1, dbServices2},
            defaultDb);
    ensureParentDir(db);

    Path defaultPub = fromModule ? pubFromModule : pubFromRoot;
    Path pub =
        firstExistingOrDefault(
            new Path[] {pubFromRoot, pubFromModule, pubLegacy1, pubLegacy2}, defaultPub);
    ensureDir(pub);

    Path assets = pub.resolve("uploads");
    ensureDir(assets);

    Map<String, Object> map = new LinkedHashMap<>();
    map.put(PROP_DS_URL, "jdbc:sqlite:" + db.toAbsolutePath());
    map.put(PROP_STATIC, pub.toAbsolutePath().toString());
    map.put(PROP_UPLOAD, assets.toAbsolutePath().toString());
    map.put(PROP_ASSETS, assets.toAbsolutePath().toString());
    env.getPropertySources().addFirst(new MapPropertySource("light-resolved-paths", map));
  }

  private static Path firstExistingOrDefault(Path[] paths, Path defaultIfNone) {
    for (Path p : paths) {
      if (p != null && Files.exists(p)) {
        return p;
      }
    }
    return defaultIfNone;
  }

  private static void ensureParentDir(Path file) {
    Path parent = file.getParent();
    if (parent != null) {
      ensureDir(parent);
    }
  }

  private static void ensureDir(Path dir) {
    try {
      Files.createDirectories(dir);
    } catch (IOException ignored) {
      // SQLite / 静态资源目录创建失败时由后续启动报错
    }
  }
}
