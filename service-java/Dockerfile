# Backend service image for Spring Boot
FROM maven:3.9.9-eclipse-temurin-11 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:11-jre-jammy
WORKDIR /app
COPY --from=build /workspace/target/light-service-1.0.0.jar ./app.jar
RUN mkdir -p /app/data /app/light/public/uploads

EXPOSE 3001
ENV LIGHT_DB_PATH=/app/data/light.db \
    LIGHT_STATIC_PATH=/app/light/public \
    LIGHT_ASSETS_PATH=/app/light/public/uploads \
    LIGHT_UPLOAD_DIR=/app/light/public/uploads
VOLUME ["/app/data", "/app/light/public"]
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
