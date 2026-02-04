---
name: image-generator
description: AI 图片生成 - 通过 Stable Diffusion API 生成图片素材
triggers:
  - 生成图片
  - 创建图片
  - 图片素材
  - banner
  - logo
  - 插图
---

# AI 图片生成 Skill

## 功能
- 生成网站 Banner
- 生成 Logo
- 生成插图
- 生成占位图片

## 配置
在 `~/.config/opencode/credentials.json` 中配置：

```json
{
  "image_generator": {
    "enabled": true,
    "api_key": "YOUR_SD_API_KEY",
    "base_url": "https://your-sd-service.com"
  }
}
```

## 使用方式

### 生成 Banner
```
生成一个科技风格的网站 Banner，尺寸 1920x600
```

### 生成 Logo
```
生成一个简约风格的 Logo，主题是云计算
```

### 生成插图
```
生成一个扁平化风格的插图，展示团队协作
```

## 常用尺寸

| 用途 | 尺寸 |
|------|------|
| 网站 Banner | 1920x600 |
| 文章封面 | 1200x630 |
| Logo | 512x512 |
| 头像 | 256x256 |
| 缩略图 | 300x200 |

## 风格关键词

### 设计风格
- 扁平化 (flat design)
- 渐变 (gradient)
- 3D 立体 (3D render)
- 简约 (minimalist)
- 科技感 (tech, futuristic)

### 色调
- 蓝色科技 (blue tech)
- 暖色调 (warm colors)
- 冷色调 (cool colors)
- 黑金 (black and gold)

## 注意事项
- 生成的图片仅供开发测试使用
- 正式上线前请替换为正版素材
- 避免生成涉及版权的内容
