package com.yellen.light.web;

import static com.yellen.light.util.ApiJson.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.yellen.light.util.ContactPayloadValidator;
import com.yellen.light.util.I18nUtils;
import com.yellen.light.util.ProductPrices;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class H5ApiController {

  private static final Logger log = LoggerFactory.getLogger(H5ApiController.class);
  private final JdbcTemplate jdbc;

  public H5ApiController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @PostMapping("/products/featured")
  public Map<String, Object> featured(@RequestBody JsonNode body) {
    try {
      int limit = body.path("limit").asInt(6);
      String locale = body.path("locale").asText("en");
      List<String> order = List.of(locale, "zh", "en", "ar");
      List<Map<String, Object>> rows =
          jdbc.queryForList(
              "SELECT f.id, f.productId, f.desc, f.image, f.priority, p.name_i18n, p.description_i18n, p.categoryId "
                  + "FROM featured f LEFT JOIN products p ON f.productId = p.id "
                  + "ORDER BY f.priority ASC, f.id ASC LIMIT ?",
              limit);
      List<Map<String, Object>> products = new ArrayList<>();
      for (Map<String, Object> row : rows) {
        String name = I18nUtils.getPrimaryFromRow(row, "name", order);
        String desc =
            row.get("desc") == null || row.get("desc").toString().isEmpty()
                ? I18nUtils.getPrimaryFromRow(row, "description", order)
                : row.get("desc").toString();
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", row.get("id"));
        item.put("productId", row.get("productId"));
        item.put("name", name);
        item.put("desc", desc);
        item.put("image", row.get("image"));
        item.put("categoryId", row.get("categoryId"));
        products.add(item);
      }
      return h5Ok(products);
    } catch (Exception e) {
      log.error("featured", e);
      return h5Err(e.getMessage());
    }
  }

  @PostMapping("/carousels")
  public Map<String, Object> carousels(@RequestBody JsonNode body) {
    try {
      String locale = body.path("locale").asText("en");
      List<Map<String, Object>> rows =
          jdbc.queryForList(
              "SELECT id, title_i18n, description_i18n, image, link FROM carousels WHERE status = 1 ORDER BY priority ASC, id ASC");
      List<Map<String, Object>> out = new ArrayList<>();
      for (Map<String, Object> row : rows) {
        out.add(I18nUtils.pickLocale(row, List.of("title", "description"), locale));
      }
      return h5Ok(out);
    } catch (Exception e) {
      log.error("carousels", e);
      return h5Err(e.getMessage());
    }
  }

  @PostMapping("/product-categories")
  public Map<String, Object> productCategories(@RequestBody JsonNode body) {
    try {
      String locale = body.path("locale").asText("en");
      List<String> order = List.of(locale, "zh", "en", "ar");
      List<Map<String, Object>> catRows =
          jdbc.queryForList(
              "SELECT id, name_i18n, folderName, images FROM categories WHERE status = 1 ORDER BY priority ASC, id ASC");
      List<Map<String, Object>> result = new ArrayList<>();
      for (Map<String, Object> row : catRows) {
        Map<String, Object> rec = I18nUtils.pickLocale(row, List.of("name"), locale);
        rec.put("images", I18nUtils.parseImages(String.valueOf(row.getOrDefault("images", "[]"))));
        List<Map<String, Object>> productRows =
            jdbc.queryForList(
                "SELECT id, name_i18n, images FROM products WHERE categoryId = ? AND status = 1 ORDER BY priority ASC, updateTime DESC",
                row.get("id"));
        List<Map<String, Object>> products = new ArrayList<>();
        for (Map<String, Object> p : productRows) {
          String name = I18nUtils.getPrimaryFromRow(p, "name", order);
          Map<String, Object> pr = new LinkedHashMap<>();
          pr.put("id", p.get("id"));
          pr.put("name", name);
          pr.put("images", I18nUtils.parseImages(String.valueOf(p.getOrDefault("images", "[]"))));
          products.add(pr);
        }
        rec.put("products", products);
        result.add(rec);
      }
      return h5Ok(result);
    } catch (Exception e) {
      log.error("product-categories", e);
      return h5Err(e.getMessage());
    }
  }

  @PostMapping("/products/detail")
  public Map<String, Object> productDetail(@RequestBody JsonNode body) {
    try {
      long categoryId = body.path("categoryId").asLong();
      Long productId = optionalProductId(body);
      String locale = body.path("locale").asText("en");
      List<String> order = List.of(locale, "zh", "en", "ar");
      List<Map<String, Object>> cats =
          jdbc.queryForList(
              "SELECT id, name_i18n, folderName, images FROM categories WHERE id = ? AND status = 1", categoryId);
      if (cats.isEmpty()) {
        return h5Err("分类不存在", 100006);
      }
      Map<String, Object> categoryRow = cats.get(0);
      Map<String, Object> category = I18nUtils.pickLocale(categoryRow, List.of("name"), locale);
      List<String> images = I18nUtils.parseImages(String.valueOf(categoryRow.getOrDefault("images", "[]")));
      String name = String.valueOf(category.getOrDefault("name", ""));
      String price = null;
      Map<String, Object> specifications = new LinkedHashMap<>();
      specifications.put("colors", new ArrayList<>());
      specifications.put("sizes", new ArrayList<>());
      specifications.put("colorTemperatures", new ArrayList<>());
      specifications.put("powers", new ArrayList<>());
      String description = "";
      Map<String, Object> productRow;
      if (productId != null) {
        List<Map<String, Object>> prs =
            jdbc.queryForList(
                "SELECT id, name_i18n, description_i18n, images, price_i18n, specs FROM products WHERE id = ? AND categoryId = ? AND status = 1",
                productId,
                categoryId);
        productRow = prs.isEmpty() ? null : prs.get(0);
      } else {
        List<Map<String, Object>> prs =
            jdbc.queryForList(
                "SELECT id, name_i18n, description_i18n, images, price_i18n, specs FROM products WHERE categoryId = ? AND status = 1 ORDER BY priority ASC, updateTime DESC LIMIT 1",
                categoryId);
        productRow = prs.isEmpty() ? null : prs.get(0);
      }
      if (productRow != null) {
        name = I18nUtils.getPrimaryFromRow(productRow, "name", order);
        description = I18nUtils.getPrimaryFromRow(productRow, "description", order);
        List<String> pi = I18nUtils.parseImages(String.valueOf(productRow.getOrDefault("images", "[]")));
        if (!pi.isEmpty()) {
          images = pi;
        }
        price = ProductPrices.localePrice(productRow.get("price_i18n"), locale);
        if (price == null) {
          log.error("product {} locale {} missing canonical price", productRow.get("id"), locale);
          return h5Err("产品价格不可用", 100001);
        }
        Map<String, Object> specs =
            I18nUtils.parseJsonObject(
                productRow.get("specs") == null ? null : productRow.get("specs").toString());
        mergeSpecs(specifications, specs);
      }
      Map<String, Object> result = new LinkedHashMap<>();
      result.put("id", category.get("id"));
      result.put("name", name);
      result.put("description", description);
      result.put("folderName", categoryRow.get("folderName"));
      result.put("images", images);
      result.put("price", price);
      result.put("specifications", specifications);
      return h5Ok(result);
    } catch (Exception e) {
      log.error("product detail", e);
      return h5Err(e.getMessage());
    }
  }

  @SuppressWarnings("unchecked")
  private static void mergeSpecs(Map<String, Object> specifications, Map<String, Object> specs) {
    List<Object> colors = asObjectList(specs.get("colors"));
    List<Map<String, Object>> normColors = new ArrayList<>();
    for (Object c : colors) {
      if (c instanceof String) {
        String s = (String) c;
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("name", s);
        o.put("value", s);
        o.put("hex", "#999");
        normColors.add(o);
      } else if (c instanceof Map) {
        @SuppressWarnings("unchecked")
        Map<String, Object> cm = (Map<String, Object>) c;
        Map<String, Object> o = new LinkedHashMap<>(cm);
        if (!o.containsKey("hex") || o.get("hex") == null) {
          o.put("hex", "#999");
        }
        normColors.add(o);
      }
    }
    specifications.put("colors", normColors);
    specifications.put("sizes", normalizeSimpleList(asObjectList(specs.get("sizes"))));
    specifications.put(
        "colorTemperatures", normalizeSimpleList(asObjectList(specs.get("colorTemperatures"))));
    specifications.put("powers", normalizeSimpleList(asObjectList(specs.get("powers"))));
  }

  @SuppressWarnings("unchecked")
  private static List<Object> asObjectList(Object raw) {
    if (raw instanceof List) {
      return (List<Object>) raw;
    }
    return List.of();
  }

  private static List<Map<String, Object>> normalizeSimpleList(List<Object> items) {
    List<Map<String, Object>> out = new ArrayList<>();
    for (Object item : items) {
      if (item instanceof String) {
        String s = (String) item;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("label", s);
        m.put("value", s);
        out.add(m);
      } else if (item instanceof Map) {
        @SuppressWarnings("unchecked")
        Map<String, Object> im = (Map<String, Object>) item;
        out.add(new LinkedHashMap<>(im));
      }
    }
    return out;
  }

  @PostMapping("/settings")
  public Map<String, Object> settings(@RequestBody(required = false) JsonNode body) {
    try {
      ensureSocialColumns();
      String locale = body != null && !body.isNull() ? body.path("locale").asText("en") : "en";
      List<String> order = List.of(locale, "zh", "en", "ar");
      List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM settings ORDER BY id DESC LIMIT 1");
      if (rows.isEmpty()) {
        return h5Ok(Map.of());
      }
      Map<String, Object> row = rows.get(0);
      Map<String, Object> out = new LinkedHashMap<>();
      out.put("tagline", I18nUtils.getPrimaryFromRow(row, "tagline", order));
      out.put("intro", I18nUtils.getPrimaryFromRow(row, "intro", order));
      out.put("address", row.get("address") != null ? String.valueOf(row.get("address")) : "");
      out.put("email", row.get("contactEmail") != null ? String.valueOf(row.get("contactEmail")) : "");
      out.put("phone", row.get("contactPhone") != null ? String.valueOf(row.get("contactPhone")) : "");
      out.put("facebook", row.get("facebook") != null ? String.valueOf(row.get("facebook")) : "");
      out.put("tiktok", row.get("tiktok") != null ? String.valueOf(row.get("tiktok")) : "");
      out.put("whatsapp", row.get("whatsapp") != null ? String.valueOf(row.get("whatsapp")) : "");
      out.put("instagram", row.get("instagram") != null ? String.valueOf(row.get("instagram")) : "");
      return h5Ok(out);
    } catch (Exception e) {
      log.error("settings", e);
      return h5Err(e.getMessage());
    }
  }

  private void ensureSocialColumns() {
    for (String column : List.of("facebook", "tiktok", "whatsapp", "instagram")) {
      try {
        jdbc.execute("ALTER TABLE settings ADD COLUMN " + column + " TEXT");
      } catch (Exception ignored) {
      }
    }
  }

  @PostMapping("/contact")
  public Map<String, Object> contact(@RequestBody JsonNode body) {
    try {
      if (body != null && body.isObject() && (body.has("phone") || body.has("subject"))) {
        log.warn(
            "Deprecated contact fields ignored: phone={} subject={}",
            text(body, "phone"),
            text(body, "subject"));
      }
      ContactPayloadValidator.ValidationResult result = ContactPayloadValidator.validate(body);
      if (!result.ok) {
        return h5Err(result.message, result.code);
      }
      Map<String, String> row = result.row;
      jdbc.update(
          "INSERT INTO contact_messages (name, email, country, tel, whatsapp, company, message) VALUES (?,?,?,?,?,?,?)",
          row.get("name"),
          row.get("email"),
          row.get("country"),
          row.get("tel"),
          row.get("whatsapp"),
          row.get("company"),
          row.get("message"));
      return h5Ok(null, "提交成功，我们会尽快联系您");
    } catch (Exception e) {
      log.error("contact", e);
      return h5Err(e.getMessage());
    }
  }

  private static Long optionalProductId(JsonNode body) {
    if (!body.has("productId") || body.get("productId").isNull()) {
      return null;
    }
    return body.get("productId").asLong();
  }

  private static String text(JsonNode body, String field) {
    JsonNode n = body.get(field);
    if (n == null || n.isNull()) {
      return null;
    }
    String s = n.asText();
    return s.isBlank() ? null : s;
  }
}
