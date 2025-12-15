# Docker Compose 完整部署指南（包含 MySQL）

## 本地操作

### 1. 构建并推送镜像

```powershell
# 进入项目目录
cd p:\软件工程\实验课\plus

# 登录阿里云镜像仓库
docker login --username=你的阿里云账号 crpi-8wr8pty3odc286ne.cn-chengdu.personal.cr.aliyuncs.com

# 构建镜像
docker build -t crpi-8wr8pty3odc286ne.cn-chengdu.personal.cr.aliyuncs.com/glycomind/smartlogos-backend:v1 .

# 推送镜像
docker push crpi-8wr8pty3odc286ne.cn-chengdu.personal.cr.aliyuncs.com/glycomind/smartlogos-backend:v1
```

### 2. 准备部署文件

将以下文件上传到服务器：
- `docker-compose.yml`
- `sql/smartlogos.sql`（如果有初始化脚本）

```powershell
# 压缩需要的文件
tar -czf deploy.tar.gz docker-compose.yml sql/

# 上传到服务器
scp deploy.tar.gz root@服务器IP:/opt/smartlogos/
```

---

## 服务器操作

### 1. 解压文件

```bash
cd /opt/smartlogos
tar -xzf deploy.tar.gz
```

### 2. 创建上传目录

```bash
mkdir -p /opt/smartlogos/uploads
```

### 3. 登录阿里云镜像仓库

```bash
docker login --username=你的阿里云账号 crpi-8wr8pty3odc286ne.cn-chengdu.personal.cr.aliyuncs.com
```

### 4. 启动服务

```bash
cd /opt/smartlogos

# 启动所有服务（MySQL + 后端）
docker-compose up -d

# 查看启动状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 5. 验证部署

```bash
# 等待服务启动（约30秒）
sleep 30

# 测试后端接口
curl http://localhost:8006/api/documents?user_id=1

# 测试 MySQL
docker-compose exec mysql mysql -uroot -pwhz123456 -e "SHOW DATABASES;"
```

---

## 常用管理命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f mysql

# 停止服务
docker-compose stop

# 启动服务
docker-compose start

# 重启服务
docker-compose restart

# 停止并删除所有容器（保留数据）
docker-compose down

# 停止并删除所有容器和数据卷（⚠️ 会删除数据库数据）
docker-compose down -v
```

---

## 更新部署

### 本地构建新版本

```powershell
cd p:\软件工程\实验课\plus

# 构建新版本
docker build -t crpi-8wr8pty3odc286ne.cn-chengdu.personal.cr.aliyuncs.com/glycomind/smartlogos-backend:v2 .

# 推送新版本
docker push crpi-8wr8pty3odc286ne.cn-chengdu.personal.cr.aliyuncs.com/glycomind/smartlogos-backend:v2
```

### 服务器更新

```bash
# 修改 docker-compose.yml 中的镜像版本号为 v2
nano docker-compose.yml

# 拉取新镜像
docker-compose pull backend

# 重新启动后端（不影响 MySQL）
docker-compose up -d backend

# 查看日志
docker-compose logs -f backend
```

---

## 配置说明

### 端口映射
- **MySQL**: `3310:3306`（宿主机 3310 → 容器 3306）
- **后端**: `8006:8080`（宿主机 8006 → 容器 8080）

### 环境变量
- `MYSQL_ROOT_PASSWORD`: whz123456
- `MYSQL_DATABASE`: smartlogos
- `SPRING_DATASOURCE_URL`: jdbc:mysql://mysql:3306/smartlogos
- `SPRING_DATASOURCE_PASSWORD`: whz123456

### 数据持久化
- MySQL 数据存储在 Docker 卷 `mysql-data` 中
- 上传文件存储在 `./uploads` 目录中

---

## 阿里云安全组配置

确保开放以下端口：
- **8006**（后端 API）
- **3310**（MySQL，如需外部访问）

---

## 前端配置

```env
REACT_APP_API_BASE_URL=http://服务器公网IP:8006/api
REACT_APP_AI_BASE_URL=http://47.108.189.246:8005
```

---

## 故障排查

### 查看容器状态
```bash
docker-compose ps
```

### 查看详细日志
```bash
docker-compose logs -f backend
docker-compose logs -f mysql
```

### 进入容器调试
```bash
docker-compose exec backend bash
docker-compose exec mysql bash
```

### 重置环境（清空数据库）
```bash
docker-compose down -v
docker-compose up -d
```

---

## 备份与恢复

### 备份数据库
```bash
docker-compose exec mysql mysqldump -uroot -pwhz123456 smartlogos > backup_$(date +%Y%m%d).sql
```

### 恢复数据库
```bash
docker-compose exec -T mysql mysql -uroot -pwhz123456 smartlogos < backup.sql
```

### 备份上传文件
```bash
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

---

## 完整部署流程总结

1. **本地**: 构建镜像 → 推送到阿里云
2. **服务器**: 上传 docker-compose.yml → 启动服务
3. **验证**: 测试接口 → 配置前端
4. **维护**: 定期备份 → 版本更新

简单几条命令就能完成完整部署！🚀
