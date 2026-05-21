package com.yellen.light.web.cms;

import static com.yellen.light.util.ApiJson.*;

import com.fasterxml.jackson.databind.JsonNode;
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
@RequestMapping("/light-cms/category")
public class CategoryCmsController {

  private final JdbcTemplate jdbc;

  public CategoryCmsController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  private static String orderBy(String sortField, String sortOrder) {
    String dir = "ascend".equals(sortOrder) ? "ASC" : "DESC";
    if ("priority".equals(sortField)) {
      return "ORDER BY priority " + dir + ", updateTime DESC";
    }
    return "ORDER BY updateTime DESC";
  }

  @PostMapping("/list")
  public Map<String, Object> list(@RequestBody JsonNode body) {
    String name = text(body, "name");
    Integer status = intOrNull(body, "status");
    int page = body.path("page").asInt(1);
    int pageSize = body.path("pageSize").asInt(10);
    String sortField = body.path("sortField").asText("updateTime");
    String sortOrder = body.path("sortOrder").asText("descend");

    StringBuilder q = new StringBuilder("SELECT * FROM categories WHERE 1=1");
    List<Object> params = new ArrayList<>();
    if (name != null && !name.isEmpty()) {
      q.append(" AND name_i18n LIKE ?");
      params.add("%" + name + "%");
    }
    if (status != null) {
      q.append(" AND status = ?");
      params.add(status);
    }
    String base = q.toString();
    Long total =
        jdbc.queryForObject("SELECT COUNT(*) FROM (" + base + ")", Long.class, params.toArray());
    if (total == null) {
      total = 0L;
    }
    q.append(" ").append(orderBy(sortField, sortOrder)).append(" LIMIT ? OFFSET ?");
    params.add(pageSize);
    params.add((page - 1) * pageSize);
    List<Map<String, Object>> rows = jdbc.queryForList(q.toString(), params.toArray());
    List<Map<String, Object>> content = new ArrayList<>();
    for (Map<String, Object> row : rows) {
      Map<String, Object> rec = I18nUtils.rowToI18nRecord(new LinkedHashMap<>(row), "name");
      rec.put("images", I18nUtils.parseImages(String.valueOf(row.getOrDefault("images", "[]"))));
      rec.put("name", I18nUtils.getPrimaryFromRow(row, "name"));
      content.add(rec);
    }
    return ApiJson.paginated(content, page, pageSize, total);
  }

  @PostMapping("/listAll")
  public Map<String, Object> listAll() {
    List<Map<String, Object>> rows =
        jdbc.queryForList(
            "SELECT id, name_i18n, folderName, images, priority, status FROM categories ORDER BY priority ASC, id ASC");
    List<Map<String, Object>> categories = new ArrayList<>();
    for (Map<String, Object> row : rows) {
      Map<String, Object> rec = I18nUtils.rowToI18nRecord(new LinkedHashMap<>(row), "name");
      rec.put("images", I18nUtils.parseImages(String.valueOf(row.getOrDefault("images", "[]"))));
      rec.put("name", I18nUtils.getPrimaryFromRow(row, "name"));
      categories.add(rec);
    }
    return cmsOk(categories);
  }

  @PostMapping("/save")
  public Map<String, Object> save(@RequestBody JsonNode body) {
    Map<String, String> i18n = I18nUtils.bodyToI18nColumns(body, "name");
    String nameI18n = i18n.get("name_i18n");
    String folderName = text(body, "folderName");
    if (nameI18n == null) {
      return cmsErr("名称不能为空", 100002);
    }
    if (folderName == null || folderName.isEmpty()) {
      String enName = pathText(body, "en", "name");
      if (enName == null) {
        enName = pathText(body, "zh", "name");
      }
      Map<String, Object> parsed = I18nUtils.parseJsonObject(nameI18n);
      String fromJson = parsed.get("en") != null ? String.valueOf(parsed.get("en")) : null;
      if (fromJson == null || fromJson.isBlank()) {
        fromJson = parsed.get("zh") != null ? String.valueOf(parsed.get("zh")) : "";
      }
      folderName = I18nUtils.slug(enName != null ? enName : fromJson);
    }
    String images = I18nUtils.stringifyImages(jsonArrayToList(body.get("images")));
    int priority = body.path("priority").asInt(0);
    int status = body.has("status") && !body.get("status").isNull() ? body.get("status").asInt() : 1;
    String now = DbTime.now();
    Long id = longOrNull(body, "id");
    if (id != null) {
      jdbc.update(
          "UPDATE categories SET name_i18n = ?, folderName = ?, images = ?, priority = ?, status = ?, updateTime = ? WHERE id = ?",
          nameI18n,
          folderName,
          images,
          priority,
          status,
          now,
          id);
    } else {
      jdbc.update(
          "INSERT INTO categories (name_i18n, folderName, images, priority, status, createTime, updateTime) VALUES (?,?,?,?,?,?,?)",
          nameI18n,
          folderName,
          images,
          priority,
          status,
          now,
          now);
    }
    return cmsOk(null, "保存成功");
  }

  @PostMapping("/delete")
  public Map<String, Object> delete(@RequestBody JsonNode body) {
    Long id = longOrNull(body, "id");
    if (id == null) {
      return cmsErr("ID不能为空", 100002);
    }
    jdbc.update("DELETE FROM categories WHERE id = ?", id);
    return cmsOk(null, "删除成功");
  }

  @PostMapping("/updateStatus")
  public Map<String, Object> updateStatus(@RequestBody JsonNode body) {
    Long id = longOrNull(body, "id");
    if (id == null || !body.has("status") || body.get("status").isNull()) {
      return cmsErr("ID和状态不能为空", 100002);
    }
    int status = body.get("status").asInt();
    jdbc.update("UPDATE categories SET status = ?, updateTime = ? WHERE id = ?", status, DbTime.now(), id);
    return cmsOk(null, "操作成功");
  }

  private static String text(JsonNode body, String field) {
    JsonNode n = body.get(field);
    if (n == null || n.isNull()) {
      return null;
    }
    String s = n.asText();
    return s.isEmpty() ? null : s;
  }

  private static Integer intOrNull(JsonNode body, String field) {
    if (!body.has(field) || body.get(field).isNull()) {
      return null;
    }
    return body.get(field).asInt();
  }

  private static Long longOrNull(JsonNode body, String field) {
    if (!body.has(field) || body.get(field).isNull()) {
      return null;
    }
    return body.get(field).asLong();
  }

  private static String pathText(JsonNode body, String lang, String field) {
    JsonNode n = body.path(lang).path(field);
    return n.isMissingNode() || n.isNull() || n.asText().isEmpty() ? null : n.asText();
  }

  private static List<String> jsonArrayToList(JsonNode arr) {
    List<String> out = new ArrayList<>();
    if (arr == null || !arr.isArray()) {
      return out;
    }
    for (JsonNode n : arr) {
      out.add(n.asText());
    }
    return out;
  }
}
