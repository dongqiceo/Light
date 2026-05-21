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
@RequestMapping("/light-cms/featured")
public class FeaturedCmsController {

  private final JdbcTemplate jdbc;

  public FeaturedCmsController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  private static String orderBy(String sortField, String sortOrder) {
    String dir = "ascend".equals(sortOrder) ? "ASC" : "DESC";
    if ("priority".equals(sortField)) {
      return "ORDER BY f.priority " + dir + ", f.updateTime DESC";
    }
    return "ORDER BY f.updateTime DESC";
  }

  @PostMapping("/list")
  public Map<String, Object> list(@RequestBody JsonNode body) {
    int page = body.path("page").asInt(1);
    int pageSize = body.path("pageSize").asInt(10);
    String sortField = body.path("sortField").asText("updateTime");
    String sortOrder = body.path("sortOrder").asText("descend");
    Long total = jdbc.queryForObject("SELECT COUNT(*) FROM featured", Long.class);
    if (total == null) {
      total = 0L;
    }
    String sql =
        "SELECT f.id, f.productId, f.desc, f.image, f.priority, f.createTime, f.updateTime, p.name_i18n, p.description_i18n, p.categoryId "
            + "FROM featured f LEFT JOIN products p ON f.productId = p.id "
            + orderBy(sortField, sortOrder)
            + " LIMIT ? OFFSET ?";
    List<Map<String, Object>> rows = jdbc.queryForList(sql, pageSize, (page - 1) * pageSize);
    List<Map<String, Object>> content = new ArrayList<>();
    for (Map<String, Object> row : rows) {
      Map<String, Object> rec = new LinkedHashMap<>();
      rec.put("id", row.get("id"));
      rec.put("productId", row.get("productId"));
      String desc = row.get("desc") == null ? null : row.get("desc").toString();
      if (desc == null || desc.isEmpty()) {
        desc = I18nUtils.getPrimaryFromRow(row, "description");
      }
      rec.put("desc", desc);
      rec.put("image", row.get("image"));
      rec.put("priority", row.get("priority"));
      rec.put("createTime", row.get("createTime"));
      rec.put("updateTime", row.get("updateTime"));
      rec.put("categoryId", row.get("categoryId"));
      rec.put("productName", I18nUtils.getPrimaryFromRow(row, "name"));
      content.add(rec);
    }
    return ApiJson.paginated(content, page, pageSize, total);
  }

  @PostMapping("/save")
  public Map<String, Object> save(@RequestBody JsonNode body) {
    Long productId = longOrNull(body, "productId");
    String image = text(body, "image");
    if (productId == null || image == null) {
      return cmsErr("请选择产品并选择一张展示图", 100002);
    }
    String desc = text(body, "desc");
    int priority = body.path("priority").asInt(0);
    String now = DbTime.now();
    Long id = longOrNull(body, "id");
    if (id != null) {
      jdbc.update(
          "UPDATE featured SET productId = ?, desc = ?, image = ?, priority = ?, updateTime = ? WHERE id = ?",
          productId,
          desc,
          image,
          priority,
          now,
          id);
    } else {
      jdbc.update(
          "INSERT INTO featured (productId, desc, image, priority, createTime, updateTime) VALUES (?,?,?,?,?,?)",
          productId,
          desc,
          image,
          priority,
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
    jdbc.update("DELETE FROM featured WHERE id = ?", id);
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
