#!/bin/bash

# 租房大冒险 - 部署脚本
# 自动同步文件到远程服务器并重启 Node.js 服务

set -e  # 遇到错误立即退出

# 配置
REMOTE_USER="root"
REMOTE_HOST="lh.grissom.cn"
REMOTE_PORT="36000"
REMOTE_PATH="/var/www/rogue_rental/"
LOCAL_PATH="/Users/grissom/Code/rogue_rental/"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  租房大冒险 - 部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"

# 生成版本号（时间戳）
VERSION=$(date +%s)
echo -e "\n${BLUE}版本号: ${VERSION}${NC}"

# 1. 同步文件
echo -e "\n${YELLOW}[1/4] 同步文件到服务器...${NC}"
rsync -avz \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.DS_Store' \
  --exclude='deploy.sh' \
  --exclude='.claude' \
  --exclude='*.json' \
  -e "ssh -p ${REMOTE_PORT}" \
  "${LOCAL_PATH}" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

echo -e "${GREEN}✓ 文件同步完成${NC}"

# 2. 更新版本号
echo -e "\n${YELLOW}[2/4] 更新 HTML 版本号...${NC}"
ssh -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} << EOF
cd /var/www/rogue_rental
sed -i "s/__VERSION__/${VERSION}/g" index.html
EOF

echo -e "${GREEN}✓ 版本号更新完成: ${VERSION}${NC}"

# 3. 重启 PM2 服务
echo -e "\n${YELLOW}[3/4] 重启 Node.js 服务...${NC}"
ssh -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} << 'EOF'
cd /var/www/rogue_rental
pm2 restart rogue_rental || pm2 start server.js --name rogue_rental
pm2 save
EOF

echo -e "${GREEN}✓ 服务重启完成${NC}"

# 4. 验证部署
echo -e "\n${YELLOW}[4/4] 验证部署...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://rental.grissom.cn/)
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://rental.grissom.cn/api/votes?eventId=1001)

if [ "$HTTP_CODE" == "200" ] && [ "$API_CODE" == "200" ]; then
    echo -e "${GREEN}✓ 部署验证成功${NC}"
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  部署完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "网站: ${BLUE}https://rental.grissom.cn${NC}"
    echo -e "API:  ${BLUE}https://rental.grissom.cn/api/votes${NC}"
else
    echo -e "${YELLOW}⚠ 部署可能有问题，请检查服务状态${NC}"
    echo -e "HTTP: $HTTP_CODE (期望: 200)"
    echo -e "API:  $API_CODE (期望: 200)"
fi

echo ""
