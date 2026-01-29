import { NavLink, useNavigate } from "react-router"
import { macroMicro } from "./questions/macro"

export default function InterviewComponent() {
  const navigate = useNavigate()
  macroMicro()

  function useDataKey(evt: React.MouseEvent<HTMLUListElement>) {
    console.log('goto problem in')
    const nextRoute = (evt.target as HTMLElement).dataset.rkey || ''
    console.log(nextRoute)
    navigate(nextRoute)
  }

  return <div className="interview-wrapper">
    <h3>面试题</h3>
    <ul>
      {/* <li id="macro-micro">宏任务/微任务调用顺序</li>
      <li id="test-link">I am a test link</li> */}
      <NavLink to={"/macro-micro"} end>宏任务/微任务调用顺序</NavLink>
      <NavLink to={"/test-link"} end>I am a test link</NavLink>
    </ul>

    <h3>use data-attribute</h3>
    <ul onClick={useDataKey}>
      <li data-rkey="macro-micro">宏任务/微任务调用顺序</li>
      <li data-rkey="test-link">I am a test link</li>
    </ul>
  </div>
}
