package com.yellen.light.web.cms;

import static com.yellen.light.util.ApiJson.*;

import com.fasterxml.jackson.core.type.TypeReference;
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
@RequestMapping("/light-cms/product")
public class ProductCmsController {

  private static final ObjectMapper MAPPER = new ObjectMapper();
  private final JdbcTemplate jdbc;

  public ProductCmsController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  private static String orderBy(String sortField, String sortOrder) {
    String dir = "ascend".equals(sortOrder) ? "ASC" : "DESC";
    if ("priority".equals(sortField)) {
      return "ORDER BY p.priority " + dir + ", p.updateTime DESC";
    }
    return "ORDER BY p.updateTime DESC";
  }

  private static String categoryDisplayName(String categoryNameI18n) {
    if (categoryNameI18n == null) {
      return "";
    }
    Map<String, Object> o = I18nUtils.parseJsonObject(categoryNameI18n);
    Object zh = o.get("zh");
    if (zh != null && !String.valueOf(zh).isBlank()) {
      return String.valueOf(zh);
    }
    Object en = o.get("en");
    if (en != null && !String.valueOf(en).isBlank()) {
      return String.valueOf(en);
    }
    Object ar = o.get("ar");
    return ar != null ? String.valueOf(ar) : "";
  }

  @PostMapping("/list")
  public Map<String, Object> list(@RequestBody JsonNode body) {
    String name = text(body, "name");
    Long categoryId = longOrNull(body, "categoryId");
    int page = body.path("page").asInt(1);
    int pageSize = body.path("pageSize").asInt(10);
    String sortField = body.path("sortField").asText("updateTime");
    String sortOrder = body.path("sortOrder").asText("descend");

    StringBuilder q =
        new StringBuilder(
            "SELECT p.*, c.name_i18n as categoryName_i18n FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE 1=1");
    List<Object> params = new ArrayList<>();
    if (name != null && !name.isEmpty()) {
      q.append(" AND (p.name_i18n LIKE ? OR p.description_i18n LIKE ?)");
      params.add("%" + name + "%");
      params.add("%" + name + "%");
    }
    if (categoryId != null) {
      q.append(" AND p.categoryId = ?");
      params.add(categoryId);
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
      Map<String, Object> copy = new LinkedHashMap<>(row);
      Object catI18n = copy.remove("categoryName_i18n");
      Map<String, Object> rec = I18nUtils.rowToI18nRecord(copy, "name", "description");
      rec.put("images", I18nUtils.parseImages(String.valueOf(row.getOrDefault("images", "[]"))));
      rec.put("name", I18nUtils.getPrimaryFromRow(row, "name"));
      rec.put("description", I18nUtils.getPrimaryFromRow(row, "description"));
      rec.put("categoryName", categoryDisplayName(catI18n == null ? null : catI18n.toString()));
      content.add(rec);
    }
    return ApiJson.paginated(content, page, pageSize, total);
  }

  @PostMapping("/listAll")
  public Map<String, Object> listAll() throws Exception {
    List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM products ORDER BY priority ASC, id ASC");
    List<Map<String, Object>> products = new ArrayList<>();
    for (Map<String, Object> row : rows) {
      Map<String, Object> rec = I18nUtils.rowToI18nRecord(new LinkedHashMap<>(row), "name", "description");
      rec.put("images", I18nUtils.parseImages(String.valueOf(row.getOrDefault("images", "[]"))));
      rec.put("name", I18nUtils.getPrimaryFromRow(row, "name"));
      rec.put("description", I18nUtils.getPrimaryFromRow(row, "description"));
      rec.put("specs", parseSpecs(row.get("specs")));
      products.add(rec);
    }
    return cmsOk(products);
  }

  @PostMapping("/detail")
  public Map<String, Object> detail(@RequestBody JsonNode body) throws Exception {
    Long id = longOrNull(body, "id");
    if (id == null) {
      return cmsErr("ID不能为空", 100002);
    }
    List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM products WHERE id = ?", id);
    if (rows.isEmpty()) {
      return cmsErr("产品不存在", 100002);
    }
    Map<String, Object> row = rows.get(0);
    Map<String, Object> rec = I18nUtils.rowToI18nRecord(new LinkedHashMap<>(row), "name", "description");
    rec.put("images", I18nUtils.parseImages(String.valueOf(row.getOrDefault("images", "[]"))));
    rec.put("specs", parseSpecs(row.get("specs")));
    return cmsOk(rec);
  }

  @PostMapping("/save")
  public Map<String, Object> save(@RequestBody JsonNode body) throws Exception {
    Map<String, String> i18n = I18nUtils.bodyToI18nColumns(body, "name", "description");
    String nameI18n = i18n.get("name_i18n");
    Long categoryId = longOrNull(body, "categoryId");
    if (nameI18n == null || categoryId == null) {
      return cmsErr("名称和分类不能为空", 100002);
    }
    String descriptionI18n = i18n.get("description_i18n");
    String imagesStr = I18nUtils.stringifyImages(jsonArrayToList(body.get("images")));
    JsonNode colors = firstArray(body, "colors", "zh", "en", "ar");
    JsonNode sizes = firstArray(body, "sizes", "zh", "en", "ar");
    JsonNode powers = firstArray(body, "powers", "zh", "en", "ar");
    JsonNode colorTemperatures = firstArray(body, "colorTemperatures", "zh", "en", "ar");
    boolean hasSpecs =
        (colors != null && colors.size() > 0)
            || (sizes != null && sizes.size() > 0)
            || (powers != null && powers.size() > 0)
            || (colorTemperatures != null && colorTemperatures.size() > 0);
    String specsJson = null;
    if (hasSpecs) {
      Map<String, Object> specs = new LinkedHashMap<>();
      specs.put("colors", toList(colors));
      specs.put("sizes", toList(sizes));
      specs.put("powers", toList(powers));
      specs.put("colorTemperatures", toList(colorTemperatures));
      specsJson = MAPPER.writeValueAsString(specs);
    }
    String now = DbTime.now();
    int priority = body.path("priority").asInt(0);
    int status = body.has("status") && !body.get("status").isNull() ? body.get("status").asInt() : 1;
    double price = body.path("price").asDouble(0);
    Long id = longOrNull(body, "id");
    if (id != null) {
      jdbc.update(
          "UPDATE products SET categoryId = ?, name_i18n = ?, description_i18n = ?, images = ?, price = ?, specs = ?, priority = ?, status = ?, updateTime = ? WHERE id = ?",
          categoryId,
          nameI18n,
          descriptionI18n,
          imagesStr,
          price,
          specsJson,
          priority,
          status,
          now,
          id);
    } else {
      jdbc.update(
          "INSERT INTO products (categoryId, name_i18n, description_i18n, images, price, specs, priority, status, createTime, updateTime) VALUES (?,?,?,?,?,?,?,?,?,?)",
          categoryId,
          nameI18n,
          descriptionI18n,
          imagesStr,
          price,
          specsJson,
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
    jdbc.update("DELETE FROM products WHERE id = ?", id);
    return cmsOk(null, "删除成功");
  }

  @PostMapping("/updateStatus")
  public Map<String, Object> updateStatus(@RequestBody JsonNode body) {
    Long id = longOrNull(body, "id");
    if (id == null || !body.has("status") || body.get("status").isNull()) {
      return cmsErr("ID和状态不能为空", 100002);
    }
    int status = body.get("status").asInt();
    jdbc.update("UPDATE products SET status = ?, updateTime = ? WHERE id = ?", status, DbTime.now(), id);
    return cmsOk(null, "操作成功");
  }

  private static Object parseSpecs(Object raw) throws Exception {
    if (raw == null) {
      return Map.of();
    }
    String s = raw.toString();
    if (s.isBlank()) {
      return Map.of();
    }
    return MAPPER.readValue(s, new TypeReference<Map<String, Object>>() {});
  }

  private static JsonNode firstArray(JsonNode body, String field, String... langs) {
    JsonNode n = body.get(field);
    if (n != null && n.isArray()) {
      return n;
    }
    for (String lang : langs) {
      JsonNode a = body.path(lang).path(field);
      if (a.isArray()) {
        return a;
      }
    }
    return MAPPER.createArrayNode();
  }

  private static List<Object> toList(JsonNode arr) {
    List<Object> out = new ArrayList<>();
    if (arr == null || !arr.isArray()) {
      return out;
    }
    for (JsonNode n : arr) {
      if (n.isTextual()) {
        out.add(n.asText());
      } else {
        out.add(MAPPER.convertValue(n, Map.class));
      }
    }
    return out;
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
