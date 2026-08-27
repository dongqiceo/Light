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
import org.springframework.web.bind.annotation.RequestHeader;
import com.yellen.light.service.UserService;

@RestController
@RequestMapping("/light-cms")
public class UploadCmsController {

  @Value("${light.upload-dir}")
  private String uploadDir;

  @Value("${light.upload-base-url}")
  private String uploadBaseUrl;

  private final UserService userService;

  public UploadCmsController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("/upload")
  public Map<String, Object> upload(MultipartFile file,
      @RequestHeader(value = "Authorization", required = false) String authorization) throws IOException {
    return saveFile(file, false, authorization);
  }

  @PostMapping("/user/avatar")
  public Map<String, Object> uploadAvatar(MultipartFile file,
      @RequestHeader(value = "Authorization", required = false) String authorization) throws IOException {
    return saveFile(file, true, authorization);
  }

  private Map<String, Object> saveFile(MultipartFile file, boolean avatar, String authorization) throws IOException {
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
    if (avatar) {
      userService.updateAvatar(extractToken(authorization), url);
    }

    return cmsOk(Map.of("url", url), "上传成功");
  }

  private String extractToken(String authorization) {
    return authorization != null && authorization.startsWith("Bearer ")
        ? authorization.substring(7) : authorization;
  }
}
