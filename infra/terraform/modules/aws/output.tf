output "instance_public_dns" {
  value       = aws_instance.omc.public_dns
  description = "Public DNS of the instance"
}
