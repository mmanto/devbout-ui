"use client"

import { DataTable } from "@mmanto/devbout-ui"

import { deployDTO, type Deployment } from "./deploy-dto"

export function DeploymentsTable({ data }: { data: Deployment[] }) {
  return <DataTable dto={deployDTO} data={data} />
}
