resource "google_sql_database_instance" "eslo_platform" {
  project = var.project_id
  region  = var.region

  name                = var.db_name
  database_version    = var.db_version
  deletion_protection = false

  settings {
    tier              = var.db_tier
    availability_type = var.db_availability_type
    disk_size         = var.db_disk_size
    ip_configuration {
      ipv4_enabled    = false
      private_network = "projects/${var.shared_vpc_project}/global/networks/${var.shared_vpc_network}"
    }
  }
}

resource "google_sql_user" "postgres" {
  project  = var.project_id
  name     = var.db_username
  instance = google_sql_database_instance.eslo_platform.name
  password = var.db_password
}
