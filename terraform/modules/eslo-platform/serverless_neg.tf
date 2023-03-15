module "e2c_serverless_lb_http" {
  source  = "GoogleCloudPlatform/lb-http/google//modules/serverless_negs"
  version = "~> 4.4"

  project = var.project_id
  name    = "e2c-${var.env_code}-lb"

  ssl                             = true
  managed_ssl_certificate_domains = [var.frontend_domain]
  https_redirect                  = true

  backends = {
    default = {
      description            = null
      enable_cdn             = false
      custom_request_headers = null
      security_policy        = null


      log_config = {
        enable      = true
        sample_rate = 1.0
      }

      groups = [
        {
          # Your serverless service should have a NEG created that's referenced here.
          group = google_compute_region_network_endpoint_group.e2c_serverless_neg.id
        }
      ]

      iap_config = {
        enable               = false
        oauth2_client_id     = null
        oauth2_client_secret = null
      }
    }
  }
}

resource "google_compute_region_network_endpoint_group" "e2c_serverless_neg" {
  provider              = google-beta
  project               = var.project_id
  name                  = "e2c-${var.env_code}-serverless-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = var.frontend_service_name
  }
}
