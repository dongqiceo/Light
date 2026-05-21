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
@RequestMapping("/light-cms/carousel")
public class CarouselCmsController {

  private static final ObjectMapper MAPPER = new ObjectMapper();
  private final JdbcTemplate jdbc;

  public CarouselCmsController(JdbcTemplate jdbc) {
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
  public Map<String, Object> list(@RequestBody JsonNode body) throws Exception {
    int page = body.path("page").asInt(1);
    int pageSize = body.path("pageSize").asInt(10);
    String sortField = body.path("sortField").asText("updateTime");
    String sortOrder = body.path("sortOrder").asText("descend");
    Long total = jdbc.queryForObject("SELECT COUNT(*) FROM carousels", Long.class);
    if (total == null) {
      total = 0L;
    }
    String sql = "SELECT * FROM carousels " + orderBy(sortField, sortOrder) + " LIMIT ? OFFSET ?";
    List<Map<String, Object>> rows = jdbc.queryForList(sql, pageSize, (page - 1) * pageSize);
    List<Map<String, Object>> content = new ArrayList<>();
    for (Map<String, Object> row : rows) {
      Map<String, Object> rec = I18nUtils.rowToI18nRecord(new LinkedHashMap<>(row), "title", "description");
      rec.put("title", I18nUtils.getPrimaryFromRow(row, "title"));
      rec.put("description", I18nUtils.getPrimaryFromRow(row, "description"));
      content.add(rec);
    }
    return ApiJson.paginated(content, page, pageSize, total);
  }

  @PostMapping("/save")
  public Map<String, Object> save(@RequestBody JsonNode body) throws Exception {
    Map<String, String> i18n = I18nUtils.bodyToI18nColumns(body, "title", "description");
    String titleI18n = i18n.get("title_i18n");
    String descriptionI18n = i18n.get("description_i18n");
    if (titleI18n == null && body.has("title") && !body.get("title").isNull()) {
      titleI18n = MAPPER.writeValueAsString(Map.of("en", body.get("title").asText()));
    }
    if (descriptionI18n == null && body.has("description") && !body.get("description").isNull()) {
      descriptionI18n = MAPPER.writeValueAsString(Map.of("en", body.get("description").asText()));
    }
    String image = text(body, "image");
    if (titleI18n == null || image == null) {
      return cmsErr("标题和图片不能为空", 100002);
    }
    String now = DbTime.now();
    int priority = body.path("priority").asInt(0);
    int status = body.has("status") && !body.get("status").isNull() ? body.get("status").asInt() : 1;
    String link = text(body, "link");
    Long id = longOrNull(body, "id");
    if (id != null) {
      jdbc.update(
          "UPDATE carousels SET title_i18n = ?, description_i18n = ?, image = ?, link = ?, priority = ?, status = ?, updateTime = ? WHERE id = ?",
          titleI18n,
          descriptionI18n,
          image,
          link,
          priority,
          status,
          now,
          id);
    } else {
      jdbc.update(
          "INSERT INTO carousels (title_i18n, description_i18n, image, link, priority, status, createTime, updateTime) VALUES (?,?,?,?,?,?,?,?)",
          titleI18n,
          descriptionI18n,
          image,
          link,
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
    jdbc.update("DELETE FROM carousels WHERE id = ?", id);
    return cmsOk(null, "删除成功");
  }

  @PostMapping("/updateStatus")
  public Map<String, Object> updateStatus(@RequestBody JsonNode body) {
    Long id = longOrNull(body, "id");
    if (id == null || !body.has("status") || body.get("status").isNull()) {
      return cmsErr("ID和状态不能为空", 100002);
    }
    int status = body.get("status").asInt();
    jdbc.update("UPDATE carousels SET status = ?, updateTime = ? WHERE id = ?", status, DbTime.now(), id);
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

  private static Long longOrNull(JsonNode body, String field) {
    if (!body.has(field) || body.get(field).isNull()) {
      return null;
    }
    return body.get(field).asLong();
  }
}
