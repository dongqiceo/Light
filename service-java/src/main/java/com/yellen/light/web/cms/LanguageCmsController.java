package com.yellen.light.web.cms;

import static com.yellen.light.util.ApiJson.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.yellen.light.util.ApiJson;
import com.yellen.light.util.DbTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/light-cms/language")
public class LanguageCmsController {

  private final JdbcTemplate jdbc;

  public LanguageCmsController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @PostMapping("/list")
  public Map<String, Object> list(@RequestBody JsonNode body) {
    String name = text(body, "name");
    String code = text(body, "code");
    int page = body.path("page").asInt(1);
    int pageSize = body.path("pageSize").asInt(10);
    StringBuilder q = new StringBuilder("SELECT * FROM languages WHERE 1=1");
    List<Object> params = new ArrayList<>();
    if (name != null && !name.isEmpty()) {
      q.append(" AND name LIKE ?");
      params.add("%" + name + "%");
    }
    if (code != null && !code.isEmpty()) {
      q.append(" AND code LIKE ?");
      params.add("%" + code + "%");
    }
    String base = q.toString();
    Long total = jdbc.queryForObject("SELECT COUNT(*) FROM (" + base + ")", Long.class, params.toArray());
    if (total == null) {
      total = 0L;
    }
    q.append(" ORDER BY isDefault DESC, id ASC LIMIT ? OFFSET ?");
    params.add(pageSize);
    params.add((page - 1) * pageSize);
    List<Map<String, Object>> content = jdbc.queryForList(q.toString(), params.toArray());
    return ApiJson.paginated(content, page, pageSize, total);
  }

  @PostMapping("/listAll")
  public Map<String, Object> listAll() {
    List<Map<String, Object>> languages =
        jdbc.queryForList("SELECT * FROM languages ORDER BY isDefault DESC, id ASC");
    return cmsOk(languages);
  }

  @PostMapping("/save")
  public Map<String, Object> save(@RequestBody JsonNode body) {
    String name = text(body, "name");
    String code = text(body, "code");
    if (name == null || code == null) {
      return cmsErr("语言名称和代码不能为空", 100002);
    }
    boolean isDefault = body.path("isDefault").asBoolean(false);
    String now = DbTime.now();
    Long id = longOrNull(body, "id");
    if (isDefault) {
      jdbc.update("UPDATE languages SET isDefault = 0");
    }
    int def = isDefault ? 1 : 0;
    if (id != null) {
      jdbc.update(
          "UPDATE languages SET name = ?, code = ?, isDefault = ?, createTime = ? WHERE id = ?",
          name,
          code,
          def,
          now,
          id);
    } else {
      jdbc.update(
          "INSERT INTO languages (name, code, isDefault, createTime) VALUES (?,?,?,?)",
          name,
          code,
          def,
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
    jdbc.update("DELETE FROM languages WHERE id = ?", id);
    return cmsOk(null, "删除成功");
  }

  private static String text(JsonNode body, String field) {
    JsonNode n = body.get(field);
    if (n == null || n.isNull()) {
      return null;
    }
    String s = n.asText();
    return s.isEmpty() ? null : s;
  }

  private static Long longOrNull(JsonNode body, String field) {
    if (!body.has(field) || body.get(field).isNull()) {
      return null;
    }
    return body.get(field).asLong();
  }
}
