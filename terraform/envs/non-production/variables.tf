/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

variable "project_id" {
  description = "eslo platform project id"
  type        = string
}

variable "frontend_domain" {
  description = "App domain"
  type        = string
}

variable "frontend_image_tag" {
  description = "eslo platform frontend docker image tag"
  type        = string
}

variable "backend_image_tag" {
  description = "eslo platform backend docker image tag"
  type        = string
}

variable "shared_vpc_project" {
  description = "Shared VPC project id"
  type        = string
}

variable "shared_vpc_network" {
  description = "Shared VPC network"
  type        = string
}

variable "serverless_vpc_project" {
  description = "Serverless VPC project id"
  type        = string
}

variable "serverless_vpc_region" {
  description = "Serverless VPC region"
  type        = string
}

variable "serverless_vpc_connector_name" {
  description = "Serverless VPC connector name"
  type        = string
}

variable "backend_env_variables" {
  description = "Environment variables for cloud run backend"
  type = list(object({
    name  = string
    value = string
  }))
}

variable "db_name" {
  description = "database name"
  type        = string
  default     = "platform-db"
}

variable "db_version" {
  description = "database version"
  type        = string
  default     = "POSTGRES_13"
}

variable "db_tier" {
  description = "database machine tier"
  type        = string
  default     = "db-f1-micro"
}

variable "db_availability_type" {
  description = "database availability type (zonal, regional)"
  type        = string
  default     = "ZONAL"
}

variable "db_disk_size" {
  description = "database disk size"
  type        = number
  default     = 10 # smallest disk size
}

variable "db_username" {
  description = "database username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "database password"
  type        = string
}

variable "iam_agent_image_tag" {
  description = "eslo platform opa iam agent docker image tag"
  type        = string
}

variable "iam_agent_token" {
  description = "eslo platform opa iam agent identity token"
  type        = string
}
