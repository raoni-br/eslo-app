variable "project_id" {
  description = "eslo platform project id"
  type        = string
}

variable "env_code" {
  description = "d = development, n = non-production, p = production, s = shared"
  type        = string
}

variable "region" {
  description = "Location where resources will be deployed"
  type        = string
  default     = "southamerica-east1" # default to BR-SP
}

variable "docker_repository" {
  description = "eslo docker repository"
  type        = string
  default     = "southamerica-east1-docker.pkg.dev/eslo-shared-registry-823e/eslo-docker-repository"
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

variable "frontend_domain" {
  description = "App domain"
  type        = string
}

variable "frontend_service_name" {
  description = "eslo platform frontend docker service name"
  type        = string
  default     = "eslo-frontend"
}

variable "frontend_image_name" {
  description = "eslo platform frontend docker image name"
  type        = string
  default     = "eslo-frontend"
}

variable "frontend_image_tag" {
  description = "eslo platform frontend docker image tag"
  type        = string
}

variable "backend_service_name" {
  description = "eslo platform backend docker service name"
  type        = string
  default     = "eslo-backend"
}

variable "backend_image_name" {
  description = "eslo platform backend docker image name"
  type        = string
  default     = "eslo-backend"
}

variable "backend_image_tag" {
  description = "eslo platform backend docker image tag"
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

# IAM Agent
variable "iam_agent_service_name" {
  description = "eslo platform iam-agent docker service name"
  type        = string
  default     = "eslo-iam-agent"
}

variable "iam_agent_image_name" {
  description = "eslo platform iam-agent docker image name"
  type        = string
  default     = "opa-iam-agent"
}

variable "iam_agent_image_tag" {
  description = "eslo platform iam-agent docker image tag"
  type        = string
}

variable "iam_agent_token" {
  description = "eslo platform opa iam agent identity token"
  type        = string
}

variable "gcp_sre_group" {
  description = "Google group for eslo SRE admins"
  type        = string
  default     = "gcp.sre-admin@eslo.com.br"
}
