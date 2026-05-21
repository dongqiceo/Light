package com.yellen.light.util;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

public final class ContactPayloadValidator {

  private static final Pattern EMAIL_RE = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
  public static final String MSG_REQUIRED = "Name, email and message are required";
  public static final String MSG_INVALID_EMAIL = "Invalid email format";

  private ContactPayloadValidator() {}

  public static ValidationResult validate(JsonNode body) {
    if (body != null && body.isObject()) {
      if (body.has("phone") || body.has("subject")) {
        // deprecated fields — not mapped; logged at controller if needed
      }
    }

    String name = trimField(body, "name");
    String email = trimField(body, "email");
    String message = trimField(body, "message");

    if (name == null || email == null || message == null) {
      return ValidationResult.fail(100002, MSG_REQUIRED);
    }

    if (!EMAIL_RE.matcher(email).matches()) {
      return ValidationResult.fail(100003, MSG_INVALID_EMAIL);
    }

    Map<String, String> row = new LinkedHashMap<>();
    row.put("name", name);
    row.put("email", email);
    row.put("message", message);
    row.put("country", optionalField(body, "country"));
    row.put("tel", optionalField(body, "tel"));
    row.put("whatsapp", optionalField(body, "whatsapp"));
    row.put("company", optionalField(body, "company"));
    return ValidationResult.ok(row);
  }

  private static String trimField(JsonNode body, String field) {
    if (body == null || !body.isObject()) {
      return null;
    }
    JsonNode n = body.get(field);
    if (n == null || n.isNull()) {
      return null;
    }
    String s = n.asText().trim();
    return s.isEmpty() ? null : s;
  }

  private static String optionalField(JsonNode body, String field) {
    if (body == null || !body.isObject()) {
      return null;
    }
    JsonNode n = body.get(field);
    if (n == null || n.isNull()) {
      return null;
    }
    String s = n.asText().trim();
    return s.isEmpty() ? null : s;
  }

  public static final class ValidationResult {
    public final boolean ok;
    public final int code;
    public final String message;
    public final Map<String, String> row;

    private ValidationResult(boolean ok, int code, String message, Map<String, String> row) {
      this.ok = ok;
      this.code = code;
      this.message = message;
      this.row = row;
    }

    static ValidationResult ok(Map<String, String> row) {
      return new ValidationResult(true, 200, null, row);
    }

    static ValidationResult fail(int code, String message) {
      return new ValidationResult(false, code, message, null);
    }
  }
}
