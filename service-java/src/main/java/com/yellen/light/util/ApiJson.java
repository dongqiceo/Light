package com.yellen.light.util;

import java.util.LinkedHashMap;
import java.util.Map;

public final class ApiJson {

  private ApiJson() {}

  public static Map<String, Object> cmsOk(Object data) {
    return cmsOk(data, "操作成功");
  }

  public static Map<String, Object> cmsOk(Object data, String message) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("code", 100000);
    m.put("message", message);
    m.put("data", data);
    return m;
  }

  public static Map<String, Object> cmsErr(String message) {
    return cmsErr(message, 100001);
  }

  public static Map<String, Object> cmsErr(String message, int code) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("code", code);
    m.put("message", message);
    m.put("data", null);
    return m;
  }

  public static Map<String, Object> h5Ok(Object data) {
    return h5Ok(data, "操作成功");
  }

  public static Map<String, Object> h5Ok(Object data, String message) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("code", 200);
    m.put("message", message);
    m.put("data", data);
    return m;
  }

  public static Map<String, Object> h5Err(String message) {
    return h5Err(message, 100001);
  }

  public static Map<String, Object> h5Err(String message, int code) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("code", code);
    m.put("message", message);
    m.put("data", null);
    return m;
  }

  public static Map<String, Object> paginated(Object content, int page, int pageSize, long total) {
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("content", content);
    data.put("page", page);
    data.put("pageSize", pageSize);
    data.put("total", total);
    return cmsOk(data);
  }
}
