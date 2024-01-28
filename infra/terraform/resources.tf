## AWS

variable "aws_region" {
  description = "aws region"
  type        = string
  default     = "us-east-1"
}

variable "aws_access_key" {}
variable "aws_secret_key" {}

module "aws" {
  source = "./modules/aws"

  aws_region     = var.aws_region
  aws_access_key = var.aws_access_key
  aws_secret_key = var.aws_secret_key
}

output "instance_public_dns" {
  value       = module.aws.instance_public_dns
  description = "Public DNS of the instance"
}
