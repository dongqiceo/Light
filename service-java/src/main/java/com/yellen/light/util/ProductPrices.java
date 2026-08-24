package com.yellen.light.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ProductPrices {

  private static final Logger log = LoggerFactory.getLogger(ProductPrices.class);
  private static final ObjectMapper MAPPER = new ObjectMapper();
  private static final List<String> LANGS = List.of("zh", "en", "ar");
  private static final Pattern CANONICAL = Pattern.compile("^(0|[1-9]\\d*)\\.\\d{2}$");

  private ProductPrices() {}

  public static boolean isCanonical(String text) {
    return text != null && CANONICAL.matcher(text).matches();
  }

  public static String requireCanonical(JsonNode node, String lang) {
    if (node == null || node.isMissingNode() || node.isNull()) {
      throw new IllegalArgumentException(lang + " 价格不能为空");
    }
    if (!node.isTextual() || !isCanonical(node.asText())) {
      throw new IllegalArgumentException(lang + " 价格必须是非负且最多保留两位小数的十进制字符串");
    }
    String text = node.asText();
    BigDecimal value = new BigDecimal(text);
    if (value.signum() < 0 || value.scale() != 2) {
      throw new IllegalArgumentException(lang + " 价格必须是非负且最多保留两位小数的十进制字符串");
    }
    return text;
  }

  public static Map<String, String> requiredFromBody(JsonNode body) {
    Map<String, String> prices = new LinkedHashMap<>();
    for (String lang : LANGS) {
      prices.put(lang, requireCanonical(body.path(lang).path("price"), lang));
    }
    return prices;
  }

  public static String toJson(Map<String, String> prices) {
    try {
      Map<String, String> ordered = new LinkedHashMap<>();
      for (String lang : LANGS) {
        ordered.put(lang, prices.get(lang));
      }
      return MAPPER.writeValueAsString(ordered);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("序列化价格失败", e);
    }
  }

  public static String localePrice(Object rawJson, String locale) {
    if (rawJson == null) {
      return null;
    }
    Map<String, Object> parsed = I18nUtils.parseJsonObject(rawJson.toString());
    Object value = parsed.get(locale);
    if (!(value instanceof String) || !isCanonical((String) value)) {
      return null;
    }
    return (String) value;
  }

  public static String zhPrice(Object rawJson) {
    return localePrice(rawJson, "zh");
  }

  public static Double compatibleRealOrNull(String zhCanonical) {
    if (!isCanonical(zhCanonical)) {
      return null;
    }
    BigDecimal zh = new BigDecimal(zhCanonical);
    double asDouble = zh.doubleValue();
    if (!Double.isFinite(asDouble)) {
      log.warn("zh 价格无法写入兼容列: {}", zhCanonical);
      return null;
    }
    if (BigDecimal.valueOf(asDouble).compareTo(zh) != 0) {
      log.warn("zh 价格无法无损写入 REAL 兼容列: {}", zhCanonical);
      return null;
    }
    return asDouble;
  }

  public static String fromLegacyReal(BigDecimal raw) {
    if (raw == null) {
      return null;
    }
    if (raw.signum() < 0) {
      throw new IllegalStateException("旧价格不能为负: " + raw.toPlainString());
    }
    BigDecimal scaled =
        raw.scale() <= 2
            ? raw.setScale(2, RoundingMode.UNNECESSARY)
            : raw.setScale(2, RoundingMode.HALF_UP);
    String text = scaled.toPlainString();
    if (!isCanonical(text)) {
      throw new IllegalStateException("旧价格无法规范为两位小数字符串: " + raw.toPlainString());
    }
    return text;
  }

  public static String nullI18nJson() {
    try {
      Map<String, Object> ordered = new LinkedHashMap<>();
      for (String lang : LANGS) {
        ordered.put(lang, null);
      }
      return MAPPER.writeValueAsString(ordered);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("序列化空价格失败", e);
    }
  }

  public static Map<String, Object> overlayListPrice(Map<String, Object> rec, Object priceI18n) {
    String zh = zhPrice(priceI18n);
    if (zh != null) {
      rec.put("price", zh);
    }
    return rec;
  }
}
