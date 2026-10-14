# 项目公开主页

这是论文 **Test-Time Compute for Humanoid Behavior Foundation Models** 的静态项目主页。仓库名为 `bfmttc.github.io`，远程地址为 `https://github.com/bfmttc/bfmttc.github.io.git`。

页面直接使用 HTML、CSS 和 JavaScript，不需要安装依赖或执行构建。`.nojekyll` 让 GitHub Pages 直接提供这些文件。

## 本地预览与资源链接

在仓库目录执行以下命令，然后打开 `http://127.0.0.1:8765/`：

```bash
node scripts/preview.mjs
```

预览程序仅使用 Node.js 自带功能，支持视频按章节跳转，不需要安装依赖。网站在 GitHub Pages 上运行时不需要这个程序。

Paper、arXiv 和 Code 的地址集中写在 `index.html` 的资源链接区，使用 HTTPS。Paper 指向论文 PDF，arXiv 指向摘要页，Code 指向 `Gamma-Robot/bfm_ttc`。这三个链接无需 JavaScript 即可使用。

## 内容与素材来源

作者顺序、机构编号、共同贡献和通讯作者标记来自本地 `Overleaf-BFM-TTS-arxiv/main.tex`。论文正文、图表和指标来自同一份 arXiv 稿；网页没有加入未经确认的会议、发表状态或外部资源地址。

| 网页内容 | 本地来源 |
| --- | --- |
| 研究说明与跟踪、计算指标 | `Overleaf-BFM-TTS-arxiv/sections/abstract.tex`、`sections/experiments.tex`、`sections/method.tex` |
| 指令与实际执行差距的说明及对比图 | `Overleaf-BFM-TTS-arxiv/sections/introduction.tex`、`sections/method.tex`、`figures/figure1_command_execution_evidence.pdf` |
| 方法图 | `Overleaf-BFM-TTS-arxiv/figures/bfm-test-time-command-optimization.pdf` |
| 实机跟踪图 | `Overleaf-BFM-TTS-arxiv/figures/real_tracking_qualitative_no_legend.pdf` |
| 计算策略图 | `Overleaf-BFM-TTS-arxiv/figures/compute_strategy.pdf` |
| 实机成功率 | `Overleaf-BFM-TTS-arxiv/tables/downstream_real.tex` |
| 跟踪片段、完整视频与字幕 | `Code/submission_video_ttc/ttco_supplementary.mp4`、`captions.vtt`；跟踪片段取自第 34.5–54.5 秒 |
| 四项任务的对比片段 | `Code/submission_video_ttc/media/locomanipulation/task01` 至 `task04` |

图像从论文原图导出。任务视频压缩为 960×540，完整视频和跟踪片段压缩为 1280×720，保留原播放速度。完整视频保留英文解说和字幕，演示片段无音轨。

本地缺少 `task01_heft_state.mp4`，页面对此显示缺少片段，成功率仍来自论文表格。`task01_heft_original.mp4` 的容器标记为 20 秒，但只有前 445 帧能解码；网页保留这些可解码帧，共 14.83 秒，没有补造后续画面。全部网页视频均已通过完整解码检查。

字体 Inter 在本地提供，不依赖外部字体请求。字体许可随文件保存在 `assets/fonts/inter-LICENSE.txt`。

## 版式参考

完整项目视频放在作者、机构和资源链接之后。网页采用视频中的深灰蓝和铜棕色，数据表与视频章节默认收起。完整视频封面取自第 35.5 秒的跟踪演示。

页面参考了 [BeyondMimic](https://beyondmimic.github.io/)、[LucidSim](https://lucidsim.github.io/)、[OmniH2O](https://omni.human2humanoid.com/)、[HumanPlus](https://humanoid-ai.github.io/)、[Human2Humanoid](https://human2humanoid.com/)、[TWIST2](https://yanjieze.com/projects/TWIST2/)、[Diffusion Policy](https://diffusion-policy.cs.columbia.edu/) 和 [Robot Parkour Learning](https://robot-parkour.github.io/) 的标题、作者、视频展示和方法图布局。页面实现为本仓库独立编写，研究图像和演示均取自本项目。
