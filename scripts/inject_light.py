#!/usr/bin/env python3
"""
vapeove 全站白底商务风铺全站脚本 (主线1)  —— 字节级安全版
给所有引用 style.css 的页面，在同一路径深度处、style.css(或 cyberpunk.css) 行之后插入 light.css。
幂等：已含 light.css 引用则跳过。

关键：以二进制模式 rb/wb 读写，不做任何行尾转换，确保原文件字节完全不变，仅新增一行。
原文件为 CRLF 的保持不变，为 LF 的也保持不变。绝不影响其它内容。

用法:
  python3 inject_light.py            # 实际执行
  python3 inject_light.py --dry      # 仅统计，不改文件
"""
import os, sys, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # site 根目录（scripts 的上级）
DRY = '--dry' in sys.argv

# 字节级精确匹配 style.css 引用行（捕获 href 前缀，如 css/ ../css/ ../../css/）
STYLE_BYTES_RE = re.compile(rb'<link rel="stylesheet" href="([^"]*?)(style\.css[^"]*)">')
LIGHT_BYTES = b'light.css'
CYBER_BYTES = b'cyberpunk.css'

def _eol_at(data, nl):
    """返回 nl 位置处的换行符字节（CRLF 或 LF）。nl 为 \n 的下标。"""
    return b'\r\n' if data[nl - 1:nl] == b'\r' else b'\n'

def process(path):
    """返回 ('ok'|'skip_exists'|'skip_nostyle'|'error_nochange', 插入计数)"""
    with open(path, 'rb') as f:
        data = f.read()

    if LIGHT_BYTES in data:
        return ('skip_exists', 0)

    m = STYLE_BYTES_RE.search(data)
    if not m:
        return ('skip_nostyle', 0)

    dirpart = m.group(1)  # 如 b'css/' 或 b'../css/' —— 与 style.css 同深度的路径前缀

    # 定位匹配行的行尾（\n 下标）
    nl = data.find(b'\n', m.end())
    if nl == -1:
        return ('error_nochange', 0)

    eol = _eol_at(data, nl)
    anchor_nl = nl

    # 若 style.css 行后 1-2 行内有 cyberpunk.css，则改插到 cyberpunk 行之后（保证覆盖优先级）
    scan = nl + 1
    for _ in range(3):
        if scan >= len(data):
            break
        n2 = data.find(b'\n', scan)
        if n2 == -1:
            break
        seg = data[scan:n2]
        if CYBER_BYTES in seg:
            anchor_nl = n2
            eol = _eol_at(data, n2)
            break
        scan = n2 + 1

    new_line = b'<link rel="stylesheet" href="' + dirpart + b'light.css?v=20260902">'
    new_data = data[:anchor_nl + 1] + new_line + eol + data[anchor_nl + 1:]

    if new_data == data:
        return ('error_nochange', 0)

    if not DRY:
        with open(path, 'wb') as f:
            f.write(new_data)
    return ('ok', 1)

def main():
    htmls = [p for p in glob.glob(os.path.join(ROOT, '**', '*.html'), recursive=True)]
    stats = {'ok': 0, 'skip_exists': 0, 'skip_nostyle': 0, 'error_nochange': 0}
    examples = {'ok': [], 'skip_nostyle': [], 'error_nochange': []}
    for p in sorted(htmls):
        rel = os.path.relpath(p, ROOT)
        r, cnt = process(p)
        stats[r] += 1
        if r in ('ok', 'skip_nostyle', 'error_nochange'):
            if len(examples[r]) < 5:
                examples[r].append(rel)

    print(f"=== 模式: {'DRY(不写文件)' if DRY else '实际执行'} ===")
    print(f"HTML 总数: {len(htmls)}")
    print(f"插入 light.css 成功: {stats['ok']}")
    print(f"已存在(跳过): {stats['skip_exists']}")
    print(f"无 style.css(跳过): {stats['skip_nostyle']}")
    print(f"异常(未变化): {stats['error_nochange']}")
    print("--- 插入示例 ---")
    for e in examples['ok'][:8]:
        print("  +", e)
    print("--- 无 style.css ---")
    for e in examples['skip_nostyle']:
        print("  =", e)
    print("--- 异常 ---")
    for e in examples['error_nochange']:
        print("  !", e)

if __name__ == '__main__':
    main()
