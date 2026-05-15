from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

OUT = Path(__file__).resolve().parent
ASSET = OUT / "assets" / "image1.png"
W, H = 1240, 1754

FONT_REG = "C:/Windows/Fonts/msyh.ttc"
FONT_MED = "C:/Windows/Fonts/msyhbd.ttc"
FONT_BOLD = "C:/Windows/Fonts/msyhbd.ttc"


def font(size, weight="reg"):
    path = {"reg": FONT_REG, "med": FONT_MED, "bold": FONT_BOLD}.get(weight, FONT_REG)
    return ImageFont.truetype(path, size)


def draw_text(
    draw,
    xy,
    text,
    size=26,
    fill=(30, 35, 42),
    weight="reg",
    max_width=None,
    line_gap=8,
    max_lines=None,
    ellipsis=False,
):
    f = font(size, weight)
    x, y = xy
    raw_lines = str(text).split("\n")
    wrapped = []
    if max_width is None:
        for line in raw_lines:
            draw.text((x, y), line, font=f, fill=fill)
            y += int(size * 1.42) + line_gap
        return y

    for raw in raw_lines:
        current = ""
        for ch in raw:
            trial = current + ch
            if draw.textlength(trial, font=f) <= max_width or not current:
                current = trial
            else:
                wrapped.append(current)
                current = ch
        if current or raw == "":
            wrapped.append(current)

    if max_lines is not None and len(wrapped) > max_lines:
        wrapped = wrapped[:max_lines]
        if ellipsis:
            last = wrapped[-1]
            while draw.textlength(last + "...", font=f) > max_width and last:
                last = last[:-1]
            wrapped[-1] = last + "..."

    for line in wrapped:
        draw.text((x, y), line, font=f, fill=fill)
        y += int(size * 1.42) + line_gap
    return y


def section_title(draw, x, y, title, color=(31, 78, 121), rule_to=None, size=26):
    draw.text((x, y), title, font=font(size, "bold"), fill=color)
    if rule_to:
        tw = draw.textlength(title, font=font(size, "bold"))
        draw.line((x + tw + 18, y + size // 2 + 4, rule_to, y + size // 2 + 4), fill=(214, 222, 230), width=2)
    return y + size + 20


def bullet(draw, x, y, text, width, size=22, fill=(45, 51, 60), accent=(31, 78, 121), max_lines=2):
    draw.ellipse((x, y + 11, x + 7, y + 18), fill=accent)
    return draw_text(draw, (x + 22, y), text, size=size, fill=fill, max_width=width - 22, line_gap=2, max_lines=max_lines, ellipsis=True)


def pill(draw, x, y, text, fill, stroke, text_fill, h=38, px=18, size=20):
    f = font(size, "med")
    tw = int(draw.textlength(text, font=f))
    w = tw + px * 2
    draw.rounded_rectangle((x, y, x + w, y + h), radius=6, fill=fill, outline=stroke, width=1)
    draw.text((x + px, y + 6), text, font=f, fill=text_fill)
    return x + w + 10


def fit_cover_circle(img, size):
    img = ImageOps.exif_transpose(img).convert("RGBA")
    img = ImageOps.fit(img, (size, size), method=Image.Resampling.LANCZOS, centering=(0.5, 0.28))
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((0, 0, size - 1, size - 1), fill=255)
    out = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    out.paste(img, (0, 0), mask)
    return out


summary = (
    "6年C/C++工程开发经验，长期负责激光雷达上位机、嵌入式服务端、数据采集链路和工具链建设。"
    "主导HGS300、PRO360、Jolidar系列软件生态落地，具备跨平台Qt、Linux、Vue3设备Web控制、"
    "传感器集成与现场联调经验。"
)

skills = [
    "C/C++",
    "Qt5",
    "Linux",
    "RK3568",
    "Vue3",
    "HTTP服务",
    "点云/IMU数据流",
    "共享缓存队列",
    "卡尔曼滤波",
    "Chi-Square Test",
    "系统集成",
    "文档标准化",
]

experiences = [
    ("2025.09 - 2025.12", "东风研发总院", "仪表中间件开发工程师 | 智能驾驶"),
    ("2023.05 - 2025.07", "武汉珞珈伊云光电有限公司", "C++开发工程师 | 激光雷达"),
    ("2021.12 - 2023.04", "武汉光昱智能科技有限公司", "C++开发工程师 | 智能驾驶"),
    ("2020.11 - 2021.11", "上海戎磐网络科技有限公司", "C++开发工程师 | 信息安全"),
]

projects = [
    (
        "激光雷达软件生态负责人",
        "2023.05 - 2025.07",
        [
            "从0到1设计HGS300、PRO360、Jolidar系列核心软件架构，支撑三代产品迭代与交付。",
            "重构三进程遗留方案，基于交叉编译Qt5环境适配RK3568，实现单体服务端架构。",
            "针对2200KHz点云与900Hz IMU并发数据流，引入单生产者-单消费者模式和共享缓存队列，降低锁竞争开销。",
            "点云丢包率由0.1%~0.03%降至0.006%~0.001%，IMU最大丢包间隔由90~690ms降至20~90ms。",
        ],
    ),
    (
        "PRO360 框架复用与工具链扩展",
        "2023.10 - 2025.06",
        [
            "复用HGS300验证过的数据IO、HTTP服务和Web控制架构，数周内完成上位机软件移植适配。",
            "开发波形回放、点云回放和质量分析工具，建立标准化LAS文件与质检报告输出流程。",
            "核心软件框架跨平台复用率超过70%，支撑后续设备快速交付。",
        ],
    ),
    (
        "Jolidar 客制化与系统集成",
        "2024.10 - 2025.07",
        [
            "面向无人机航空测绘场景，设计客户私有协议适配方案并完成与飞控系统对接。",
            "主导相机SDK适配、新款IMU自动解析脚本开发和现场稳定性测试，解决图传数据丢失与照片质量问题。",
        ],
    ),
    (
        "L2 卫惯组合导航算法量产",
        "2022.11 - 2023.04",
        [
            "重构20+页详细设计文档结构，以模块职责、接口通信、UML类图和时序图规范团队交付物。",
            "引入Chi-Square Test识别高置信度异常GPS观测，并动态缩放观测噪声协方差，改善复杂城市环境定位鲁棒性。",
        ],
    ),
]

education = [
    ("2018.09 - 2020.07", "湖北师范大学", "计算机科学与技术 | 统招专升本"),
    ("2015.09 - 2018.07", "武汉软件工程职业学院", "网络技术 | 大专"),
]


def render_01():
    img = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(img)
    x, y = 88, 74
    d.text((x, y), "刘唱", font=font(48, "bold"), fill=(22, 30, 41))
    d.text((x + 138, y + 18), "C/C++ 开发工程师 | 上位机开发 | 激光雷达/智能驾驶", font=font(25, "med"), fill=(43, 92, 138))
    y += 72
    d.text((x, y), "武汉  ·  男  ·  29岁  ·  15927591476  ·  chang_yjwj2022@163.com", font=font(22), fill=(82, 91, 105))
    d.line((x, y + 48, W - x, y + 48), fill=(31, 78, 121), width=4)
    y += 78

    y = section_title(d, 88, y, "职业摘要", rule_to=W - 88)
    y = draw_text(d, (88, y), summary, 23, fill=(44, 51, 61), max_width=W - 176, line_gap=5, max_lines=3)
    y += 18

    y = section_title(d, 88, y, "核心技能", rule_to=W - 88)
    px, py = 88, y
    for s in skills:
        nx = pill(d, px, py, s, (246, 249, 252), (202, 214, 226), (34, 67, 101), h=36, size=19)
        if nx > W - 88:
            px, py = 88, py + 48
            nx = pill(d, px, py, s, (246, 249, 252), (202, 214, 226), (34, 67, 101), h=36, size=19)
        px = nx
    y = py + 66

    y = section_title(d, 88, y, "工作经历", rule_to=W - 88)
    for date, company, role in experiences:
        d.text((88, y), date, font=font(21, "med"), fill=(91, 101, 114))
        d.text((300, y), company, font=font(23, "bold"), fill=(30, 36, 45))
        d.text((690, y), role, font=font(21), fill=(59, 73, 91))
        y += 42

    y += 12
    y = section_title(d, 88, y, "项目经历", rule_to=W - 88)
    for title, date, items in projects[:3]:
        d.text((88, y), title, font=font(25, "bold"), fill=(22, 30, 41))
        d.text((W - 88 - int(d.textlength(date, font=font(20, "med"))), y + 3), date, font=font(20, "med"), fill=(91, 101, 114))
        y += 42
        for it in items[:3]:
            y = bullet(d, 94, y, it, W - 188, size=21, max_lines=2)
            y += 5
        y += 16

    y = section_title(d, 88, y, "教育经历", rule_to=W - 88)
    for date, school, major in education:
        d.text((88, y), date, font=font(20, "med"), fill=(91, 101, 114))
        d.text((300, y), school, font=font(22, "bold"), fill=(30, 36, 45))
        d.text((575, y), major, font=font(21), fill=(59, 73, 91))
        y += 38
    img.save(OUT / "01-ats-single-column.png", quality=95)


def render_04():
    img = Image.new("RGB", (W, H), (248, 250, 252))
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 250), fill=(18, 42, 68))
    d.rectangle((0, 250, W, 260), fill=(86, 146, 185))
    if ASSET.exists():
        ph = fit_cover_circle(Image.open(ASSET), 150)
        img.paste(ph, (W - 235, 55), ph)
        d.ellipse((W - 238, 52, W - 82, 208), outline=(160, 196, 218), width=4)

    d.text((76, 58), "刘唱", font=font(54, "bold"), fill=(255, 255, 255))
    d.text((76, 126), "高级 C/C++ 开发工程师 · 上位机/激光雷达/智能驾驶", font=font(27, "med"), fill=(209, 229, 240))
    d.text((76, 176), "武汉  ·  15927591476  ·  chang_yjwj2022@163.com", font=font(22), fill=(185, 207, 222))

    cards = [("70%+", "框架复用率"), ("0.001%", "点云最低丢包率"), ("3条", "产品线软件生态")]
    x = 76
    for num, lab in cards:
        d.rounded_rectangle((x, 305, x + 315, 420), radius=10, fill=(255, 255, 255), outline=(222, 229, 235), width=1)
        d.text((x + 28, 326), num, font=font(37, "bold"), fill=(18, 88, 130))
        d.text((x + 28, 376), lab, font=font(21, "med"), fill=(81, 91, 105))
        x += 355

    y = 470
    x0 = 76
    side_x = 860
    y = section_title(d, x0, y, "工程影响力摘要", color=(18, 78, 116), rule_to=side_x - 40, size=27)
    y = draw_text(d, (x0, y), summary, 23, fill=(39, 47, 57), max_width=side_x - x0 - 52, line_gap=5, max_lines=4)
    y += 22
    for title, date, items in projects[:3]:
        d.rounded_rectangle((x0, y, side_x - 40, y + 10), radius=2, fill=(204, 221, 232))
        y += 28
        d.text((x0, y), title, font=font(26, "bold"), fill=(24, 34, 45))
        d.text((x0, y + 36), date, font=font(20, "med"), fill=(89, 105, 122))
        y += 70
        for it in items[:2]:
            y = bullet(d, x0 + 4, y, it, side_x - x0 - 58, size=21, accent=(18, 92, 137), max_lines=2)
            y += 4
        y += 22

    d.rounded_rectangle((side_x, 470, W - 76, 1550), radius=12, fill=(255, 255, 255), outline=(222, 229, 235), width=1)
    sy = 506
    d.text((side_x + 34, sy), "核心能力", font=font(25, "bold"), fill=(18, 78, 116))
    sy += 54
    for s in ["软件架构重构", "高频数据IO", "跨平台Qt交叉编译", "设备Web控制", "现场系统集成", "算法Bug定位"]:
        sy = bullet(d, side_x + 36, sy, s, W - side_x - 112, size=20, accent=(18, 92, 137), max_lines=1)
        sy += 5

    sy += 28
    d.text((side_x + 34, sy), "技术栈", font=font(25, "bold"), fill=(18, 78, 116))
    sy += 54
    for s in skills[:9]:
        sy = draw_text(d, (side_x + 34, sy), s, size=20, fill=(45, 53, 64), max_width=W - side_x - 110, line_gap=1, max_lines=1)

    sy += 24
    d.text((side_x + 34, sy), "教育", font=font(25, "bold"), fill=(18, 78, 116))
    sy += 50
    for date, school, major in education:
        sy = draw_text(d, (side_x + 34, sy), school, size=19, weight="bold", fill=(45, 53, 64), max_width=W - side_x - 110, line_gap=1, max_lines=1)
        sy = draw_text(d, (side_x + 34, sy), major, size=18, fill=(65, 75, 88), max_width=W - side_x - 110, line_gap=1, max_lines=2)
        sy = draw_text(d, (side_x + 34, sy), date, size=17, fill=(102, 112, 125), max_width=W - side_x - 110, line_gap=1, max_lines=1)
        sy += 18
    img.save(OUT / "04-senior-engineer-impact.png", quality=95)


def mini_section(draw, page_x, y, title):
    draw.text((page_x + 38, y), title, font=font(17, "bold"), fill=(26, 75, 111))
    draw.line((page_x + 38, y + 25, page_x + 497, y + 25), fill=(210, 219, 228), width=1)
    return y + 38


def render_08():
    img = Image.new("RGB", (W, H), (242, 244, 247))
    d = ImageDraw.Draw(img)
    page_w, page_h = 535, 757
    for idx, px in enumerate([58, 648]):
        py = 135
        d.rectangle((px + 10, py + 12, px + page_w + 10, py + page_h + 12), fill=(213, 218, 224))
        d.rectangle((px, py, px + page_w, py + page_h), fill=(255, 255, 255))
        d.text((px, 82), f"第 {idx + 1} 页", font=font(28, "bold"), fill=(31, 42, 55))

    d.text((58, 42), "方案 8：长简历多页稳定版", font=font(34, "bold"), fill=(23, 35, 51))
    d.text((465, 49), "自然分页 · 标题不切断 · 长项目可读", font=font(22, "med"), fill=(83, 96, 112))

    def mini_text(page_x, x, y, text, size=13, weight="reg", fill=(38, 45, 55), maxw=440, lines=1):
        return draw_text(d, (page_x + x, y), text, size=size, weight=weight, fill=fill, max_width=maxw, line_gap=0, max_lines=lines, ellipsis=True)

    px, y = 58, 170
    d.text((px + 38, y), "刘唱", font=font(28, "bold"), fill=(23, 30, 39))
    d.text((px + 120, y + 8), "C/C++ 开发工程师 | 上位机开发", font=font(15, "med"), fill=(41, 86, 125))
    y += 43
    d.text((px + 38, y), "武汉 · 15927591476 · chang_yjwj2022@163.com", font=font(12), fill=(93, 102, 114))
    y += 35
    d.line((px + 38, y, px + 497, y), fill=(35, 82, 122), width=2)
    y += 22
    y = mini_section(d, px, y, "职业摘要")
    y = mini_text(px, 38, y, summary, size=12, maxw=459, lines=3)
    y += 15
    y = mini_section(d, px, y, "核心技能")
    for row in ["C/C++ · Qt5 · Linux · RK3568 · HTTP服务", "点云/IMU数据流 · 共享缓存队列 · Vue3", "卡尔曼滤波 · Chi-Square Test · 系统集成"]:
        y = mini_text(px, 45, y, row, size=12, maxw=445, lines=1)
        y += 5
    y += 8
    y = mini_section(d, px, y, "项目经历")
    for title, date, items in projects[:2]:
        d.text((px + 38, y), title, font=font(14, "bold"), fill=(30, 37, 46))
        d.text((px + 378, y), date, font=font(11, "med"), fill=(93, 102, 114))
        y += 24
        for it in items[:3]:
            d.ellipse((px + 41, y + 7, px + 45, y + 11), fill=(35, 82, 122))
            y = mini_text(px, 52, y, it, size=11, maxw=430, lines=2)
            y += 3
        y += 12

    px, y = 648, 170
    y = mini_section(d, px, y, "项目经历（续）")
    for title, date, items in projects[2:]:
        d.text((px + 38, y), title, font=font(14, "bold"), fill=(30, 37, 46))
        d.text((px + 378, y), date, font=font(11, "med"), fill=(93, 102, 114))
        y += 24
        for it in items[:3]:
            d.ellipse((px + 41, y + 7, px + 45, y + 11), fill=(35, 82, 122))
            y = mini_text(px, 52, y, it, size=11, maxw=430, lines=2)
            y += 3
        y += 12
    y = mini_section(d, px, y + 8, "工作经历")
    for date, company, role in experiences:
        d.text((px + 38, y), date, font=font(11, "med"), fill=(93, 102, 114))
        d.text((px + 150, y), company, font=font(12, "bold"), fill=(30, 37, 46))
        d.text((px + 150, y + 17), role, font=font(11), fill=(65, 75, 88))
        y += 44
    y = mini_section(d, px, y + 8, "教育经历")
    for date, school, major in education:
        d.text((px + 38, y), date, font=font(11, "med"), fill=(93, 102, 114))
        d.text((px + 150, y), school, font=font(12, "bold"), fill=(30, 37, 46))
        d.text((px + 150, y + 17), major, font=font(11), fill=(65, 75, 88))
        y += 44

    d.rounded_rectangle((58, 990, W - 58, 1635), radius=16, fill=(255, 255, 255), outline=(220, 226, 233), width=1)
    ny = 1032
    d.text((92, ny), "分页规则示意", font=font(28, "bold"), fill=(23, 35, 51))
    ny += 58
    notes = [
        "每个项目块整体参与分页，优先避免标题留在页尾、内容掉到下一页。",
        "长项目拆成“摘要 + 关键成果”两层，第一页保留最强成果，续页继续展开细节。",
        "统一单栏正文宽度、字号和行距，减少 html2canvas 导出时的压缩与模糊。",
        "适合这份内容很长的 C++ 简历：不强压一页，保证招聘方能读完项目价值。",
    ]
    for n in notes:
        d.ellipse((102, ny + 12, 112, ny + 22), fill=(26, 75, 111))
        ny = draw_text(d, (128, ny), n, size=24, fill=(49, 57, 68), max_width=W - 230, line_gap=5, max_lines=2)
        ny += 18
    img.save(OUT / "08-long-resume-multipage.png", quality=95)


if __name__ == "__main__":
    render_01()
    render_04()
    render_08()
    for name in ["01-ats-single-column.png", "04-senior-engineer-impact.png", "08-long-resume-multipage.png"]:
        print((OUT / name).resolve())
