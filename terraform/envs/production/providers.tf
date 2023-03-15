provider "google" {
  alias = "impersonate"

  scopes = [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/userinfo.email",
  ]
}

/******************************************
  Provider credential configuration
 *****************************************/
provider "google" {
  version = "~> 3.30"
}

provider "google-beta" {
  version = "~> 3.30"
}

