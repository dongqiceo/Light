package com.yellen.light.web.cms;

import static com.yellen.light.util.ApiJson.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yellen.light.util.ApiJson;
import com.yellen.light.util.DbTime;
import com.yellen.light.util.I18nUtils;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/light-cms/i18n")
public class I18nCmsController {

  private static final ObjectMapper MAPPER = new ObjectMapper();
  private final JdbcTemplate jdbc;

  public I18nCmsController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @PostMapping("/list")
  public Map<String, Object> list(@RequestBody JsonNode body) throws Exception {
    String key = text(body, "key");
    String zh = text(body, "zh");
    String en = text(body, "en");
    int page = body.path("page").asInt(1);
    int pageSize = body.path("pageSize").asInt(10);
    StringBuilder q = new StringBuilder("SELECT * FROM i18ns WHERE 1=1");
    List<Object> params = new ArrayList<>();
    if (key != null && !key.isEmpty()) {
      q.append(" AND key LIKE ?");
      params.add("%" + key + "%");
    }
    if (zh != null && !zh.isEmpty()) {
      q.append(" AND translations LIKE ?");
      params.add("%" + zh + "%");
    }
    if (en != null && !en.isEmpty()) {
      q.append(" AND translations LIKE ?");
      params.add("%" + en + "%");
    }
    String base = q.toString();
    Long total = jdbc.queryForObject("SELECT COUNT(*) FROM (" + base + ")", Long.class, params.toArray());
    if (total == null) {
      total = 0L;
    }
    q.append(" ORDER BY id DESC LIMIT ? OFFSET ?");
    params.add(pageSize);
    params.add((page - 1) * pageSize);
    List<Map<String, Object>> rows = jdbc.queryForList(q.toString(), params.toArray());
    List<Map<String, Object>> content = new ArrayList<>();
    for (Map<String, Object> row : rows) {
      Map<String, Object> t = I18nUtils.parseJsonObject(String.valueOf(row.getOrDefault("translations", "{}")));
      Map<String, Object> item = new LinkedHashMap<>();
      item.put("id", row.get("id"));
      item.put("key", row.get("key"));
      item.put("zh", t.get("zh"));
      item.put("en", t.get("en"));
      item.put("ar", t.get("ar"));
      item.put("createTime", row.get("createTime"));
      content.add(item);
    }
    return ApiJson.paginated(content, page, pageSize, total);
  }

  @PostMapping("/listAll")
  public Map<String, Object> listAll() {
    List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM i18ns ORDER BY id ASC");
    List<Map<String, Object>> i18ns = new ArrayList<>();
    for (Map<String, Object> row : rows) {
      Map<String, Object> t = I18nUtils.parseJsonObject(String.valueOf(row.getOrDefault("translations", "{}")));
      Map<String, Object> item = new LinkedHashMap<>();
      item.put("id", row.get("id"));
      item.put("key", row.get("key"));
      item.putAll(t);
      i18ns.add(item);
    }
    return cmsOk(i18ns);
  }

  @PostMapping("/save")
  public Map<String, Object> save(@RequestBody JsonNode body) throws Exception {
    String key = text(body, "key");
    if (key == null) {
      return cmsErr("翻译键不能为空", 100002);
    }
    Long id = longOrNull(body, "id");
    String translationsStr;
    if (id != null) {
      List<Map<String, Object>> rows = jdbc.queryForList("SELECT translations FROM i18ns WHERE id = ?", id);
      Map<String, Object> existing =
          rows.isEmpty()
              ? Map.of()
              : I18nUtils.parseJsonObject(String.valueOf(rows.get(0).get("translations")));
      Map<String, Object> merged = new LinkedHashMap<>(existing);
      putIfPresent(merged, body, "zh");
      putIfPresent(merged, body, "en");
      putIfPresent(merged, body, "ar");
      translationsStr = MAPPER.writeValueAsString(merged);
    } else {
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("zh", textOrEmpty(body, "zh"));
      m.put("en", textOrEmpty(body, "en"));
      m.put("ar", textOrEmpty(body, "ar"));
      translationsStr = MAPPER.writeValueAsString(m);
    }
    String now = DbTime.now();
    if (id != null) {
      jdbc.update("UPDATE i18ns SET key = ?, translations = ?, createTime = ? WHERE id = ?", key, translationsStr, now, id);
    } else {
      jdbc.update("INSERT INTO i18ns (key, translations, createTime) VALUES (?,?,?)", key, translationsStr, now);
    }
    return cmsOk(null, "保存成功");
  }

  @PostMapping("/delete")
  public Map<String, Object> delete(@RequestBody JsonNode body) {
    Long id = longOrNull(body, "id");
    if (id == null) {
      return cmsErr("ID不能为空", 100002);
    }
    jdbc.update("DELETE FROM i18ns WHERE id = ?", id);
    return cmsOk(null, "删除成功");
  }

  private static void putIfPresent(Map<String, Object> merged, JsonNode body, String field) {
    if (!body.has(field)) {
      return;
    }
    JsonNode n = body.get(field);
    if (n.isNull()) {
      merged.put(field, null);
    } else {
      merged.put(field, n.asText());
    }
  }

  private static String text(JsonNode body, String field) {
    JsonNode n = body.get(field);
    if (n == null || n.isNull()) {
      return null;
    }
    String s = n.asText();
    return s.isEmpty() ? null : s;
  }

  private static String textOrEmpty(JsonNode body, String field) {
    JsonNode n = body.get(field);
    if (n == null || n.isNull()) {
      return "";
    }
    return n.asText();
  }

  private static Long longOrNull(JsonNode body, String field) {
    if (!body.has(field) || body.get(field).isNull()) {
      return null;
    }
    return body.get(field).asLong();
  }
}
