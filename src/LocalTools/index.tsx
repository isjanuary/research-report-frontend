import { Button } from 'antd'
import './index.css'
import axios from 'axios';
// import React from 'react'

const LocalToolComponent = () => {
  // blob:https://store.steampowered.com/16e6462a-bce8-4a82-b247-faca1417b867
  // https://video.fastly.steamstatic.com/store_trailers/2389040/960542782/734988f9dea29bd8cd0241321f09e4dd6763ef91/1758103723/dash_av1.mpd?t=1758106150?

  // 'blob://https:xxxx' 只是 URL.createObjectURL(fileObject) 返回的 blob URL.
  // blob URL 是一种特殊的 URL(唯一资源标识符)，是由浏览器生成的临时内存引用，指向浏览器内存的图片、视频、canvas 图像等二进制数据.
  // blob URL 本身无法下载，需要找到它对应的真实资源路径才能下载.
  // 在 steam 的场景下，steam 采用的是 MPEG-DASH 方案来管理视频，它包括：
  // 1. .m4s，即视频片段 (fragmented mp4 segments).
  // 2. .mpd，即 .m4s 文件清单，标注了所有 .m4s 的序列、顺序等等前后关系.
  // 注意：Steam does not encrypt store trailers, so ffmpeg works cleanly.
  // 我们可以用 ffmpeg 真实下载 .mpd 文件然后合并成视频，ffmpeg 会自选处理 .mpd 文件中的视频片段加载顺序. 命令如下：
  //  1.  ffmpeg -i "MPD_URL_HERE" -c copy output_file_name.mp4
  //  2.  ffmpeg -headers "Referer: https://store.steampowered.com/" -i "MPD_URL_HERE" -c copy output_file_name.mp4
  // 我们以游戏：《英雄涂鸦工厂》为例，其 .mpd 文件链接为：
  //    https://video.fastly.steamstatic.com/store_trailers/2389040/960542782/734988f9dea29bd8cd0241321f09e4dd6763ef91/1758103723/dash_av1.mpd?t=1758106150?
  // ffmpeg -i "https://video.fastly.steamstatic.com/store_trailers/2389040/960542782/734988f9dea29bd8cd0241321f09e4dd6763ef91/1758103723/dash_av1.mpd?t=1758106150" -c copy steam_trailer.mp4
  const download = function(mpdURL: string) {
    if (!mpdURL || !mpdURL.includes('.mpd')) {
      console.error('无效的 mpdURL');
      return
    }

    // const cmd = `ffmpeg -i "${mpdURL}" -c copy steam_trailer.mp4`
    // axios.post('http://localhost:5173/file/download')
    const postParams = {
      steamTrailerUrl: 'https://video.fastly.steamstatic.com/store_trailers/2389040/960542782/734988f9dea29bd8cd0241321f09e4dd6763ef91/1758103723/dash_av1.mpd?t=1758106150',
    }
    axios({
      method: 'POST',
      responseType: 'blob',
      url: 'http://localhost:5173/file/downloadmpd',
      data: {
        steamTrailerUrl: 'https://video.fastly.steamstatic.com/store_trailers/2389040/960542782/734988f9dea29bd8cd0241321f09e4dd6763ef91/1758103723/dash_av1.mpd?t=1758106150',
      },
    })
      .then(res => {
        console.log(res)
        if (res.status !== 200) {
          console.error('download mpd failed: ', res.data)
          return
        }

        const a = document.createElement('a')
        a.href = URL.createObjectURL(res.data)
        a.download = 'test2324.mp4'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      })
      .catch(err => {
        console.error(err)
      })
  }

  return (
    <section className='content-card'>
      <Button type="primary" onClick={() => download('https://video.fastly.steamstatic.com/store_trailers/2389040/960542782/734988f9dea29bd8cd0241321f09e4dd6763ef91/1758103723/dash_av1.mpd?t=1758106150')}>Download steam trailer</Button>
    </section>
  )
}

export default LocalToolComponent
