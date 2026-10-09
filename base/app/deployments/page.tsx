import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@mmanto/devbout-ui"
import { Separator } from "@mmanto/devbout-ui"
import { SidebarTrigger } from "@mmanto/devbout-ui"

import { type Deployment } from "./deploy-dto"
import { DeploymentsTable } from "./deployments-table"

// This is sample data.
const deployments: Deployment[] = [
  { project: "acme-web", branch: "main", status: "Ready", duration: "42s" },
  { project: "acme-api", branch: "main", status: "Ready", duration: "1m 08s" },
  { project: "docs", branch: "feat/search", status: "Building", duration: "12s" },
  { project: "evil-corp", branch: "main", status: "Failed", duration: "9s" },
]

export default function Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Deployments</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DeploymentsTable data={deployments} />
      </div>
    </>
  )
}
