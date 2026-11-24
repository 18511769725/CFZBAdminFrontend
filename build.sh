#!/bin/bash

# 进入脚本所在目录，保证路径正确
cd "$(dirname "$0")" || exit

echo "====================================="
echo " 1. 清理旧文件"
echo "====================================="

# 删除旧 dist 目录
if [ -d "dist" ]; then
  rm -rf dist
  echo "✅ 已删除 dist 目录"
fi

# 删除旧压缩包
if [ -f "dist.tar" ]; then
  rm -f dist.tar
  echo "✅ 已删除 dist.tar 文件"
fi

echo -e "\n====================================="
echo " 2. 开始编译：yarn build"
echo "====================================="
# 执行编译
yarn build

# 判断编译是否成功
if [ $? -ne 0 ]; then
  echo -e "\n❌ yarn build 执行失败，退出脚本！"
  exit 1
fi

echo -e "\n====================================="
echo " 3. 打包：tar -zcvf dist.tar dist"
echo "====================================="
tar -zcvf dist.tar dist

echo -e "\n====================================="
echo " ✅ 全部完成！"
echo " 生成文件：dist.tar"
echo "====================================="
