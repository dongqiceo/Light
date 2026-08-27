package com.yellen.light.web.cms;

import static com.yellen.light.util.ApiJson.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/light-cms")
public class UploadCmsController {

  @Value("${light.upload-dir}")
  private String uploadDir;

  @PostMapping("/upload")
  public Map<String, Object> upload(MultipartFile file) throws IOException {
    if (file == null || file.isEmpty()) {
      return cmsErr("请选择要上传的图片", 100002);
    }
    String day = LocalDate.now().toString();
    Path dir = Path.of(uploadDir).toAbsolutePath().normalize().resolve(day);
    Files.createDirectories(dir);
    String original = file.getOriginalFilename();
    String ext = "";
    if (original != null && original.contains(".")) {
      ext = original.substring(original.lastIndexOf('.'));
    }
    if (ext.isEmpty()) {
      ext = ".jpg";
    }
    String filename = System.currentTimeMillis() + "-" + Long.toString((long) (Math.random() * 1e12), 36) + ext;
    Path target = dir.resolve(filename);
    file.transferTo(target.toFile());
    String url = "/uploads/" + day + "/" + filename;
    return cmsOk(Map.of("url", url), "上传成功");
  }
}
