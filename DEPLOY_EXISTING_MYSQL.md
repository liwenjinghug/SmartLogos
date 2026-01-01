# 快速部署指南（服务器已有 MySQL）

## 前提条件

- 服务器已安装 Docker
- 服务器上已运行 MySQL（端口 3306）
- MySQL 已创建数据库 `smartlogos`

## 部署步骤

### 1. 本地打包项目

在本地项目目录下：

```bash
cd p:\软件工程\实验课\plus

# 压缩项目（Windows PowerShell）
tar -czf smartlogos.tar.gz --exclude=target --exclude=.git --exclude=.idea --exclude=uploads .
```

### 2. 上传到服务器

```bash
# 上传压缩包（替换为你的服务器地址）
scp smartlogos.tar.gz root@你的服务器IP:/opt/

# SSH 登录服务器
ssh root@你的服务器IP
```

### 3. 在服务器上解压

```bash
cd /opt
mkdir -p smartlogos
tar -xzf smartlogos.tar.gz -C smartlogos
cd smartlogos
```

### 4. 构建 Docker 镜像

```bash
# 构建后端镜像
docker build -t smartlogos-backend:latest .
```

### 5. 运行容器（连接服务器 MySQL）

```bash
# 创建上传目录
mkdir -p /opt/smartlogos/uploads

# 运行后端容器
docker run -d \
  --name smartlogos-backend \
  --restart always \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/smartlogos?useSSL=false&serverTimezone=UTC" \
  -e SPRING_DATASOURCE_USERNAME="root" \
  -e SPRING_DATASOURCE_PASSWORD="你的MySQL密码" \
  -e SPRING_PROFILES_ACTIVE="prod" \
  -v /opt/smartlogos/uploads:/app/uploads \
  --network host \
  smartlogos-backend:latest
```

**参数说明：**
- `--network host`：使用宿主机网络，容器可以直接访问 `localhost:3306` 的 MySQL
- `-e SPRING_DATASOURCE_URL`：数据库连接地址（使用 localhost）
- `-e SPRING_DATASOURCE_USERNAME`：MySQL 用户名
- `-e SPRING_DATASOURCE_PASSWORD`：MySQL 密码（替换为实际密码）
- `-v /opt/smartlogos/uploads:/app/uploads`：文件上传目录映射

### 6. 验证部署

```bash
# 查看容器状态
docker ps | grep smartlogos

# 查看日志
docker logs -f smartlogos-backend

# 测试 API
curl http://localhost:8080/api/documents?user_id=1
```

## 常用管理命令

```bash
# 停止容器
docker stop smartlogos-backend

# 启动容器
docker start smartlogos-backend

# 重启容器
docker restart smartlogos-backend

# 删除容器
docker rm -f smartlogos-backend

# 查看日志
docker logs -f smartlogos-backend

# 进入容器
docker exec -it smartlogos-backend bash
```

## 更新部署

```bash
# 1. 停止并删除旧容器
docker stop smartlogos-backend
docker rm smartlogos-backend

# 2. 删除旧镜像（可选）
docker rmi smartlogos-backend:latest

# 3. 重新构建镜像
docker build -t smartlogos-backend:latest .

# 4. 重新运行容器（使用上面的 docker run 命令）
```

## 配置防火墙

确保服务器防火墙开放 8080 端口：

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 8080/tcp
sudo ufw reload

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

## MySQL 配置检查

确保 MySQL 允许本地连接：

```bash
# 登录 MySQL
mysql -uroot -p

# 检查数据库
SHOW DATABASES;

# 如果没有 smartlogos 数据库，创建它
CREATE DATABASE IF NOT EXISTS smartlogos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 退出
EXIT;
```

## 故障排查

### 问题 1：无法连接数据库

```bash
# 检查 MySQL 是否运行
systemctl status mysql
# 或
systemctl status mariadb

# 测试数据库连接
mysql -h localhost -uroot -p -e "SELECT 1"

# 查看容器日志
docker logs smartlogos-backend | grep -i mysql
```

### 问题 2：容器启动失败

```bash
# 查看详细日志
docker logs smartlogos-backend

# 检查镜像是否构建成功
docker images | grep smartlogos

# 检查端口占用
netstat -tlnp | grep 8080
```

### 问题 3：无法访问 API

```bash
# 检查容器是否运行
docker ps | grep smartlogos

# 检查防火墙
sudo ufw status

# 测试本地访问
curl http://localhost:8080/api/documents?user_id=1

# 如果本地可以访问但外部不行，检查防火墙和云服务器安全组
```

## 性能优化建议

1. **调整 JVM 内存**（如果服务器内存充足）：
   ```bash
   docker run -d \
     --name smartlogos-backend \
     -e JAVA_OPTS="-Xmx2g -Xms1g" \
     ... 其他参数 ...
   ```

2. **配置日志轮转**：
   ```bash
   docker run -d \
     --name smartlogos-backend \
     --log-driver json-file \
     --log-opt max-size=10m \
     --log-opt max-file=3 \
     ... 其他参数 ...
   ```

## 备份建议

```bash
# 定时备份数据库（添加到 crontab）
0 2 * * * mysqldump -uroot -p你的密码 smartlogos > /backup/smartlogos_$(date +\%Y\%m\%d).sql

# 备份上传文件
0 3 * * * tar -czf /backup/uploads_$(date +\%Y\%m\%d).tar.gz /opt/smartlogos/uploads
```

---

**部署后访问地址：** `http://你的服务器IP:8080/api`

**前端配置：**
```env
REACT_APP_API_BASE_URL=http://你的服务器IP:8080/api
```
