# Frontend SA
resource "google_service_account" "run_frontend_service" {
  project      = var.project_id
  account_id   = "run-frontend-service"
  display_name = "Cloud run frontend SA"
}

# Backend SA
resource "google_service_account" "run_backend_service" {
  project      = var.project_id
  account_id   = "run-backend-service"
  display_name = "Cloud run backend SA"
}

# IAM Agent SA
resource "google_service_account" "run_iam_agent_service" {
  project      = var.project_id
  account_id   = "run-iam-agent-service"
  display_name = "Cloud run IAM Agent SA"
}

# Allow backend to access VPC network
resource "google_project_iam_member" "backend_network_user" {
  project = var.project_id
  role    = "roles/compute.networkUser"
  member  = "serviceAccount:${google_service_account.run_backend_service.email}"
}

# Allow cloud run to write logs
resource "google_project_iam_member" "backend_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.run_backend_service.email}"
}

# Allow Cloud Run to access VPC network
resource "google_project_iam_member" "cloud_run_network_user" {
  project = var.project_id
  role    = "roles/compute.networkUser"
  member  = "serviceAccount:service-${data.google_project.platform_project.number}@serverless-robot-prod.iam.gserviceaccount.com"
}


# Frontend

# Service
resource "google_cloud_run_service" "eslo_frontend" {
  project  = var.project_id
  name     = var.frontend_service_name
  location = var.region

  template {
    metadata {
      name = "${var.frontend_service_name}-${var.frontend_image_tag}"
    }
    spec {
      service_account_name = google_service_account.run_frontend_service.email

      containers {
        image = "${var.docker_repository}/${var.frontend_image_name}:${var.frontend_image_tag}"

        ports {
          container_port = 80
        }
      }
    }
  }
}

# IAM
resource "google_cloud_run_service_iam_member" "frontend_allUsers" {
  project  = var.project_id
  service  = google_cloud_run_service.eslo_frontend.name
  location = google_cloud_run_service.eslo_frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}


# Backend
locals {
  backend_env_vars = distinct(concat(var.backend_env_variables, [
    {
      name  = "ESLO_APP_DATABASE_URL",
      value = "postgresql://${var.db_username}:${var.db_password}@${google_sql_database_instance.eslo_platform.ip_address.0.ip_address}/postgres?schema=public"
    }
  ]))
}


# Service
resource "google_cloud_run_service" "eslo_backend" {
  project  = var.project_id
  name     = var.backend_service_name
  location = var.region

  template {
    spec {
      service_account_name = google_service_account.run_backend_service.email

      containers {
        image = "${var.docker_repository}/${var.backend_image_name}:${var.backend_image_tag}"

        ports {
          container_port = 3000
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "1024Mi"
          }
        }

        # Environment variables
        dynamic "env" {
          for_each = var.backend_env_variables
          content {
            name  = env.value["name"]
            value = env.value["value"]
          }
        }

        env {
          name  = "K_LOCATION"
          value = var.region
        }

      }
    }

    metadata {
      name = "${var.backend_service_name}-${var.backend_image_tag}"
      annotations = {
        "autoscaling.knative.dev/minScale"        = "1"                   # minimum instances (backend always warm start)
        "run.googleapis.com/vpc-access-egress"    = "private-ranges-only" # all | private-ranges-only
        "run.googleapis.com/vpc-access-connector" = "projects/${var.serverless_vpc_project}/locations/${var.serverless_vpc_region}/connectors/${var.serverless_vpc_connector_name}"
      }
    }
  }

  metadata {
    annotations = {
      "run.googleapis.com/launch-stage" = "BETA"
    }
  }

  depends_on = [google_sql_database_instance.eslo_platform]
}

# IAM
resource "google_cloud_run_service_iam_member" "backend_allUsers" {
  project  = var.project_id
  service  = google_cloud_run_service.eslo_backend.name
  location = google_cloud_run_service.eslo_backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# IAM Agent

# Service
resource "google_cloud_run_service" "eslo_iam_agent" {
  project  = var.project_id
  name     = var.iam_agent_service_name
  location = var.region

  template {
    metadata {
      name = "${var.iam_agent_service_name}-${var.iam_agent_image_tag}"
    }
    spec {
      service_account_name = google_service_account.run_iam_agent_service.email

      containers {
        image = "${var.docker_repository}/${var.iam_agent_image_name}:${var.iam_agent_image_tag}"

        ports {
          container_port = 8181
        }

        env {
          name  = "IDENTITY_TOKEN"
          value = var.iam_agent_token
        }
      }
    }
  }
}

# TODO: allow unauthenticated access for now

# # IAM
# resource "google_cloud_run_service_iam_member" "iam_agent_backend_invoker" {
#   project  = var.project_id
#   service  = google_cloud_run_service.eslo_iam_agent.name
#   location = google_cloud_run_service.eslo_iam_agent.location
#   role     = "roles/run.invoker"
#   member   = "serviceAccount:${google_service_account.run_backend_service.email}"
# }

# IAM
resource "google_cloud_run_service_iam_member" "iam_agent_allUsers" {
  project  = var.project_id
  service  = google_cloud_run_service.eslo_iam_agent.name
  location = google_cloud_run_service.eslo_iam_agent.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
