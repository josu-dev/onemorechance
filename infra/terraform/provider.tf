terraform {
  cloud {
    organization = "dyallab"

    workspaces {
      name = "omc-infra"
    }
  }
}
