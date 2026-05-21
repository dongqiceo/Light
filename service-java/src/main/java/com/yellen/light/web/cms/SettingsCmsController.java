package com.yellen.light.web.cms;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import static com.yellen.light.util.ApiJson.cmsErr;
import static com.yellen.light.util.ApiJson.cmsOk;
import com.yellen.light.util.DbTime;
import com.yellen.light.util.I18nUtils;

@RestController
@RequestMapping("/light-cms/settings")
public class SettingsCmsController {

  private final JdbcTemplate jdbc;

  public SettingsCmsController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @PostMapping("/get")
  public Map<String, Object> get(@RequestBody(required = false) JsonNode ignored) {
    List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM settings ORDER BY id DESC LIMIT 1");
    if (rows.isEmpty()) {
      return cmsOk(Map.of());
    }
    Map<String, Object> row = rows.get(0);
    Map<String, Object> rec = I18nUtils.rowToI18nRecord(new LinkedHashMap<>(row), "tagline", "intro");
    rec.put("contactEmail", row.get("contactEmail"));
    rec.put("contactPhone", row.get("contactPhone"));
    rec.put("address", row.get("address"));
    return cmsOk(rec);
  }

  @PostMapping("/save")
  public Map<String, Object> save(@RequestBody JsonNode body) {
    Map<String, String> i18n = I18nUtils.bodyToI18nColumns(body, "tagline", "intro");
    String taglineI18n = i18n.get("tagline_i18n");
    String introI18n = i18n.get("intro_i18n");
    if (taglineI18n == null || introI18n == null) {
      return cmsErr("标语与简介不能为空", 100002);
    }
    String contactEmail = text(body, "contactEmail");
    String contactPhone = text(body, "contactPhone");
    String address = text(body, "address");
    String now = DbTime.now();
    List<Map<String, Object>> existing = jdbc.queryForList("SELECT id FROM settings LIMIT 1");
    if (!existing.isEmpty()) {
      Number id = (Number) existing.get(0).get("id");
      jdbc.update(
          "UPDATE settings SET tagline_i18n = ?, intro_i18n = ?, contactEmail = ?, contactPhone = ?, address = ?, updateTime = ? WHERE id = ?",
          taglineI18n,
          introI18n,
          contactEmail,
          contactPhone,
          address,
          now,
          id.longValue());
    } else {
      jdbc.update(
          "INSERT INTO settings (tagline_i18n, intro_i18n, contactEmail, contactPhone, address, updateTime) VALUES (?,?,?,?,?,?)",
          taglineI18n,
          introI18n,
          contactEmail,
          contactPhone,
          address,
          now);
    }
    return cmsOk(null, "保存成功");
  }

  private static String text(JsonNode body, String field) {
    JsonNode n = body.get(field);
    if (n == null || n.isNull()) {
      return null;
    }
    String s = n.asText();
    return s.isEmpty() ? null : s;
  }
}
