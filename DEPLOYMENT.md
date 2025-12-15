# SmartLogos 后端部署指南

## 🚀 Docker 部署到服务器

### 前置准备

1. **服务器要求**
   - 操作系统：Linux (Ubuntu 20.04+ 推荐)
   - Docker 版本：20.10+
   - Docker Compose 版本：2.0+
   - 最小配置：2核 CPU、4GB 内存、20GB 存储

2. **安装 Docker 和 Docker Compose**
   ```bash
   # 安装 Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # 安装 Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   
   # 验证安装
   docker --version
   docker-compose --version
   ```

### 部署步骤

#### 方法一：完整部署（推荐，包含数据库）

1. **上传项目到服务器**
   ```bash
   # 在本地打包项目
   cd p:\软件工程\实验课\plus
   
   # 压缩项目（排除不必要的文件）
   tar -czf smartlogos-backend.tar.gz \
       --exclude=target \
       --exclude=.git \
       --exclude=.idea \
       --exclude=uploads \
       .
   
   # 上传到服务器（替换为你的服务器地址）
   scp smartlogos-backend.tar.gz root@47.108.189.246:/opt/
   ```

2. **在服务器上解压**
   ```bash
   # SSH 登录到服务器
   ssh root@47.108.189.246
   
   # 解压项目
   cd /opt
   tar -xzf smartlogos-backend.tar.gz -C /opt/smartlogos
   cd /opt/smartlogos
   ```

3. **修改配置（可选）**
   
   编辑 `docker-compose.yml`，如果需要修改端口或数据库密码：
   ```bash
   nano docker-compose.yml
   ```

4. **启动服务**
   ```bash
   # 构建并启动所有容器
   docker-compose up -d
   
   # 查看日志
   docker-compose logs -f
   
   # 查看容器状态
   docker-compose ps
   ```

5. **验证部署**
   ```bash
   # 测试后端 API
   curl http://localhost:8080/api/documents?user_id=1
   
   # 或在浏览器访问
   http://47.108.189.246:8080/api/documents?user_id=1
   ```

#### 方法二：仅部署后端（使用外部数据库）

如果服务器上已有 MySQL，只需部署后端应用：

```bash
# 构建 Docker 镜像
docker build -t smartlogos-backend:latest .

# 运行容器
docker run -d \
  --name smartlogos-mysql \
  --restart always \
  -p 8006:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/smartlogos?useSSL=false&serverTimezone=UTC" \
  -e SPRING_DATASOURCE_USERNAME="root" \
  -e SPRING_DATASOURCE_PASSWORD="whz123456" \
  -e SPRING_PROFILES_ACTIVE="prod" \
  -v /opt/smartlogos/uploads:/app/uploads \
  --network host \
  smartlogos-mysql:v1

# 查看日志
docker logs -f smartlogos-backend
```

### 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f mysql

# 停止服务
docker-compose stop

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build

# 完全清理（包括数据库数据！）
docker-compose down -v
```

### 更新部署

```bash
# 1. 停止旧服务
docker-compose down

# 2. 拉取新代码或上传新文件

# 3. 重新构建并启动
docker-compose up -d --build
```

### 防火墙配置

确保服务器防火墙开放 8080 端口：

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 8080/tcp
sudo ufw reload

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

### 数据库管理

**访问 MySQL 容器**
```bash
docker-compose exec mysql mysql -uroot -p123456
```

**备份数据库**
```bash
docker-compose exec mysql mysqldump -uroot -p123456 smartlogos > backup_$(date +%Y%m%d).sql
```

**恢复数据库**
```bash
docker-compose exec -T mysql mysql -uroot -p123456 smartlogos < backup.sql
```

### 监控和维护

**查看容器资源占用**
```bash
docker stats smartlogos-backend smartlogos-mysql
```

**查看磁盘占用**
```bash
docker system df
```

**清理无用镜像和容器**
```bash
docker system prune -a
```

### 前端对接配置

前端需要修改 `.env` 文件指向服务器地址：

```env
REACT_APP_AI_BASE_URL=http://47.108.189.246:8005
REACT_APP_API_BASE_URL=http://47.108.189.246:8080/api
```

或者在服务器上部署 Nginx 反向代理，统一域名访问。

### 故障排查

**问题 1：容器无法启动**
```bash
# 查看详细错误日志
docker-compose logs backend
```

**问题 2：连接数据库失败**
```bash
# 检查 MySQL 是否启动
docker-compose ps mysql

# 进入后端容器测试连接
docker-compose exec backend bash
curl mysql:3306
```

**问题 3：端口被占用**
```bash
# 查看端口占用
sudo lsof -i :8080
sudo lsof -i :3306

# 修改 docker-compose.yml 中的端口映射
```

**问题 4：文件上传失败**
```bash
# 检查上传目录权限
ls -la uploads/
chmod 777 uploads/
```

### 生产环境优化建议

1. **使用环境变量管理敏感信息**
   ```bash
   # 创建 .env 文件
   cat > .env <<EOF
   MYSQL_ROOT_PASSWORD=强密码
   SPRING_DATASOURCE_PASSWORD=强密码
   EOF
   
   # 在 docker-compose.yml 中引用
   env_file:
     - .env
   ```

2. **启用 HTTPS（使用 Nginx + Let's Encrypt）**
   
3. **定时备份数据库**
   ```bash
   # 添加 crontab 任务
   0 2 * * * cd /opt/smartlogos && docker-compose exec -T mysql mysqldump -uroot -p123456 smartlogos > /backup/db_$(date +\%Y\%m\%d).sql
   ```

4. **配置日志轮转**
   ```bash
   # 限制 Docker 日志大小
   # 在 docker-compose.yml 中添加
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

### 联系和支持

- 项目文档：查看项目 README.md
- 前端对接：参考前端文档中的接口说明
- 技术支持：联系项目负责人

---

**部署完成后，后端 API 地址为：**
- 本地测试：`http://localhost:8080/api`
- 服务器访问：`http://47.108.189.246:8080/api`

**核心接口清单：**
1. `GET /api/documents?user_id=1` - 文档列表
2. `POST /api/analyze` - AI 文件分析（multipart/form-data，字段 `file`）
3. `GET /api/documents/{id}` - 笔记详情
4. `GET /api/quizzes` - 题目列表
5. `POST /api/chat` - AI 问答
