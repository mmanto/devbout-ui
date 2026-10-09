"use client"

import { DataTable } from "@/components/data-table/data-table"

import { deployDTO, type Deployment } from "./deploy-dto"

export function DeploymentsTable({ data }: { data: Deployment[] }) {
  return <DataTable dto={deployDTO} data={data} />
}
