import { Menu, type MenuProps } from "antd"
import { useState } from "react"
import {
  NavLink,
  Outlet,
} from "react-router"

type MenuItem = Required<MenuProps>['items'][number]

const items: MenuItem[] = [
  {
    label: <NavLink to={"/vite-intro"} end>Vite Demo</NavLink>,
    key: 'vite-intro',
  },
  {
    label: <NavLink to={"/research-report"} end>Reports Overview</NavLink>,
    key: 'research-report',
  },
  {
    label: <NavLink to={"/interview-questions"}>Interview Questions</NavLink>,
    key: 'interview-questions',
  },
  {
    label: <NavLink to={"/local-tools"}>Local Tools</NavLink>,
    key: 'local-tools',
  },
]

const pathnames = window.location.pathname
const initRoute = pathnames.split('/').length > 1 ? pathnames.split('/')[1] : ''
// console.log('initRoute: ', initRoute, pathnames, pathnames.split('/'))
const defaultSelectedKeys: string[] = [initRoute]

export default function App() {
  const [current, setCurrent] = useState(initRoute)
  const onClick: MenuProps['onClick'] = e => {
    setCurrent(e.key)
  }

  return (
    <>
      <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} defaultSelectedKeys={defaultSelectedKeys} />
      <div className='content-container'>
        <Outlet />
      </div>
    </>
  )
}
