#!/bin/bash
# P0-2: 压缩全站图片为展示用小图，并把原始大图备份到 images/full/
# 策略：
#   - images/x.jpg (原图) → 备份到 images/full/x.jpg (原图，供 lightbox 点击查看)
#   - images/x.jpg → 用 sips 压缩成宽长边≤800px、质量85 的小图（浏览器默认加载）
set -euo pipefail

cd "$(dirname "$0")/netlify-current"
IMGDIR="images"
FULLDIR="images/full"
mkdir -p "$FULLDIR"

echo "=== 备份原图到 $FULLDIR 并压缩 ==="
total=$(ls "$IMGDIR"/*.jpg 2>/dev/null | wc -l | tr -d ' ')
count=0
saved=0
for f in "$IMGDIR"/*.jpg; do
  bn=$(basename "$f")
  orig=$(du -k "$f" | cut -f1)
  # 1) 备份原图（若 full 下还没有同名文件）
  if [ ! -f "$FULLDIR/$bn" ]; then
    cp "$f" "$FULLDIR/$bn"
  fi
  # 2) 压缩替换
  sips -Z 800 -s format jpeg -s formatOptions 85 "$f" --out "$f" >/dev/null 2>&1
  new=$(du -k "$f" | cut -f1)
  saved=$((saved + orig - new))
  count=$((count + 1))
  if [ $((count % 10)) -eq 0 ]; then
    echo "  ... $count/$total 张已处理"
  fi
done

echo ""
echo "=== 完成 ==="
echo "共处理 $count 张图片"
echo "原始文件大小:" $(du -sh "$IMGDIR" | cut -f1)
echo "full 目录大小:" $(du -sh "$FULLDIR" | cut -f1)
echo "预估节省: ${saved}KB"
