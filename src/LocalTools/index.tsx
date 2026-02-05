import {
  Button,
  Input,
  Space,
} from 'antd'
import './index.css'
import { useState } from 'react'
import { DownloadOutlined } from '@ant-design/icons'

// TODO:  之后要实现输入一个 steam 商品页面, 程序自动抓取 steamID 及对应的 mpd 文件链接.
//        mpd 所在的 meta 在这个 DOM Node 里: div.gamehighlight_desktopcarousel.
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

  // DEPRECATED
  /*
  const downloadViaBlob = function(mpdURL: string) {
    if (!mpdURL || !mpdURL.includes('.mpd')) {
      console.error('无效的 mpdURL');
      return
    }

    // const cmd = `ffmpeg -i "${mpdURL}" -c copy steam_trailer.mp4`
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
  */

  // DEPRECATED
  // // 先弹出保存文件的对话框，再触发下载，更接近于流式的体验.
  // // blob 的方式虽然也是按流进行传输，但它会等整个视频文件传输完成以后，才弹出保存对话框，很反直觉，不太符合通常的下载体验.
  // const downloadVideoV1 = function() {
  //   const steamTrailerUrlInput = document.querySelector('#mpd-url')
  //   if (!steamTrailerUrlInput) {
  //     return
  //   }

  //   (steamTrailerUrlInput as HTMLInputElement).value = 'https://video.fastly.steamstatic.com/store_trailers/2389040/960542782/734988f9dea29bd8cd0241321f09e4dd6763ef91/1758103723/dash_av1.mpd?t=1758106150'
  //   const form = (document.querySelector('#mpd-download-form') as HTMLFormElement)
  //   form.submit()
  // }

  // const [loading, setLoading] = useState(false)
  const [steamTrailerUrl, setSteamTrailerUrl] = useState('')
  // 在 v1 方案中，从前端下载请求发出，到收到后台返回的第一个视频流 chunk 之间，仍然会有一定时间间隔，目前在 ffmpeg 未优化前，这个时间间隔在 5s 左右，之后优化 fffmpeg
  // 的逻辑有望缩减到 0.5~1s. (改了下 ffmpeg 好像还是挺慢的, 之后再研究了)
  // 因此我希望加一个 loading 状态让这个从请求发出，到第一次视频流 chunk 收到的时间更加有感，为此写了 V2.
  // V2 在 form 的基础上，把 form 嵌套在 iframe 里，通过监听 iframe 的 load 状态来确认首段 chunk 是否已经收到. (form 本身无法监听请求收到的具体时机)
  const downloadVideoV2 = function() {
    // 动态创建 form 并提交到 iframe
    const form = document.createElement('form')
    // 8083 商品直接调用 api, 而端口设置为 5173 则通过前端 proxy 配置转发, 详见 vite.config.ts
    // form.action = 'http://localhost:8083/file/downloadmpd'
    form.action = 'http://localhost:5173/file/downloadmpd'
    form.method = 'post'
    form.target = 'mpd-download-frame'; // 关键：提交到 iframe, 注意 mpd-download-frame 的值要与 iframe 的 name 属性相匹配

    // 测试用例: 'https://video.fastly.steamstatic.com/store_trailers/2389040/960542782/734988f9dea29bd8cd0241321f09e4dd6763ef91/1758103723/dash_av1.mpd?t=1758106150'
    const steamTrailerUrlInput = document.createElement('input')
    steamTrailerUrlInput.type = 'hidden'
    steamTrailerUrlInput.name = 'steamTrailerUrl'
    steamTrailerUrlInput.value = steamTrailerUrl
    form.appendChild(steamTrailerUrlInput)

    const matched = steamTrailerUrl.match(/\/\d+\//g)
    let steamID = 'video.mp4'
    if (matched && matched.length) {
      steamID = matched[0].slice(1, matched[0].length - 1)
    }
    const steamItemID = document.createElement('input')
    steamItemID.type = 'hidden'
    steamItemID.name = 'steamItemID'
    steamItemID.value = steamID
    form.appendChild(steamItemID)

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  return (
    <section className='content-card'>
      {/* <Button type="primary" onClick={() => downloadViaBlob('https://video.fastly.steamstatic.com/store_trailers/2389040/960542782/734988f9dea29bd8cd0241321f09e4dd6763ef91/1758103723/dash_av1.mpd?t=1758106150')}>Download steam trailer</Button> */}
      {/* <Button type="primary" onClick={() => downloadVideoV1()}>Download Steam trailer</Button>
      <form action="http://localhost:8083/file/downloadmpd"
            id="mpd-download-form"
            method="post">
        <input type="text" name="steamTrailerUrl" id="mpd-url" />
      </form> */}

      <p>Download Steam Trailer:</p>
      <Space.Compact style={{width: 400}}>
        <Input placeholder='Steam mpd URL' onChange={evt => setSteamTrailerUrl(evt.target.value)}></Input>
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadVideoV2()} />
      </Space.Compact>
      <iframe name="mpd-download-frame" id="id-mpd-download-frame" style={{display: 'none'}}></iframe>
    </section>
  )
}

export default LocalToolComponent
