module "eslo_platform" {
  source = "../../modules/eslo-platform"

  project_id = var.project_id
  env_code   = "n" # non-production

  frontend_domain     = var.frontend_domain
  frontend_image_tag  = var.frontend_image_tag
  backend_image_tag   = var.backend_image_tag
  iam_agent_image_tag = var.iam_agent_image_tag

  shared_vpc_project = var.shared_vpc_project
  shared_vpc_network = var.shared_vpc_network

  serverless_vpc_project        = var.serverless_vpc_project
  serverless_vpc_region         = var.serverless_vpc_region
  serverless_vpc_connector_name = var.serverless_vpc_connector_name

  backend_env_variables = var.backend_env_variables
  db_password           = var.db_password
  iam_agent_token       = var.iam_agent_token
}
