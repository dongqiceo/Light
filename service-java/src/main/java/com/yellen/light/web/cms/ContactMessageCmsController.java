package com.yellen.light.web.cms;

import static com.yellen.light.util.ApiJson.cmsErr;
import static com.yellen.light.util.ApiJson.cmsOk;
import static com.yellen.light.util.ApiJson.paginated;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/light-cms/contact-message")
public class ContactMessageCmsController {

  private final JdbcTemplate jdbc;

  public ContactMessageCmsController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  private static String orderBy(String sortField, String sortOrder) {
    String dir = "ascend".equals(sortOrder) ? "ASC" : "DESC";
    if ("name".equals(sortField)) {
      return "ORDER BY name " + dir + ", created_at DESC";
    }
    if ("email".equals(sortField)) {
      return "ORDER BY email " + dir + ", created_at DESC";
    }
    return "ORDER BY created_at DESC";
  }

  @PostMapping("/list")
  public Map<String, Object> list(@RequestBody JsonNode body) {
    int page = body.path("page").asInt(1);
    int pageSize = body.path("pageSize").asInt(10);
    String sortField = body.path("sortField").asText("created_at");
    String sortOrder = body.path("sortOrder").asText("descend");
    Long total = jdbc.queryForObject("SELECT COUNT(*) FROM contact_messages", Long.class);
    if (total == null) {
      total = 0L;
    }
    String sql =
        "SELECT id, name, email, country, tel, whatsapp, company, message, created_at FROM contact_messages "
            + orderBy(sortField, sortOrder)
            + " LIMIT ? OFFSET ?";
    List<Map<String, Object>> content = jdbc.queryForList(sql, pageSize, (page - 1) * pageSize);
    return paginated(content, page, pageSize, total);
  }

  @PostMapping("/detail")
  public Map<String, Object> detail(@RequestBody JsonNode body) {
    long id = body.path("id").asLong(0);
    if (id <= 0) {
      return cmsErr("缺少 id", 100002);
    }
    List<Map<String, Object>> rows =
        jdbc.queryForList("SELECT * FROM contact_messages WHERE id = ?", id);
    if (rows.isEmpty()) {
      return cmsErr("留言不存在", 100006);
    }
    return cmsOk(rows.get(0));
  }

  @PostMapping("/delete")
  public Map<String, Object> delete(@RequestBody JsonNode body) {
    long id = body.path("id").asLong(0);
    if (id <= 0) {
      return cmsErr("缺少 id", 100002);
    }
    int n = jdbc.update("DELETE FROM contact_messages WHERE id = ?", id);
    if (n == 0) {
      return cmsErr("留言不存在", 100006);
    }
    return cmsOk(null, "删除成功");
  }
}
