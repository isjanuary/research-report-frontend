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
      <Outlet />
    </>
  )
}
