package com.yellen.light.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * 用户实体类
 */
public class User {
  private long id;
  private String username;

  @JsonIgnore
  private String password;

  private String nickName;
  private String name;
  private String gender;
  private String avatar;
  private long createTime;
  private long updateTime;
  private boolean active;
  private boolean mustChangePassword;

  public User() {}

  public User(String username, String password, String name) {
    this.username = username;
    this.password = password;
    this.name = name;
    this.nickName = name;
    this.gender = "MALE";
    this.active = true;
    this.createTime = System.currentTimeMillis();
    this.updateTime = System.currentTimeMillis();
  }

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getNickName() {
    return nickName;
  }

  public void setNickName(String nickName) {
    this.nickName = nickName;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getGender() {
    return gender;
  }

  public void setGender(String gender) {
    this.gender = gender;
  }

  public String getAvatar() {
    return avatar;
  }

  public void setAvatar(String avatar) {
    this.avatar = avatar;
  }

  public long getCreateTime() {
    return createTime;
  }

  public void setCreateTime(long createTime) {
    this.createTime = createTime;
  }

  public long getUpdateTime() {
    return updateTime;
  }

  public void setUpdateTime(long updateTime) {
    this.updateTime = updateTime;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  public boolean isMustChangePassword() {
    return mustChangePassword;
  }

  public void setMustChangePassword(boolean mustChangePassword) {
    this.mustChangePassword = mustChangePassword;
  }
}
