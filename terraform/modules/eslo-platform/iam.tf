resource "google_project_iam_member" "sre_project_viewer" {
  project = var.project_id
  role    = "roles/viewer"
  member  = "group:${var.gcp_sre_group}"
}
