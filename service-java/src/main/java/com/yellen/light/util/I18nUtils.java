package com.yellen.light.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.regex.Pattern;

public final class I18nUtils {

  private static final List<String> LANG_CODES = List.of("en", "zh", "ar");
  private static final ObjectMapper MAPPER = new ObjectMapper();
  private static final Pattern SLUG_CLEAN = Pattern.compile("[^\\w\\u4e00-\\u9fa5-]");

  private I18nUtils() {}

  public static Map<String, Object> parseJsonObject(String str) {
    if (str == null || str.isBlank()) {
      return Map.of();
    }
    try {
      Map<String, Object> o = MAPPER.readValue(str, new TypeReference<>() {});
      return o != null ? o : Map.of();
    } catch (Exception e) {
      return Map.of();
    }
  }

  public static List<String> parseImages(String imagesStr) {
    if (imagesStr == null || imagesStr.isBlank()) {
      return List.of();
    }
    try {
      List<String> list = MAPPER.readValue(imagesStr, new TypeReference<>() {});
      return list != null ? list : List.of();
    } catch (Exception e) {
      return List.of();
    }
  }

  public static String stringifyImages(List<?> images) {
    try {
      return MAPPER.writeValueAsString(images == null ? List.of() : images);
    } catch (JsonProcessingException e) {
      return "[]";
    }
  }

  public static Map<String, String> bodyToI18nColumns(JsonNode body, String... fieldNames) {
    Map<String, String> result = new LinkedHashMap<>();
    for (String field : fieldNames) {
      Map<String, String> byLang = new LinkedHashMap<>();
      for (String code : LANG_CODES) {
        JsonNode lang = body.get(code);
        if (lang != null && !lang.isNull()) {
          JsonNode v = lang.get(field);
          if (v != null && !v.isNull() && !v.asText().isEmpty()) {
            byLang.put(code, v.asText());
          }
        }
      }
      try {
        result.put(field + "_i18n", byLang.isEmpty() ? null : MAPPER.writeValueAsString(byLang));
      } catch (JsonProcessingException e) {
        result.put(field + "_i18n", null);
      }
    }
    return result;
  }

  public static String getPrimaryFromRow(Map<String, Object> row, String fieldName, List<String> langOrder) {
    String col = fieldName + "_i18n";
    Object raw = row.get(col);
    String s = raw == null ? "" : raw.toString();
    Map<String, Object> parsed = parseJsonObject(s);
    for (String code : langOrder) {
      Object v = parsed.get(code);
      if (v != null && !String.valueOf(v).isBlank()) {
        return String.valueOf(v);
      }
    }
    return "";
  }

  public static String getPrimaryFromRow(Map<String, Object> row, String fieldName) {
    return getPrimaryFromRow(row, fieldName, List.of("zh", "en", "ar"));
  }

  public static Map<String, Object> rowToI18nRecord(Map<String, Object> row, String... fieldNames) {
    Map<String, Object> out = new LinkedHashMap<>(row);
    Map<String, Map<String, Object>> byLang = new LinkedHashMap<>();
    for (String code : LANG_CODES) {
      byLang.put(code, new LinkedHashMap<>());
    }
    for (String field : fieldNames) {
      String col = field + "_i18n";
      Object raw = row.get(col);
      Map<String, Object> parsed = parseJsonObject(raw == null ? null : raw.toString());
      for (String code : LANG_CODES) {
        if (parsed.get(code) != null) {
          byLang.get(code).put(field, parsed.get(code));
        }
      }
      out.remove(col);
    }
    for (String code : LANG_CODES) {
      if (!byLang.get(code).isEmpty()) {
        out.put(code, byLang.get(code));
      }
    }
    return out;
  }

  public static Map<String, Object> pickLocale(Map<String, Object> row, List<String> fieldNames, String locale) {
    Map<String, Object> out = new LinkedHashMap<>(row);
    for (String field : fieldNames) {
      String col = field + "_i18n";
      Object raw = row.get(col);
      Map<String, Object> parsed = parseJsonObject(raw == null ? null : raw.toString());
      Object v =
          firstNonNull(
              parsed.get(locale),
              parsed.get("en"),
              parsed.get("zh"),
              parsed.get("ar"),
              "");
      out.put(field, v == null ? "" : String.valueOf(v));
      out.remove(col);
    }
    return out;
  }

  private static Object firstNonNull(Object... xs) {
    for (Object x : xs) {
      if (x != null) {
        return x;
      }
    }
    return null;
  }

  public static String slug(String str) {
    if (str == null || str.isBlank()) {
      return "category";
    }
    String t = str.trim().replaceAll("\\s+", "-").toLowerCase(Locale.ROOT);
    t = SLUG_CLEAN.matcher(t).replaceAll("");
    return t.isEmpty() ? "category" : t;
  }
}
