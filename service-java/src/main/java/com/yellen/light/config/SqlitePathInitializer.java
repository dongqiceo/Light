package com.yellen.light.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * IntelliJ 运行配置的工作目录可能是仓库根 {@code Light} 或模块根 {@code java/light-service}，
 * 相对路径 {@code ../../services/...} 会失效。优先使用 {@code java/light-service/data/light.db}（与 Node 共用库的副本），再回退到 {@code services/data/light.db}。
 */
public class SqlitePathInitializer
    implements ApplicationContextInitializer<ConfigurableApplicationContext> {

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

    Path dbBundledFromRoot = base.resolve("java/light-service/data/light.db").normalize();
    Path dbBundledFromModule = base.resolve("data/light.db").normalize();
    Path db1 = base.resolve("services/data/light.db").normalize();
    Path db2 = base.resolve("../../services/data/light.db").normalize();

    Path pub1 = base.resolve("light/public").normalize();
    Path pub2 = base.resolve("../../light/public").normalize();

    Path defaultDb =
        base.getFileName() != null && "light-service".equals(base.getFileName().toString())
            ? dbBundledFromModule
            : dbBundledFromRoot;
    Path db =
        firstExistingOrDefault(
            new Path[] {dbBundledFromRoot, dbBundledFromModule, db1, db2}, defaultDb);
    Path pub = Files.exists(pub1) ? pub1 : Files.exists(pub2) ? pub2 : pub1;
    Path repoRoot = pub.getParent().getParent();
    Path assets = repoRoot.resolve("assets");

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
}
