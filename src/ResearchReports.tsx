import { useLoaderData } from "react-router"
import type { ServerResponse } from "./model"
import { Tree, type TreeDataNode } from "antd";
import { CheckOutlined, FlagOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

interface ServerGeneralizedReport {
  name: string;
  isDir: boolean;
  isFile: boolean;
  isRead: boolean;
  ext: string;
  isPdf: boolean;
  fileCnt: number;
  pdfCnt: number;
  pdfReadCnt: number;
  selfPath: string;
  level: number;
  parentPath: string;
  hasIndustrialReports: boolean;
}

export default function ResearchReports() {
  const { jsonData: resp }: { jsonData: ServerResponse }= useLoaderData()
  let reportList: ServerGeneralizedReport[] = []
  if (resp.code === 0) {
    reportList = resp.data.reports
  }

  //  restore reportList into tree hierarchy
  const treeData: TreeDataNode[] = buildRootNode(reportList)

  return (
    <>
      <Tree treeData={treeData} showIcon />
    </>
  )
}

function buildRootNode(reportList: ServerGeneralizedReport[]): TreeDataNode[] {
  const reportTree: Record<string, string[]> = {}
  const reportMap: Record<string, ServerGeneralizedReport> = {}
  let rootNodeKey = ''
  reportList.forEach(r => {
    const key = r.selfPath
    const parentKey = r.parentPath
    if (parentKey === '') {
      rootNodeKey = key
    }

    if (!reportTree[parentKey]) {
      reportTree[parentKey] = []
    }

    reportTree[parentKey].push(key)
    reportMap[key] = r
  })

  const rootReport = reportMap[rootNodeKey]
  const rootNode: TreeDataNode = {
    key: rootNodeKey,
    children: [],
    title: <ReadCntTitle pdfCnt={rootReport.pdfCnt} pdfReadCnt={rootReport.pdfReadCnt} name={rootNodeKey} />,
    icon: () => {
      const rootReport = reportMap[rootNodeKey]
      const icons: ReactNode[] = []
      const allPdfRead = rootReport.pdfCnt !== 0 && rootReport.pdfCnt === rootReport.pdfReadCnt
      if (allPdfRead) {
        icons.push(<CheckOutlined key="checkoutlined" style={{color: "#52c41a"}}/>)
      }

      if (rootReport.hasIndustrialReports && !allPdfRead) {
        icons.push(<FlagOutlined key="flagoutlined" style={{color: "#ff4d4f"}}/>)
      }

      return <div>{icons}</div>
    },
  }

  const q: TreeDataNode[] = [rootNode]
  while (q.length > 0) {
    const curr = q[0]
    const childrenKeys = reportTree[curr.key as string]
    if (Array.isArray(childrenKeys)) {
      childrenKeys.forEach(childKey => {
        const childReport = reportMap[childKey]
        const childNode: TreeDataNode = {
          key: childKey,
          title: <ReadCntTitle pdfCnt={childReport.pdfCnt} pdfReadCnt={childReport.pdfReadCnt} name={childReport.name} />,
          children: [],
          icon: () => {
            const icons: ReactNode[] = []
            const allPdfRead = childReport.pdfCnt !== 0 && childReport.pdfCnt === childReport.pdfReadCnt
            if (allPdfRead) {
              icons.push(<CheckOutlined key="checkoutlined" style={{color: "#52c41a"}}/>)
            }

            if (childReport.hasIndustrialReports && !allPdfRead) {
              icons.push(<FlagOutlined key="flagoutlined" style={{color: "#ff4d4f"}}/>)
            }

            return <div>{icons}</div>
          },
        }
        q.push({...childNode})
        curr.children!.push({...childNode})
      })
    }
    q.shift()
  }

  return [rootNode]
}

interface TreeNodeTitle {
  pdfCnt: number
  pdfReadCnt: number
  name: string
}

function ReadCntTitle({ pdfCnt, pdfReadCnt, name }: TreeNodeTitle) {
  return (
    <span>{name} <span style={{marginLeft: 6}}>({pdfReadCnt}/{pdfCnt})</span></span>
  )
}

export async function loader(): Promise<any> {
  const rawData = await fetch('http://localhost:5173/report/initall')
  const rawJson = await rawData.json()
  return {
    jsonData: rawJson,
    // reportList: await fetch('/report/initall'),
  }
}
