#####
# AWS
#####

resource "aws_instance" "omc" {
  ami                         = var.aws_ami
  instance_type               = var.aws_instance_type
  availability_zone           = var.aws_zone
  subnet_id                   = aws_subnet.omc-subnet.id
  key_name                    = "jonathan@jonathan"
  associate_public_ip_address = true

  security_groups = [
    aws_security_group.web.id,
  ]

  tags = {
    Name = "omc"
  }
}

resource "aws_key_pair" "omc" {
  key_name   = "jonathan@jonathan"
  public_key = file(var.aws_public_ssh_key)
}

data "aws_vpc" "default" {
  default = true
}

resource "aws_subnet" "omc-subnet" {
  vpc_id                  = data.aws_vpc.default.id
  availability_zone       = var.aws_zone
  cidr_block              = "172.32.0.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "omc-subnet"
  }
}

resource "aws_security_group" "web" {
  name        = "allow_web"
  description = "Allow web inbound traffic"

  // For everyone to access the web server
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // To allow SSH access to the web server
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1" // This means any protocol
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "web_traffic"
  }
}
