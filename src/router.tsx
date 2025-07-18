import { createBrowserRouter } from "react-router";
import App from "./App";
import ViteIntroduction from "./ViteIntroduction";
import ResearchReports from "./ResearchReports";
import { loader } from "./ResearchReports";

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        path: 'vite-intro',
        Component: ViteIntroduction,
      },
      {
        path: 'research-report',
        Component: ResearchReports,
        loader,
      },
    ],
  },
]);

export default router;
