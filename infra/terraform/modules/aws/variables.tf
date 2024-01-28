#------------------------------------------------------------------------------
# AWS
#------------------------------------------------------------------------------

variable "aws_zone" {
  description = "aws zone"
  type        = string
  default     = "us-east-1a"
}

variable "aws_region" {
  description = "aws region"
  type        = string
  default     = "us-east-1"
}

variable "aws_ami" {
  description = "ami"
  type        = string
  default     = "ami-053b0d53c279acc90"
}

variable "aws_instance_type" {
  description = "instance type"
  type        = string
  default     = "t2.micro"
}

variable "aws_public_ssh_key" {
  description = "ssh key path"
  type        = string
  default     = ""
}

variable "aws_key_name" {
  description = "ssh key name"
  type        = string
  default     = ""
}

variable "aws_access_key" {
  description = "aws access key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "aws_secret_key" {
  description = "aws secret key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "aws_security_group_id" {
  description = "aws security group id"
  type        = string
  default     = "sg-0b156e283023b9fc2"
}
