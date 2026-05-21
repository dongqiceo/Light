package com.yellen.light.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/** 与 Node 端 toLocaleString('zh-CN') + replace(/\//g,'-') 风格对齐 */
public final class DbTime {

  private static final DateTimeFormatter FMT =
      DateTimeFormatter.ofPattern("yyyy/M/d HH:mm:ss", Locale.CHINA);

  private DbTime() {}

  public static String now() {
    return FMT.format(LocalDateTime.now()).replace('/', '-');
  }
}
