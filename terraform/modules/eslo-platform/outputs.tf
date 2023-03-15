output "eslo_frontend_name" {
  value = google_cloud_run_service.eslo_frontend.id
}

output "eslo_frontend_url" {
  value = google_cloud_run_service.eslo_frontend.status[0].url
}

output "eslo_backend_url" {
  value = google_cloud_run_service.eslo_backend.status[0].url
}