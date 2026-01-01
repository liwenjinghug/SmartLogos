# 使用 OpenJDK 17 作为基础镜像
FROM openjdk:17-jdk-slim

# 设置工作目录
WORKDIR /app

# 安装必要的工具
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制 Maven 包装器和 pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# 给 Maven 包装器执行权限
RUN chmod +x mvnw

# 下载依赖（利用 Docker 缓存）
RUN ./mvnw dependency:go-offline -B

# 复制源代码
COPY src src

# 编译项目
RUN ./mvnw clean package -DskipTests

# 创建上传目录
RUN mkdir -p /app/uploads

# 暴露端口
EXPOSE 8080

# 设置环境变量
ENV SPRING_PROFILES_ACTIVE=prod

# 启动应用
ENTRYPOINT ["java", "-jar", "target/note-1.0.0.jar"]
